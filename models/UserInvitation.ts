import { Schema, model, models, type Model } from "mongoose"

export interface IUserInvitation {
  _id: string
  user: Schema.Types.ObjectId
  email: string
  tokenHash: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const userInvitationSchema = new Schema<IUserInvitation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

export const UserInvitation: Model<IUserInvitation> =
  (models.UserInvitation as Model<IUserInvitation>) ||
  model<IUserInvitation>("UserInvitation", userInvitationSchema)
