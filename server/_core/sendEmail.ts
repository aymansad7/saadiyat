/**
 * Outbound email via SMTP (Gmail App Password by default).
 *
 * Configuration (env):
 *   - `SMTP_HOST`  default `smtp.gmail.com`
 *   - `SMTP_PORT`  default `465`
 *   - `SMTP_SECURE` default `true`  (TLS)
 *   - `SMTP_USER`  required — sender Google account
 *   - `SMTP_PASS`  required — 16-char Google App Password
 *   - `MAIL_FROM`  optional — defaults to `Saadiyat Resale Hub <${SMTP_USER}>`
 *
 * In development, when SMTP is not configured we log the magic code so the
 * owner can manually paste it; we also fan it out via `notifyOwner` so the
 * Manus owner inbox receives it.
 */
import nodemailer, { type Transporter } from "nodemailer";
import { notifyOwner } from "./notification";

const APP_NAME = "Saadiyat Resale Hub";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

let cachedTransporter: Transporter | null = null;

function readSmtpConfig(): SmtpConfig | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = (process.env.SMTP_SECURE ?? "true") === "true";
  const from = process.env.MAIL_FROM ?? `${APP_NAME} <${user}>`;
  return { host, port, secure, user, pass, from };
}

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const cfg = readSmtpConfig();
  if (!cfg) return null;
  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  return cachedTransporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const cfg = readSmtpConfig();
  const transporter = getTransporter();
  if (!cfg || !transporter) {
    console.warn(
      "[sendEmail] SMTP not configured — falling back to owner notification + console log",
    );
    console.log(
      `[sendEmail:DRYRUN] to=${input.to} subject=${input.subject}\n${input.text}`,
    );
    try {
      await notifyOwner({
        title: `[DRYRUN] Email to ${input.to}: ${input.subject}`,
        content: input.text,
      });
    } catch {
      /* best-effort */
    }
    return false;
  }
  try {
    await transporter.sendMail({
      from: cfg.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (err) {
    console.error("[sendEmail] SMTP send failed", err);
    return false;
  }
}

/* ---------------- magic-link templates ---------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMagicLinkEmail(input: {
  to: string;
  code: string;
}): Promise<boolean> {
  const safeCode = escapeHtml(input.code);
  const subject = `${APP_NAME} sign-in code: ${input.code}`;
  const text = [
    `Your ${APP_NAME} sign-in code:`,
    ``,
    `   ${input.code}`,
    ``,
    `This code expires in 10 minutes. If you did not request this, please ignore this message.`,
    ``,
    `— Saadiyat Resale Hub`,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="background:#0f1115;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;color:#f5f5f5;">
    <div style="font-size:13px;letter-spacing:0.18em;color:#aaa;text-transform:uppercase;">${escapeHtml(APP_NAME)}</div>
    <h1 style="font-size:22px;margin:18px 0 8px;color:#ffffff;">Your sign-in code</h1>
    <p style="margin:0 0 24px;color:#cccccc;font-size:15px;line-height:1.55;">
      Use the 6-digit code below to finish signing in. The code expires in 10 minutes.
    </p>
    <div style="background:#1a1d24;border:1px solid #2a2f3a;border-radius:12px;padding:24px 0;text-align:center;font-size:32px;letter-spacing:0.5em;font-weight:600;color:#ffffff;">${safeCode}</div>
    <p style="margin:28px 0 0;color:#888;font-size:13px;line-height:1.55;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body></html>`;

  return sendEmail({ to: input.to, subject, text, html });
}
