import { getAppPublicUrl } from "@/lib/mail/templates/utils";
import type {
  BillingProvider,
  CreateCheckoutSessionParams,
  CreateCustomerPortalSessionParams,
  NormalizedBillingEvent
} from "../types";

/**
 * Proveedor por defecto: sin pasarela. Útil en desarrollo y como referencia
 * para implementar `BillingProvider` con Stripe, PayPal, etc.
 */
export class NoopBillingProvider implements BillingProvider {
  readonly id = "noop" as const;

  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const base = getAppPublicUrl();
    const q = new URLSearchParams({
      billing: "noop",
      org: params.organizationId
    });
    return { url: `${base}/dashboard?${q.toString()}` };
  }

  async createCustomerPortalSession(_params: CreateCustomerPortalSessionParams) {
    const base = getAppPublicUrl();
    return { url: `${base}/dashboard?billing_portal=noop` };
  }

  async parseWebhookPayload(
    _rawBody: string,
    _headers: Record<string, string | undefined>
  ): Promise<NormalizedBillingEvent[]> {
    return [];
  }
}
