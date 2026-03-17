import { Schema, model, models, type Model } from "mongoose";

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  createdBy: Schema.Types.ObjectId | null;
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
    }
  },
  {
    timestamps: true
  }
);

export const Organization: Model<IOrganization> =
  (models.Organization as Model<IOrganization>) ||
  model<IOrganization>("Organization", organizationSchema);

