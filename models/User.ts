import { Schema, model, models, type Model } from "mongoose";

export type UserRole = "admin" | "customer";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  organization: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
      default: "customer"
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);

