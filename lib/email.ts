import nodemailer from "nodemailer";

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
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : null);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const port = Number(process.env.SMTP_PORT) || 465;

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

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"CelebrateHub Security" <${user}>`,
        to: toEmail,
        subject: `Your CelebrateHub Verification Code: ${code}`,
        html: htmlContent,
      });

      console.log(`[EMAIL] Verification email sent via SMTP to ${toEmail}`);
      return { sent: true, mode: "smtp" };
    } catch (err: any) {
      console.warn(`[EMAIL] SMTP failed (${err.message}). Falling back to simulation mode.`);
    }
  }

  // Simulation mode (logs directly to console for instant developer/tester verification)
  console.log(`=======================================================`);
  console.log(`[EMAIL VERIFICATION DISPATCHED]`);
  console.log(`To: ${toEmail}`);
  console.log(`Verification Code (OTP): ${code}`);
  console.log(`Direct Verification URL: ${verifyUrl}`);
  console.log(`=======================================================`);

  return { sent: true, mode: "simulation" };
}
