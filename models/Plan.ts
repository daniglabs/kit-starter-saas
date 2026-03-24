import { Schema, model, models, type Model } from "mongoose";

export type BillingInterval = "month" | "year" | "one_time";

export type PlanTier = "free" | "pro" | "business" | "custom";

/** IDs de precio/producto en cada pasarela, p. ej. { stripe: "price_xxx", paypal: "P-xxx" } */
export type ProviderPriceIds = Record<string, string>;

export interface IPlan {
  _id: string;
  name: string;
  slug: string;
  /** Agrupa variantes mensual/anual (p. ej. pro + pro-monthly / pro-yearly) para la UI de facturación */
  tier: PlanTier;
  description: string;
  /** Importe en unidades mínimas (p. ej. céntimos) */
  priceMinor: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  active: boolean;
  sortOrder: number;
  providerPriceIds: ProviderPriceIds;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    tier: {
      type: String,
      enum: ["free", "pro", "business", "custom"],
      default: "custom"
    },
    description: { type: String, default: "" },
    priceMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd", uppercase: true },
    interval: {
      type: String,
      enum: ["month", "year", "one_time"],
      required: true
    },
    features: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    providerPriceIds: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

planSchema.index({ active: 1, sortOrder: 1 });

export const Plan: Model<IPlan> =
  (models.Plan as Model<IPlan>) || model<IPlan>("Plan", planSchema);
