import { Schema, model, models, type Model } from "mongoose";

export interface IPasswordResetToken {
  _id: string;
  user: Schema.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ user: 1, usedAt: 1, expiresAt: 1 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  (models.PasswordResetToken as Model<IPasswordResetToken>) ||
  model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);
