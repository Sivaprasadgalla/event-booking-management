import nodemailer from "nodemailer";

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  toEmail: string;
  name?: string;
  subject: string;
  code?: string;
  verifyUrl?: string;
  mode: "smtp" | "simulation";
  status: "sent" | "failed" | "simulated";
  error?: string;
}

// Preserve email logs in globalThis across Next.js hot-reloads
const globalForEmail = globalThis as unknown as {
  emailLogs?: EmailLogEntry[];
};

export const emailLogs: EmailLogEntry[] = globalForEmail.emailLogs || [];
if (process.env.NODE_ENV !== "production") {
  globalForEmail.emailLogs = emailLogs;
}

export function getEmailLogs(): EmailLogEntry[] {
  return [...emailLogs].slice(-30).reverse(); // Return latest 30 logs (newest first)
}

export function clearEmailLogs(): void {
  emailLogs.length = 0;
}

export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(user && pass);
}

interface SendVerificationEmailParams {
  toEmail: string;
  name: string;
  code: string;
  verifyUrl: string;
}

export async function sendVerificationEmail({
  toEmail,
  name,
  code,
  verifyUrl,
}: SendVerificationEmailParams): Promise<{ sent: boolean; mode: "smtp" | "simulation"; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = 465;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your CelebrateHub account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 40px 20px; }
          .container { max-width: 540px; margin: 0 auto; background: #0f172a; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); padding: 40px 32px; text-align: center; }
          .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 24px; }
          .logo span { background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
          .otp-card { background: #1e293b; border-radius: 16px; border: 1px solid rgba(168,85,247,0.3); padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #f59e0b; font-family: 'Courier New', monospace; }
          .btn { display: inline-block; background: linear-gradient(135deg, #9333ea, #db2777); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 16px; }
          .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Celebrate<span>Hub</span></div>
          <h1>Verify Your Email Address</h1>
          <p>Hi ${name || "there"}, welcome to CelebrateHub! Enter this 6-digit verification code to activate your account and access private venues and celebration passes.</p>
          <div class="otp-card">
            <div style="font-size: 11px; text-transform: uppercase; color: #cbd5e1; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Verification Code</div>
            <div class="otp-code">${code}</div>
          </div>
          <p style="font-size: 13px;">Or click the button below to verify automatically in one click:</p>
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          <div class="footer">
            <p>This code will expire in 24 hours. If you did not create a CelebrateHub account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const logId = Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  // If SMTP credentials are provided, attempt real email transmission
  if (host && user && pass) {
    try {
      console.log(`[EMAIL] Attempting real SMTP transmission via ${host}:${port} to ${toEmail}...`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }, // Avoid self-signed cert rejections in dev
      });

      await transporter.sendMail({
        from: `"CelebrateHub Security" <${user}>`,
        to: toEmail,
        subject: `Your CelebrateHub Verification Code: ${code}`,
        html: htmlContent,
      });

      console.log(`\n=======================================================`);
      console.log(`✅ [EMAIL SENT SUCCESSFULLY VIA SMTP]`);
      console.log(`🎯 Recipient: ${toEmail}`);
      console.log(`🔑 Verification Code (OTP): [ ${code} ]`);
      console.log(`🔗 Direct Link: ${verifyUrl}`);
      console.log(`📮 Sent from: ${user} via ${host}`);
      console.log(`=======================================================\n`);

      emailLogs.push({
        id: logId,
        timestamp: now,
        toEmail,
        name,
        subject: `Your CelebrateHub Verification Code: ${code}`,
        code,
        verifyUrl,
        mode: "smtp",
        status: "sent",
      });

      return { sent: true, mode: "smtp" };
    } catch (err: any) {
      console.error(`\n❌ [EMAIL SMTP FAILURE] Error sending to ${toEmail}:`, err.message);
      console.warn(`Falling back to Simulation Mode so verification flow is NOT blocked.\n`);

      emailLogs.push({
        id: logId,
        timestamp: now,
        toEmail,
        name,
        subject: `Your CelebrateHub Verification Code: ${code}`,
        code,
        verifyUrl,
        mode: "smtp",
        status: "failed",
        error: err.message,
      });

      // Continue to output simulation banner below so developers/testers are not locked out
    }
  }

  // Simulation Mode (Outputs formatted banner to console for instant developer verification)
  console.log(`\n=======================================================`);
  console.log(`📧 [EMAIL VERIFICATION DISPATCHED - SIMULATION MODE]`);
  console.log(`📅 Timestamp: ${now}`);
  console.log(`🎯 Recipient (To): ${toEmail}`);
  console.log(`👤 Name: ${name || "Guest"}`);
  console.log(`🔑 VERIFICATION CODE (OTP): [ ${code} ]`);
  console.log(`🔗 DIRECT VERIFY LINK: ${verifyUrl}`);
  console.log(`⚠️  Mode: SIMULATION (Configure SMTP_USER & SMTP_PASS in .env.local to send live emails)`);
  console.log(`=======================================================\n`);

  emailLogs.push({
    id: logId,
    timestamp: now,
    toEmail,
    name,
    subject: `Your CelebrateHub Verification Code: ${code}`,
    code,
    verifyUrl,
    mode: "simulation",
    status: "simulated",
  });

  return { sent: true, mode: "simulation" };
}

