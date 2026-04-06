import { getBillingProvider, getBillingProviderById } from "./factory";
import type { BillingProviderId } from "./types";
import { applyNormalizedBillingEvents } from "./subscription-sync";

export type WebhookProcessResult =
  | { ok: true; processed: number }
  | { ok: false; error: string };

type ProcessWebhookOptions = {
  providerId?: string;
};

function normalizeHeaders(req: Request): Record<string, string | undefined> {
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return headers;
}

function resolveProviderId(
  headers: Record<string, string | undefined>,
  options?: ProcessWebhookOptions
): BillingProviderId {
  const explicit = options?.providerId?.toLowerCase();
  if (explicit) return explicit;

  const fromHeader =
    headers["x-billing-provider"] || headers["x-payment-provider"];
  if (fromHeader) return fromHeader.toLowerCase();

  const fromEnv = process.env.BILLING_PROVIDER || "noop";
  return fromEnv.toLowerCase();
}

/**
 * Punto único de entrada HTTP para webhooks de facturación.
 * Cada proveedor valida firma en `parseWebhookPayload` y devuelve eventos normalizados.
 */
export async function processBillingWebhook(req: Request): Promise<WebhookProcessResult> {
  return processBillingWebhookWithOptions(req);
}

export async function processBillingWebhookWithOptions(
  req: Request,
  options?: ProcessWebhookOptions
): Promise<WebhookProcessResult> {
  const rawBody = await req.text();
  const headers = normalizeHeaders(req);
  const providerId = resolveProviderId(headers, options);

  try {
    // Si no hay provider explícito, mantenemos el flujo actual.
    const provider = options?.providerId
      ? getBillingProviderById(providerId)
      : getBillingProvider();

    const events = await provider.parseWebhookPayload(rawBody, headers, {
      providerId,
      url: req.url
    });
    await applyNormalizedBillingEvents(events);
    return { ok: true, processed: events.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[billing] webhook error:", message);
    return { ok: false, error: message };
  }
}
