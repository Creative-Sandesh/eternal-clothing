import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| Mailer
|--------------------------------------------------------------------------
| Configured via environment variables:
|   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"/"false")
|   MAIL_FROM        e.g. "Eternal <no-reply@eternal.com>"
|   APP_URL          frontend base URL, used to build links (default http://localhost:5173)
|
| When SMTP_HOST is not set, emails are logged to the console instead of sent
| so local development and tests work without a mail server.
*/

const smtpConfigured = Boolean(process.env.SMTP_HOST);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER || process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

const FROM = process.env.MAIL_FROM || "Eternal <no-reply@eternal.local>";
export const APP_URL = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");

/**
 * Send an email. Returns { delivered: boolean }.
 * Never throws — a mail failure must not break the calling request.
 */
export const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log("\n──────────── EMAIL (not sent — SMTP not configured) ────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log((text || html || "").trim());
    console.log("───────────────────────────────────────────────────────────────\n");
    return { delivered: false };
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, text, html });
    return { delivered: true };
  } catch (error) {
    console.error("sendMail failed:", error.message);
    return { delivered: false };
  }
};

export const sendPasswordResetEmail = async (email, rawToken) => {
  const link = `${APP_URL}/reset-password?token=${rawToken}`;
  return sendMail({
    to: email,
    subject: "Reset your Eternal password",
    text:
      `We received a request to reset your Eternal password.\n\n` +
      `Reset it here (link valid for 1 hour):\n${link}\n\n` +
      `If you didn't request this, you can ignore this email.`,
    html:
      `<p>We received a request to reset your Eternal password.</p>` +
      `<p><a href="${link}">Reset your password</a> — link valid for 1 hour.</p>` +
      `<p>If you didn't request this, you can ignore this email.</p>`,
  });
};
