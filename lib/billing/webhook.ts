import { getBillingProvider } from "./factory";
import { applyNormalizedBillingEvents } from "./subscription-sync";

export type WebhookProcessResult =
  | { ok: true; processed: number }
  | { ok: false; error: string };

/**
 * Punto único de entrada HTTP para webhooks de facturación.
 * Cada proveedor valida firma en `parseWebhookPayload` y devuelve eventos normalizados.
 */
export async function processBillingWebhook(req: Request): Promise<WebhookProcessResult> {
  const rawBody = await req.text();
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  try {
    const provider = getBillingProvider();
    const events = await provider.parseWebhookPayload(rawBody, headers);
    await applyNormalizedBillingEvents(events);
    return { ok: true, processed: events.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[billing] webhook error:", message);
    return { ok: false, error: message };
  }
}
