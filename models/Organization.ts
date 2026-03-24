import { Schema, model, models, type Model } from "mongoose";

/** customerId por proveedor de pago (p. ej. { stripe: "cus_xxx" }) */
export type ExternalBillingCustomerIds = Record<string, string>;

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  createdBy: Schema.Types.ObjectId | null;
  externalBillingCustomerIds?: ExternalBillingCustomerIds;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    externalBillingCustomerIds: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const Organization: Model<IOrganization> =
  (models.Organization as Model<IOrganization>) ||
  model<IOrganization>("Organization", organizationSchema);

