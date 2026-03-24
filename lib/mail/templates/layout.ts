import { escapeHtml, getMailBrandConfig } from "./utils";

type LayoutParams = {
  /** Contenido principal: filas <tr><td>… o párrafos ya maquetados */
  bodyHtml: string;
  /** Título para <title> (legibilidad en bandeja) */
  title?: string;
};

/**
 * Maquetación basada en tablas (`role="presentation"`) para compatibilidad
 * con clientes de correo (Outlook, Gmail, etc.).
 */
export function renderTransactionalEmailLayout(params: LayoutParams): string {
  const { appName, accentColor, publicUrl } = getMailBrandConfig();
  const title = escapeHtml(params.title ?? appName);
  const brand = escapeHtml(appName.toUpperCase());

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; background-color: #f2f4f7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f4f7;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.2em; color: ${accentColor};">${brand}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 24px 24px 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666666;">
              — Equipo ${escapeHtml(appName)}
              ${publicUrl ? `<br><span style="color:#9ca3af;">${escapeHtml(publicUrl)}</span>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Botón tipo CTA compatible con clientes que ignoran mucho CSS */
export function renderCtaButtonRow(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  const { accentColor } = getMailBrandConfig();
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
  <tr>
    <td>
      <a href="${safeHref}" style="display: inline-block; padding: 12px 24px; background-color: ${accentColor}; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">${safeLabel}</a>
    </td>
  </tr>
</table>`;
}
