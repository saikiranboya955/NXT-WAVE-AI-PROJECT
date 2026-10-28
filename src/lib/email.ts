/**
 * ==============================================================================
 * NXTWAVE AI PROJECT PASSPORT: EMAIL NOTIFICATION SERVICE
 * Path: src/lib/email.ts
 *
 * Provides email payload generation, template formatting, and secure server-side
 * delivery coordination for workshop registrations.
 *
 * Security & Reliability Principles:
 * 1. Never stores or logs API keys, student emails, or PII.
 * 2. Idempotent: Never sends duplicate emails for existing registrations.
 * 3. Graceful fallback: If email service is not configured, registration remains
 *    100% successful and reports emailStatus as 'unconfigured' or 'pending'.
 * ==============================================================================
 */

export type EmailDeliveryStatus =
  | 'sent'
  | 'pending'
  | 'unconfigured'
  | 'skipped_duplicate'
  | 'failed';

export interface EmailPayload {
  registrationId: string;
  name: string;
  email: string;
  college: string;
  graduationYear: string | number;
  projectId?: string;
  alreadyRegistered?: boolean;
}

export interface EmailDeliveryResult {
  success: boolean;
  emailStatus: EmailDeliveryStatus;
  message: string;
}

const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  'resume-feedback': 'Resume Feedback Assistant',
  'expense-analyzer': 'Student Expense Analyzer',
  'notes-summarizer': 'Study Notes Summarizer',
  'faq-assistant': 'Campus FAQ Assistant',
};

export function getProjectDisplayName(projectId?: string): string {
  if (!projectId) return 'AI Project Starter Track';
  return PROJECT_DISPLAY_NAMES[projectId] || projectId;
}

/**
 * Builds the plain-text email body following the official NxtWave specification.
 */
export function buildConfirmationEmailText(payload: EmailPayload): string {
  const projectName = getProjectDisplayName(payload.projectId);

  return `Hi ${payload.name},

Thank you for registering for NxtWave AI Project Passport.

Your registration for the 'Build Your First AI Project in 60 Minutes' initiative has been received successfully.

What happens next?
- Keep an eye on your inbox for confirmed workshop details and further instructions.
- Prepare to explore a beginner-friendly AI project and build your first working version.
- If additional guidance or follow-up is available, the team will share the relevant details through official communication.

Registration details:
- Name: ${payload.name}
- College: ${payload.college}
- Graduation year: ${payload.graduationYear}
- Selected project: ${projectName}

We look forward to helping you take your next step in AI project building.

Regards,
NxtWave AI Project Passport Team`;
}

/**
 * Builds a clean, responsive HTML email body with NxtWave brand palette:
 * Jet Black (#000000), Cerulean Blue (#007BA7), and crisp typography.
 */
export function buildConfirmationEmailHtml(payload: EmailPayload): string {
  const projectName = getProjectDisplayName(payload.projectId);
  const safeName = escapeHtml(payload.name);
  const safeCollege = escapeHtml(payload.college);
  const safeGradYear = escapeHtml(String(payload.graduationYear));
  const safeProject = escapeHtml(projectName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Registration Is Confirmed | NxtWave AI Project Passport</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000;margin:0;padding:40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background-color:#0A0A0A;border:1px solid #1E1E1E;border-radius:16px;overflow:hidden;padding:0;" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td style="padding:32px 36px 20px 36px;border-bottom:1px solid #1E1E1E;background-color:#0A0A0A;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">NXT<span style="color:#007BA7;">WAVE</span></span>
                    <div style="font-size:11px;font-family:monospace;letter-spacing:1px;color:#007BA7;text-transform:uppercase;margin-top:4px;">AI PROJECT PASSPORT</div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 10px;border-radius:20px;background-color:rgba(0,123,167,0.15);border:1px solid rgba(0,123,167,0.4);color:#007BA7;font-size:11px;font-weight:600;">
                      SEAT CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px;line-height:1.6;font-size:15px;color:#E0E0E0;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#FFFFFF;font-weight:600;">Hi ${safeName},</p>
              
              <p style="margin:0 0 16px 0;">Thank you for registering for <strong>NxtWave AI Project Passport</strong>.</p>
              
              <p style="margin:0 0 24px 0;">Your registration for the <strong>‘Build Your First AI Project in 60 Minutes’</strong> initiative has been received successfully.</p>
              
              <!-- Next Steps Card -->
              <div style="background-color:#111111;border:1px solid #222222;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px 0;font-size:14px;color:#007BA7;text-transform:uppercase;letter-spacing:0.5px;">What happens next?</h3>
                <ul style="margin:0;padding-left:18px;color:#CCCCCC;font-size:13px;line-height:1.7;">
                  <li style="margin-bottom:6px;">Keep an eye on your inbox for confirmed workshop details and further instructions.</li>
                  <li style="margin-bottom:6px;">Prepare to explore a beginner-friendly AI project and build your first working version.</li>
                  <li>If additional guidance or follow-up is available, the team will share the relevant details through official communication.</li>
                </ul>
              </div>

              <!-- Registration Details Card -->
              <div style="background-color:#0D0D0D;border:1px solid #1E1E1E;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <h3 style="margin:0 0 14px 0;font-size:12px;font-family:monospace;color:#888888;text-transform:uppercase;letter-spacing:1px;">Registration details</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;">
                  <tr>
                    <td style="padding:4px 0;color:#888888;width:130px;">Name:</td>
                    <td style="padding:4px 0;color:#FFFFFF;font-weight:600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#888888;">College:</td>
                    <td style="padding:4px 0;color:#FFFFFF;">${safeCollege}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#888888;">Graduation year:</td>
                    <td style="padding:4px 0;color:#FFFFFF;">${safeGradYear}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#888888;">Selected project:</td>
                    <td style="padding:4px 0;color:#007BA7;font-weight:600;">${safeProject}</td>
                  </tr>
                </table>
              </div>

              <p style="margin:0 0 24px 0;color:#B0B0B0;font-size:14px;">We look forward to helping you take your next step in AI project building.</p>

              <p style="margin:0;color:#FFFFFF;font-weight:600;">Regards,<br><span style="color:#007BA7;font-weight:bold;">NxtWave AI Project Passport Team</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px;border-top:1px solid #1A1A1A;background-color:#050505;text-align:center;font-size:11px;color:#555555;">
              <p style="margin:0 0 4px 0;">This email was sent to confirm your seat for the free NxtWave AI workshop.</p>
              <p style="margin:0;">&copy; 2026 NxtWave. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
