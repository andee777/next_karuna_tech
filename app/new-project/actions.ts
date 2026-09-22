'use server';

import { Resend } from 'resend';
import { getDb } from '@/lib/db';

export interface ProjectInquiryState {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'message' | 'phone', string>>;
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
  const phone = String(formData.get('phone') ?? '').trim();
  const preferredContact = String(formData.get('preferredContact') ?? '').trim() || 'Email';
  const company = String(formData.get('company') ?? '').trim();
  const projectType = String(formData.get('projectType') ?? '').trim();
  const budget = String(formData.get('budget') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  const fieldErrors: ProjectInquiryState['fieldErrors'] = {};
  if (!name) fieldErrors.name = 'Please enter your name.';
  if (!email) fieldErrors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Please enter a valid email address.';
  if (!message) fieldErrors.message = 'Tell us a bit about your project.';
  if (preferredContact === 'Phone' && !phone) {
    fieldErrors.phone = "Add a phone number, or switch your preferred contact method to email.";
  }

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
      insert into project_inquiries (name, email, phone, preferred_contact, company, project_type, budget, message)
      values (${name}, ${email}, ${phone || null}, ${preferredContact}, ${company || null}, ${projectType || null}, ${budget || null}, ${message})
    `;
  } catch (err) {
    console.error('submitProjectInquiry: database insert failed', err);
    return { status: 'error', message: FALLBACK_CONTACT_MESSAGE };
  }

  // Both emails from here on are best-effort — the inquiry is already saved,
  // so a failure to send either one shouldn't fail the whole submission.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('submitProjectInquiry: RESEND_API_KEY is not set, skipping emails');
  } else {
    // Resend's shared test sender — works without a verified domain, but Resend
    // will only actually deliver it to the account owner's own inbox. Swap in a
    // verified domain address via CONTACT_FROM_EMAIL for real production delivery.
    const from = process.env.CONTACT_FROM_EMAIL || 'Karuna Technologies <onboarding@resend.dev>';
    const resend = new Resend(apiKey);

    const details = [
      phone && `Phone: ${phone}`,
      `Preferred contact: ${preferredContact}`,
      company && `Company: ${company}`,
      projectType && `Project type: ${projectType}`,
      budget && `Budget: ${budget}`,
    ].filter(Boolean).join('\n');

    // Confirmation to the customer. Replies land in the studio inbox, not back
    // at the customer.
    try {
      const { error } = await resend.emails.send({
        from,
        to: email,
        replyTo: process.env.CONTACT_TO_EMAIL || 'info@karunatech.ca',
        subject: "We've received your project inquiry — Karuna Technologies",
        text: [
          `Hi ${name},`,
          '',
          "Thanks for reaching out — we've received your project inquiry and will "
            + 'respond within 48 hours with a tailored plan and honest estimate.',
          '',
          "Here's what you sent us:",
          '',
          details,
          message,
          '',
          "If you'd like to add or change anything, just reply to this email.",
          '',
          '— Karuna Technologies',
        ].join('\n'),
      });

      if (error) console.error('submitProjectInquiry: Resend returned an error (customer email)', error);
    } catch (err) {
      console.error('submitProjectInquiry: unexpected error sending confirmation email', err);
    }

    // Notification to the site owner, independent of whether the customer
    // email above succeeded. Reply-to is the customer, so replying goes
    // straight back to them.
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
      console.error('submitProjectInquiry: OWNER_EMAIL is not set, skipping owner notification');
    } else {
      try {
        const { error } = await resend.emails.send({
          from,
          to: ownerEmail,
          replyTo: email,
          subject: `New project inquiry from ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            details,
            '',
            message,
          ].join('\n'),
        });

        if (error) console.error('submitProjectInquiry: Resend returned an error (owner email)', error);
      } catch (err) {
        console.error('submitProjectInquiry: unexpected error sending owner notification', err);
      }
    }
  }

  return {
    status: 'success',
    message: "Thanks — we've got your message and will respond within 48 hours.",
  };
}
