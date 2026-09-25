import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getEmailLogs, isSmtpConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleDiagnostic(req);
}

export async function POST(req: NextRequest) {
  return handleDiagnostic(req);
}

async function handleDiagnostic(req: NextRequest) {
  const url = new URL(req.url);
  const toParam = url.searchParams.get("to") || "";

  let bodyTo = "";
  try {
    const body = await req.json();
    bodyTo = body.to || "";
  } catch {
    // Body optional for GET
  }

  const recipient = toParam || bodyTo;

  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : null);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const port = Number(process.env.SMTP_PORT) || 465;

  const logs = getEmailLogs();

  // If no SMTP credentials in .env.local
  if (!user || !pass) {
    return NextResponse.json({
      success: false,
      smtpConfigured: false,
      connectionStatus: "NOT_CONFIGURED",
      mode: "simulation",
      message: "No SMTP credentials detected in .env.local. Emails are currently running in SIMULATION MODE and logged to server console.",
      environmentDetected: {
        SMTP_HOST: host || "(not set)",
        SMTP_PORT: port,
        SMTP_USER: user ? `${user.substring(0, 3)}***` : "(not set)",
        SMTP_PASS: pass ? "******" : "(not set)",
      },
      instructions: [
        "1. Open your Google Account (https://myaccount.google.com/security)",
        "2. Ensure 2-Step Verification is turned ON",
        "3. Search for 'App passwords' in the search bar (or go to Security > 2-Step Verification > App passwords)",
        "4. Create a new App Password named 'CelebrateHub'",
        "5. Copy the 16-character generated code (e.g. 'abcd efgh ijkl mnop')",
        "6. In your .env.local file, set:",
        "   SMTP_HOST=smtp.gmail.com",
        "   SMTP_PORT=465",
        "   SMTP_USER=your_email@gmail.com",
        "   SMTP_PASS=abcdefghijklmnop",
        "7. Restart your development server (npm run dev)",
      ],
      recentEmailLogs: logs,
    });
  }

  // Attempt live connection handshake
  try {
    const transporter = nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    // Test SMTP handshake
    await transporter.verify();

    // If recipient provided, send actual test email
    let testEmailDispatched = false;
    if (recipient && recipient.includes("@")) {
      await transporter.sendMail({
        from: `"CelebrateHub Test" <${user}>`,
        to: recipient,
        subject: "🎉 CelebrateHub Email Service Test - Working Perfectly!",
        html: `
          <div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 30px; border-radius: 16px;">
            <h2 style="color: #c084fc;">CelebrateHub Live Email Diagnostics</h2>
            <p>Congratulations! Your SMTP email transport is working properly.</p>
            <p><strong>Sender:</strong> ${user}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border-color: rgba(255,255,255,0.1);" />
            <p style="font-size: 12px; color: #94a3b8;">Dispatched via CelebrateHub automated diagnostics system.</p>
          </div>
        `,
      });
      testEmailDispatched = true;
    }

    return NextResponse.json({
      success: true,
      smtpConfigured: true,
      connectionStatus: "CONNECTED",
      mode: "smtp",
      message: testEmailDispatched
        ? `SMTP Connected! Live test email successfully dispatched to ${recipient}.`
        : "SMTP handshake verified! Credentials are valid and ready to dispatch real emails.",
      details: {
        host: host || "smtp.gmail.com",
        port,
        user: `${user.substring(0, 3)}***@${user.split("@")[1] || "gmail.com"}`,
        testEmailSentTo: recipient || "None specified (add ?to=your_email@gmail.com to send a live test)",
      },
      recentEmailLogs: logs,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      smtpConfigured: true,
      connectionStatus: "AUTH_FAILED",
      mode: "simulation",
      message: `SMTP Connection Failed: ${error.message}`,
      help: error.message.includes("535")
        ? "Google rejected the password. Please make sure you are using a 16-character Google App Password, NOT your personal account password. (2-Factor Authentication must be enabled on your Google account)."
        : error.message,
      recentEmailLogs: logs,
    }, { status: 500 });
  }
}
