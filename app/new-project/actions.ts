'use server';

import { Resend } from 'resend';

export interface ProjectInquiryState {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_CONTACT_MESSAGE =
  "We couldn't send your message right now — please email us directly at info@karunatech.ca instead.";

export async function submitProjectInquiry(
  _prevState: ProjectInquiryState,
  formData: FormData
): Promise<ProjectInquiryState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const projectType = String(formData.get('projectType') ?? '').trim();
  const budget = String(formData.get('budget') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  const fieldErrors: ProjectInquiryState['fieldErrors'] = {};
  if (!name) fieldErrors.name = 'Please enter your name.';
  if (!email) fieldErrors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Please enter a valid email address.';
  if (!message) fieldErrors.message = 'Tell us a bit about your project.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields below.', fieldErrors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — fail soft instead of throwing, so the page still works
    // (with a helpful fallback) before RESEND_API_KEY is set up. See README.
    console.error('submitProjectInquiry: RESEND_API_KEY is not set');
    return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
  }

  const to = process.env.CONTACT_TO_EMAIL || 'info@karunatech.ca';
  // Resend's shared test sender — works without a verified domain, but Resend
  // will only actually deliver it to the account owner's own inbox. Swap in a
  // verified domain address via CONTACT_FROM_EMAIL for real production delivery.
  const from = process.env.CONTACT_FROM_EMAIL || 'Karuna Technologies <onboarding@resend.dev>';

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        company && `Company: ${company}`,
        projectType && `Project type: ${projectType}`,
        budget && `Budget: ${budget}`,
        '',
        message,
      ].filter(Boolean).join('\n'),
    });

    if (error) {
      console.error('submitProjectInquiry: Resend returned an error', error);
      return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
    }
  } catch (err) {
    console.error('submitProjectInquiry: unexpected error sending email', err);
    return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
  }

  return {
    status: 'success',
    message: "Thanks — we've got your message and will respond within 48 hours.",
  };
}
