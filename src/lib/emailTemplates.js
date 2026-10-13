/**
 * High-End Dark Cinematic Email Templates for ATZYNC MEDIA
 */

export function generateOwnerEmailHTML(inquiry) {
  const cleanPhone = inquiry.phone.replace(/[^0-9+]/g, '');
  const whatsappUrl = cleanPhone.startsWith('+')
    ? `https://wa.me/${cleanPhone.replace('+', '')}`
    : `https://wa.me/91${cleanPhone}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project Booking Alert - ATZYNC MEDIA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050608; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050608; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #0b0d12; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 36px; background: linear-gradient(180deg, #12151f 0%, #0b0d12 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(235, 94, 40, 0.15); color: #eb5e28; border: 1px solid rgba(235, 94, 40, 0.4); font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">
                      ⚡ NEW PROJECT BOOKING
                    </span>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
                      ${inquiry.clientName}
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #8f92a1; font-weight: 500;">
                      Ref ID: <span style="color: #ffffff; font-family: monospace;">${inquiry.inquiryId}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client Details Table -->
          <tr>
            <td style="padding: 32px 36px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #eb5e28; margin: 0 0 20px 0;">
                CLIENT & PROJECT SPECIFICATIONS
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px 8px 0 0; width: 35%; font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Full Name
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px 8px 0 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                    ${inquiry.clientName}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 600; color: #ffffff;">
                    <a href="mailto:${inquiry.email}" style="color: #ffffff; text-decoration: underline;">${inquiry.email}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Phone / WhatsApp
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 600; color: #25d366;">
                    <a href="${whatsappUrl}" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 700;">${inquiry.phone} ↗</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Company / Brand
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 600; color: #ffffff;">
                    ${inquiry.companyName || 'Not specified'}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Service Type
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 700; color: #ffffff;">
                    ${inquiry.serviceType}
                  </td>
                </tr>

                ${inquiry.footageLink ? `
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; color: #8f92a1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Footage / Link
                  </td>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 600; color: #ffffff; word-break: break-all;">
                    <a href="${inquiry.footageLink}" target="_blank" style="color: #eb5e28; text-decoration: underline;">View Assets ↗</a>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Project Description Block -->
              <div style="margin-top: 24px; padding: 20px; background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px;">
                <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8f92a1;">
                  PROJECT BRIEF / INSTRUCTIONS
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d0d3e0; white-space: pre-wrap;">${inquiry.description}</p>
              </div>

              <!-- Quick Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td align="center" style="padding-right: 8px; width: 50%;">
                    <a href="mailto:${inquiry.email}?subject=ATZYNC%20MEDIA%20-%20Project%20Inquiry%20${inquiry.inquiryId}" style="display: block; padding: 14px 20px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 30px; text-align: center;">
                      Reply via Email →
                    </a>
                  </td>
                  <td align="center" style="padding-left: 8px; width: 50%;">
                    <a href="${whatsappUrl}" target="_blank" style="display: block; padding: 14px 20px; background-color: #25d366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 30px; text-align: center;">
                      Chat on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #07080b; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #666670; letter-spacing: 0.06em;">
                ATZYNC MEDIA PRODUCTION SUITE • AUTOMATED SYSTEM ALERT
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateClientEmailHTML(inquiry) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Confirmation - ATZYNC MEDIA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050608; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050608; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #0b0d12; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 40px; background: linear-gradient(180deg, #121520 0%, #0b0d12 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <a href="https://atzyncmedia.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <img
                  src="https://atzyncmedia.com/logo-white.webp"
                  alt="ATZYNC MEDIA"
                  width="210"
                  style="display: block; margin: 0 auto; height: auto; max-width: 210px; width: 100%; border: 0; outline: none;"
                />
              </a>
              <p style="margin: 12px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #8f92a1;">
                WE CREATE • WE PROMOTE • WE GROW BRANDS
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.06); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.18); font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px;">
                ✔ REGISTRATION CONFIRMED
              </span>

              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Thank you for reaching out, ${inquiry.clientName}.
              </h2>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #c4c7d4;">
                Your project inquiry has been successfully registered with our studio team under Reference ID: <strong style="color: #ffffff; font-family: monospace;">${inquiry.inquiryId}</strong>.
              </p>

              <!-- Brief Summary Box -->
              <div style="background-color: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #eb5e28;">
                  YOUR INQUIRY SUMMARY
                </h3>
                <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 4px 0; color: #8f92a1; width: 40%;">Service Requested:</td>
                    <td style="padding: 4px 0; color: #ffffff; font-weight: 600;">${inquiry.serviceType}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps Roadmap -->
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #ffffff;">
                WHAT HAPPENS NEXT?
              </h3>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: rgba(235, 94, 40, 0.15); border: 1px solid #eb5e28; color: #eb5e28; font-size: 12px; font-weight: 800; text-align: center; line-height: 26px;">
                            01
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff;">Creative Brief Assessment</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #8f92a1; line-height: 1.45;">Our creative director and post-production leads review your requirements and visual specifications.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 26px;">
                            02
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff;">Direct WhatsApp / Email Contact</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #8f92a1; line-height: 1.45;">We will reach out via WhatsApp or Email within 24 hours to align on concept direction, timeline & quote.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td>
                    <table width="100%">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 26px;">
                            03
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff;">Production Kickoff</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #8f92a1; line-height: 1.45;">Once aligned, production & post-production work begins immediately with dedicated milestone delivery.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Direct WhatsApp Connect Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/919597127710" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #25d366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 30px;">
                      Need Instant Assistance? Connect on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sign-off -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Thomash Murugesan</p>
                <p style="margin: 0; font-size: 12px; color: #8f92a1;">Founder & Creative Director — ATZYNC MEDIA</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #8f92a1;">
                  <a href="mailto:atzyncmedia@gmail.com" style="color: #eb5e28; text-decoration: none;">atzyncmedia@gmail.com</a> • +91 9597127710
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #07080b; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #666670; letter-spacing: 0.08em; text-transform: uppercase;">
                © ${new Date().getFullYear()} ATZYNC MEDIA. ALL RIGHTS RESERVED.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
