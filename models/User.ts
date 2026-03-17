import { Schema, model, models, type Model } from "mongoose";

export type UserType = "admin" | "customer";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  userType: UserType;
  organization: Schema.Types.ObjectId | null;
  organizationRole: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    userType: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
      default: "customer"
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null
    },
    organizationRole: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationRole",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);

