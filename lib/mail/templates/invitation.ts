import {
  renderCtaButtonRow,
  renderTransactionalEmailLayout
} from "./layout";
import { escapeHtml } from "./utils";

export type InvitationEmailContent = {
  subject: string;
  html: string;
};

export function buildInvitationEmail(params: {
  invitedByName: string;
  invitationUrl: string;
}): InvitationEmailContent {
  const who = escapeHtml(params.invitedByName);
  const url = params.invitationUrl.trim();
  const safeUrl = escapeHtml(url);

  const bodyHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px;">Hola,</p>
      <p style="margin: 0 0 16px 0;"><strong>${who}</strong> te ha invitado a unirte a la plataforma.</p>
      <p style="margin: 0 0 16px 0;">Para activar tu cuenta y definir tu contraseña, usa el siguiente botón:</p>
      ${renderCtaButtonRow(url, "Activar cuenta")}
      <p style="margin: 0 0 8px 0; font-size: 16px;">O copia y pega esta URL en tu navegador:</p>
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 12px; word-break: break-all;">${safeUrl}</p>
      <p style="margin: 0; font-size: 14px; color: #666666;">Este enlace caduca en 24 horas. Si no esperabas esta invitación, puedes ignorar este correo.</p>
    `;

  return {
    subject: "Invitación a tu cuenta",
    html: renderTransactionalEmailLayout({
      title: "Invitación",
      bodyHtml
    })
  };
}
