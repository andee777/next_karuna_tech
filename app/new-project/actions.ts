'use server';

import { Resend } from 'resend';
import { getDb } from '@/lib/db';

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

  // The database is the source of truth — the row must be saved for this to
  // count as a success. Not configured yet — fail soft instead of throwing,
  // so the page still works (with a helpful fallback) before it's set up.
  // See README.
  const sql = getDb();
  if (!sql) {
    console.error('submitProjectInquiry: DATABASE_URL is not set');
    return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
  }

  try {
    await sql`
      insert into project_inquiries (name, email, company, project_type, budget, message)
      values (${name}, ${email}, ${company || null}, ${projectType || null}, ${budget || null}, ${message})
    `;
  } catch (err) {
    console.error('submitProjectInquiry: database insert failed', err);
    return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
  }

  // Email notification is best-effort from here on — the inquiry is already
  // saved, so a failure to notify shouldn't fail the whole submission.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('submitProjectInquiry: RESEND_API_KEY is not set, skipping notification email');
  } else {
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

      if (error) console.error('submitProjectInquiry: Resend returned an error', error);
    } catch (err) {
      console.error('submitProjectInquiry: unexpected error sending notification email', err);
    }
  }

  return {
    status: 'success',
    message: "Thanks — we've got your message and will respond within 48 hours.",
  };
}
