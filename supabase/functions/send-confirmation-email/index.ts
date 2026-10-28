// ==============================================================================
// NXTWAVE AI PROJECT PASSPORT: SERVER-SIDE CONFIRMATION EMAIL EDGE FUNCTION
// Path: supabase/functions/send-confirmation-email/index.ts
//
// Reliable, idempotent email delivery service for workshop registrations.
// Never exposes API keys, SMTP secrets, or student PII.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  registrationId: string;
  name: string;
  email: string;
  college: string;
  graduationYear: string | number;
  projectId?: string;
  alreadyRegistered?: boolean;
}

const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  "resume-feedback": "Resume Feedback Assistant",
  "expense-analyzer": "Student Expense Analyzer",
  "notes-summarizer": "Study Notes Summarizer",
  "faq-assistant": "Campus FAQ Assistant",
};

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: EmailRequest = await req.json();

    const {
      registrationId,
      name,
      email,
      college,
      graduationYear,
      projectId,
      alreadyRegistered,
    } = payload;

    // 2. Validate payload presence
    if (!registrationId || !email || !name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required registration parameters.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Prevent duplicate email delivery (Idempotent safeguard)
    if (alreadyRegistered) {
      return new Response(
        JSON.stringify({
          success: true,
          emailStatus: "skipped_duplicate",
          message: "Existing registration detected; duplicate confirmation email skipped.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Connect to Supabase with Service Role to check and update status
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    let supabase = null;

    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check if email was already marked sent in DB for this registration
      const { data: existingReg } = await supabase
        .from("registrations")
        .select("confirmation_email_status")
        .eq("id", registrationId)
        .maybeSingle();

      if (existingReg?.confirmation_email_status === "sent") {
        return new Response(
          JSON.stringify({
            success: true,
            emailStatus: "skipped_duplicate",
            message: "Email already recorded as sent for this registration.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Inspect server-side email provider configuration
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "NxtWave AI Project Passport <confirmations@nxtwave.tech>";

    // If no email provider secret is configured on the server
    if (!resendApiKey && !sendgridApiKey) {
      if (supabase) {
        await supabase
          .from("registrations")
          .update({ confirmation_email_status: "unconfigured" })
          .eq("id", registrationId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          emailStatus: "unconfigured",
          message: "Email service provider credentials not configured on server. Registration confirmed in database.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Format Content
    const projectName = (projectId && PROJECT_DISPLAY_NAMES[projectId]) || "AI Project Starter Track";

    const textContent = `Hi ${name},

Thank you for registering for NxtWave AI Project Passport.

Your registration for the 'Build Your First AI Project in 60 Minutes' initiative has been received successfully.

What happens next?
- Keep an eye on your inbox for confirmed workshop details and further instructions.
- Prepare to explore a beginner-friendly AI project and build your first working version.
- If additional guidance or follow-up is available, the team will share the relevant details through official communication.

Registration details:
- Name: ${name}
- College: ${college}
- Graduation year: ${graduationYear}
- Selected project: ${projectName}

We look forward to helping you take your next step in AI project building.

Regards,
NxtWave AI Project Passport Team`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000;margin:0;padding:40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background-color:#0A0A0A;border:1px solid #1E1E1E;border-radius:16px;overflow:hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding:32px 36px 20px 36px;border-bottom:1px solid #1E1E1E;">
              <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">NXT<span style="color:#007BA7;">WAVE</span></span>
              <div style="font-size:11px;font-family:monospace;letter-spacing:1px;color:#007BA7;text-transform:uppercase;margin-top:4px;">AI PROJECT PASSPORT</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;line-height:1.6;font-size:15px;color:#E0E0E0;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#FFFFFF;font-weight:600;">Hi ${name},</p>
              <p style="margin:0 0 16px 0;">Thank you for registering for <strong>NxtWave AI Project Passport</strong>.</p>
              <p style="margin:0 0 24px 0;">Your registration for the <strong>‘Build Your First AI Project in 60 Minutes’</strong> initiative has been received successfully.</p>
              <div style="background-color:#111111;border:1px solid #222222;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px 0;font-size:14px;color:#007BA7;text-transform:uppercase;letter-spacing:0.5px;">What happens next?</h3>
                <ul style="margin:0;padding-left:18px;color:#CCCCCC;font-size:13px;line-height:1.7;">
                  <li style="margin-bottom:6px;">Keep an eye on your inbox for confirmed workshop details and further instructions.</li>
                  <li style="margin-bottom:6px;">Prepare to explore a beginner-friendly AI project and build your first working version.</li>
                  <li>If additional guidance or follow-up is available, the team will share the relevant details through official communication.</li>
                </ul>
              </div>
              <div style="background-color:#0D0D0D;border:1px solid #1E1E1E;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <h3 style="margin:0 0 14px 0;font-size:12px;font-family:monospace;color:#888888;text-transform:uppercase;letter-spacing:1px;">Registration details</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;">
                  <tr><td style="padding:4px 0;color:#888888;width:130px;">Name:</td><td style="padding:4px 0;color:#FFFFFF;font-weight:600;">${name}</td></tr>
                  <tr><td style="padding:4px 0;color:#888888;">College:</td><td style="padding:4px 0;color:#FFFFFF;">${college}</td></tr>
                  <tr><td style="padding:4px 0;color:#888888;">Graduation year:</td><td style="padding:4px 0;color:#FFFFFF;">${graduationYear}</td></tr>
                  <tr><td style="padding:4px 0;color:#888888;">Selected project:</td><td style="padding:4px 0;color:#007BA7;font-weight:600;">${projectName}</td></tr>
                </table>
              </div>
              <p style="margin:0 0 24px 0;color:#B0B0B0;font-size:14px;">We look forward to helping you take your next step in AI project building.</p>
              <p style="margin:0;color:#FFFFFF;font-weight:600;">Regards,<br><span style="color:#007BA7;font-weight:bold;">NxtWave AI Project Passport Team</span></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 7. Dispatch Email via Provider
    let emailSent = false;

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [email],
          subject: "Your Registration Is Confirmed | NxtWave AI Project Passport",
          text: textContent,
          html: htmlContent,
        }),
      });

      emailSent = res.ok;
    } else if (sendgridApiKey) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: emailFrom },
          subject: "Your Registration Is Confirmed | NxtWave AI Project Passport",
          content: [
            { type: "text/plain", value: textContent },
            { type: "text/html", value: htmlContent },
          ],
        }),
      });

      emailSent = res.ok;
    }

    // 8. Update DB with delivery result (Safe, sanitized logging)
    if (supabase) {
      await supabase
        .from("registrations")
        .update({
          confirmation_email_status: emailSent ? "sent" : "failed",
          confirmation_email_sent_at: emailSent ? new Date().toISOString() : null,
        })
        .eq("id", registrationId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailStatus: emailSent ? "sent" : "failed",
        message: emailSent
          ? "Confirmation email sent successfully."
          : "Email provider dispatch failed. Registration remains securely confirmed.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    // Sanitize error logging: never expose student PII or credentials
    return new Response(
      JSON.stringify({
        success: true,
        emailStatus: "failed",
        message: "Email dispatch encountered an error. Registration is confirmed.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
