import type { BillingProvider } from "./types";
import { NoopBillingProvider } from "./providers/noop";

/**
 * Instancia el proveedor según `BILLING_PROVIDER`.
 * Para añadir Stripe/PayPal: crear clase que implemente `BillingProvider`
 * y registrarla aquí (sin tocar server actions ni páginas).
 */
export function getBillingProvider(): BillingProvider {
  const id = (process.env.BILLING_PROVIDER || "noop").toLowerCase();

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
