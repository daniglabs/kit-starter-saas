import { Schema, model, models, type Model } from "mongoose";

export const PERMISSIONS = [
  "users.create",
  "users.read",
  "users.update",
  "users.delete",
  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface IOrganizationRole {
  _id: string;
  organization: Schema.Types.ObjectId;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationRoleSchema = new Schema<IOrganizationRole>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    name: { type: String, required: true },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: []
    },
    isSystem: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

organizationRoleSchema.index({ organization: 1, name: 1 }, { unique: true });

export const OrganizationRole: Model<IOrganizationRole> =
  (models.OrganizationRole as Model<IOrganizationRole>) ||
  model<IOrganizationRole>("OrganizationRole", organizationRoleSchema);
