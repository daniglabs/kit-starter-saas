import type { SubscriptionStatus } from "@/models/Subscription";

export type BillingProviderId = "noop" | string;

export interface CheckoutLineItem {
  planId: string;
  quantity?: number;
}

/** Parámetros neutrales para iniciar un checkout; cada proveedor los mapea a su API. */
export interface CreateCheckoutSessionParams {
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: CheckoutLineItem[];
  customerEmail?: string;
  /** Metadatos que el proveedor debe devolver en webhooks (p. ej. organizationId). */
  metadata?: Record<string, string>;
}

export interface CreateCustomerPortalSessionParams {
  organizationId: string;
  returnUrl: string;
}

/**
 * Evento normalizado tras un webhook. Los adaptadores (Stripe, PayPal, …)
 * convierten su payload a esta forma; el dominio solo reacciona a esto.
 */
export type NormalizedBillingEvent = NormalizedSubscriptionUpsertEvent;

export type NormalizedSubscriptionUpsertEvent = {
  type: "subscription.upsert";
  organizationId: string;
  planId?: string;
  planSlug?: string;
  provider: string;
  providerSubscriptionId: string;
  providerCustomerId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
};

export interface BillingProvider {
  readonly id: BillingProviderId;
  createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<{ url: string }>;
  createCustomerPortalSession(
    params: CreateCustomerPortalSessionParams
  ): Promise<{ url: string }>;
  /** Valida firma / cuerpo y devuelve eventos ya normalizados para persistir en BD. */
  parseWebhookPayload(
    rawBody: string,
    headers: Record<string, string | undefined>
  ): Promise<NormalizedBillingEvent[]>;
}
