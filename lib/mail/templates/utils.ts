/** Escapa texto para insertar en HTML (evita XSS en plantillas de correo). */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getAppPublicUrl(): string {
  return (
    process.env.APP_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getMailBrandConfig() {
  return {
    appName:
      process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME || "SAAS Kit",
    accentColor: process.env.MAIL_BRAND_COLOR || "#2563eb",
    publicUrl: getAppPublicUrl()
  };
}
