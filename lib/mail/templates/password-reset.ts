import {
  renderCtaButtonRow,
  renderTransactionalEmailLayout
} from "./layout";
import { escapeHtml } from "./utils";

export type PasswordResetEmailContent = {
  subject: string;
  html: string;
};

export function buildPasswordResetEmail(params: {
  resetUrl: string;
}): PasswordResetEmailContent {
  const url = params.resetUrl.trim();
  const safeUrl = escapeHtml(url);

  const bodyHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px;">Hola,</p>
      <p style="margin: 0 0 16px 0;">Has solicitado restablecer tu contraseña. Usa el siguiente botón para continuar:</p>
      ${renderCtaButtonRow(url, "Restablecer contraseña")}
      <p style="margin: 0 0 8px 0; font-size: 16px;">O copia y pega esta URL en tu navegador:</p>
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 12px; word-break: break-all;">${safeUrl}</p>
      <p style="margin: 0; font-size: 14px; color: #666666;">Este enlace expira en 1 hora. Si no has solicitado este cambio, ignora este correo.</p>
    `;

  return {
    subject: "Restablece tu contraseña",
    html: renderTransactionalEmailLayout({
      title: "Restablecer contraseña",
      bodyHtml
    })
  };
}
