import { buildInvitationEmail } from "./templates/invitation";

export { buildInvitationEmail } from "./templates/invitation";
export { renderTransactionalEmailLayout, renderCtaButtonRow } from "./templates/layout";
export { escapeHtml, getAppPublicUrl, getMailBrandConfig } from "./templates/utils";

interface InviteMailParams {
  to: string;
  invitedByName: string;
  invitationUrl: string;
}

let transporter: any | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.MAILTRAP_HOST;
  const port = Number(process.env.MAILTRAP_PORT || "2525");
  const user = process.env.MAILTRAP_USER;
  const pass = process.env.MAILTRAP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Faltan variables SMTP de Mailtrap (MAILTRAP_HOST/PORT/USER/PASS)"
    );
  }

  let nodemailer: any;
  try {
    nodemailer = await import("nodemailer");
  } catch {
    throw new Error("nodemailer no está instalado. Ejecuta: npm install nodemailer");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass }
  });

  return transporter;
}

export async function sendInvitationEmail(params: InviteMailParams) {
  const from = process.env.MAIL_FROM || "no-reply@saaskit.local";
  const smtp = await getTransporter();
  const { subject, html } = buildInvitationEmail({
    invitedByName: params.invitedByName,
    invitationUrl: params.invitationUrl
  });

  await smtp.sendMail({
    from,
    to: params.to,
    subject,
    html
  });
}
