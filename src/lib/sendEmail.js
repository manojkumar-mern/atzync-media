import { generateOwnerEmailHTML, generateClientEmailHTML } from './emailTemplates.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ATZYNC MEDIA <bookings@atzyncmedia.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.STUDIO_OWNER_EMAIL || 'atzyncmedia@gmail.com';

/**
 * Helper to post email payload to Resend REST API
 */
async function sendResendMail({ to, subject, html, replyTo }) {
  if (!RESEND_API_KEY) {
    console.warn('[Resend Warning]: RESEND_API_KEY is missing.');
    return { success: false, error: 'Missing API key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn(`[Resend Warning ${res.status}]:`, data);
      return { success: false, status: res.status, data };
    }

    console.log(`[Resend Success]: Email delivered to ${to}, ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Resend Network Error]:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends both owner notification and client confirmation emails
 */
export async function sendBookingEmails(inquiry) {
  const results = { ownerEmail: null, clientEmail: null };

  // 1. Send Notification Email to Studio Owner (atzyncmedia@gmail.com) with Reply-To set to Client
  const ownerSubject = `NEW PROJECT BOOKING: ${inquiry.clientName} - ${inquiry.serviceType} [${inquiry.inquiryId}]`;
  const ownerHTML = generateOwnerEmailHTML(inquiry);

  const ownerRes = await sendResendMail({
    to: [ADMIN_EMAIL],
    subject: ownerSubject,
    html: ownerHTML,
    replyTo: inquiry.email,
  });
  results.ownerEmail = ownerRes;

  // 2. Send Registration & Thank You Confirmation Email to Client
  const clientSubject = `PROJECT INQUIRY CONFIRMED - ATZYNC MEDIA [Ref: ${inquiry.inquiryId}]`;
  const clientHTML = generateClientEmailHTML(inquiry);

  const clientRes = await sendResendMail({
    to: [inquiry.email],
    subject: clientSubject,
    html: clientHTML,
  });
  results.clientEmail = clientRes;

  return results;
}
