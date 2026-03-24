import { getBillingProvider } from "./factory";
import type {
  CreateCheckoutSessionParams,
  CreateCustomerPortalSessionParams
} from "./types";

/**
 * Fachada usada por la app (actions, route handlers). Los detalles de la
 * pasarela quedan encapsulados en `BillingProvider`.
 */
export const billingService = {
  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    return getBillingProvider().createCheckoutSession(params);
  },

  async createCustomerPortalSession(params: CreateCustomerPortalSessionParams) {
    return getBillingProvider().createCustomerPortalSession(params);
  }
};
