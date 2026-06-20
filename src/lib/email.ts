import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Imagination <imagination@olcas.app>";
const resend = key ? new Resend(key) : null;

// Envía email. Si no hay clave Resend, no rompe: registra y devuelve false (degradación).
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] sin RESEND_API_KEY — no enviado: "${subject}" -> ${to}`);
    return false;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
    return true;
  } catch (e) {
    console.error("[email]", (e as Error).message);
    return false;
  }
}

export function verifyEmailHtml(link: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0a0a0f">
    <h1 style="font-size:22px">Confirma tu correo</h1>
    <p style="color:#444">Gracias por unirte a Imagination. Pulsa el botón para activar tu cuenta:</p>
    <p style="margin:28px 0"><a href="${link}" style="background:#e11d48;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Confirmar mi correo</a></p>
    <p style="color:#888;font-size:13px">Si no fuiste tú, ignora este mensaje.</p>
  </div>`;
}
