'use server';

import { Resend } from 'resend';
import { getDb } from '@/lib/db';

export interface DiscoveryCallState {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'preferredDate' | 'preferredTime', string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_MESSAGE =
  "We couldn't save your request right now — please email us directly at info@karunatech.ca instead.";

export async function submitDiscoveryCallRequest(
  _prevState: DiscoveryCallState,
  formData: FormData
): Promise<DiscoveryCallState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const preferredDate = String(formData.get('preferredDate') ?? '').trim();
  const preferredTime = String(formData.get('preferredTime') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  const fieldErrors: DiscoveryCallState['fieldErrors'] = {};
  if (!name) fieldErrors.name = 'Please enter your name.';
  if (!email) fieldErrors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Please enter a valid email address.';
  if (!preferredDate) fieldErrors.preferredDate = 'Pick a date.';
  if (!preferredTime) fieldErrors.preferredTime = 'Pick a time.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields below.', fieldErrors };
  }

  // The database is the source of truth for the booking request. Not
  // configured yet — fail soft instead of throwing, matching the
  // project-inquiry form.
  const sql = getDb();
  if (!sql) {
    console.error('submitDiscoveryCallRequest: DATABASE_URL is not set');
    return { status: 'error', message: FALLBACK_MESSAGE };
  }

  try {
    await sql`
      insert into discovery_call_requests (name, email, preferred_date, preferred_time, notes)
      values (${name}, ${email}, ${preferredDate}, ${preferredTime}, ${notes || null})
    `;
  } catch (err) {
    console.error('submitDiscoveryCallRequest: database insert failed', err);
    return { status: 'error', message: FALLBACK_MESSAGE };
  }

  // Confirmation email to the customer is best-effort — the request is
  // already saved, so a failure to send it shouldn't fail the submission.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('submitDiscoveryCallRequest: RESEND_API_KEY is not set, skipping confirmation email');
  } else {
    const formattedDate = new Date(`${preferredDate}T00:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || 'Karuna Technologies <onboarding@resend.dev>',
        to: email,
        // Replies to the confirmation land in the studio inbox, not back at the customer.
        replyTo: process.env.CONTACT_TO_EMAIL || 'info@karunatech.ca',
        subject: "We've received your discovery call request — Karuna Technologies",
        text: [
          `Hi ${name},`,
          '',
          "Thanks for requesting a discovery call — we've got your request and will "
            + 'confirm the time (or suggest alternatives if needed) by email within one business day.',
          '',
          `Requested: ${formattedDate} at ${preferredTime} (Eastern Time)`,
          ...(notes ? [`Notes: ${notes}`] : []),
          '',
          "If you'd like to change anything, just reply to this email.",
          '',
          '— Karuna Technologies',
        ].join('\n'),
      });

      if (error) console.error('submitDiscoveryCallRequest: Resend returned an error', error);
    } catch (err) {
      console.error('submitDiscoveryCallRequest: unexpected error sending confirmation email', err);
    }
  }

  return {
    status: 'success',
    message: "Request received — we'll confirm your time by email within one business day.",
  };
}
