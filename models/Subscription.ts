import { Schema, model, models, type Model } from "mongoose";

export type SubscriptionStatus =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export interface ISubscription {
  _id: string;
  organization: Schema.Types.ObjectId;
  plan: Schema.Types.ObjectId;
  status: SubscriptionStatus;
  /** Identificador del proveedor configurado en `BILLING_PROVIDER` (p. ej. stripe, paypal, noop) */
  provider: string;
  providerSubscriptionId: string;
  providerCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },
    status: {
      type: String,
      enum: [
        "incomplete",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused"
      ],
      required: true
    },
    provider: { type: String, required: true, index: true },
    providerSubscriptionId: { type: String, required: true },
    providerCustomerId: { type: String },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEnd: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

subscriptionSchema.index(
  { organization: 1, provider: 1, providerSubscriptionId: 1 },
  { unique: true }
);

export const Subscription: Model<ISubscription> =
  (models.Subscription as Model<ISubscription>) ||
  model<ISubscription>("Subscription", subscriptionSchema);
