import type { BillingProvider, BillingProviderId } from "./types";
import { NoopBillingProvider } from "./providers/noop";

/**
 * Instancia el proveedor según `BILLING_PROVIDER`.
 * Para añadir Stripe/PayPal: crear clase que implemente `BillingProvider`
 * y registrarla aquí (sin tocar server actions ni páginas).
 */
export function getBillingProvider(): BillingProvider {
  const id = (process.env.BILLING_PROVIDER || "noop").toLowerCase();
  return getBillingProviderById(id);
}

/**
 * Resuelve un proveedor concreto por ID.
 * Esto permite exponer webhooks por proveedor sin tocar los controladores.
 */
export function getBillingProviderById(providerId: string): BillingProvider {
  const id = (providerId || "noop").toLowerCase() as BillingProviderId;

  switch (id) {
    case "noop":
      return new NoopBillingProvider();
    default:
      console.warn(
        `[billing] BILLING_PROVIDER="${id}" desconocido; usando noop`
      );
      return new NoopBillingProvider();
  }
}
