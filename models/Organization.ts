import { Schema, model, models, type Model } from "mongoose";

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true }
  },
  {
    timestamps: true
  }
);

export const Organization: Model<IOrganization> =
  (models.Organization as Model<IOrganization>) ||
  model<IOrganization>("Organization", organizationSchema);

