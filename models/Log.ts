import { Schema, model, models, type Model } from "mongoose";

export interface ILog {
  _id: string;
  userId: Schema.Types.ObjectId | null;
  organization: Schema.Types.ObjectId | null;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const logSchema = new Schema<ILog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true
    },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, default: null },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });
logSchema.index({ organization: 1, createdAt: -1 });

export const Log: Model<ILog> =
  (models.Log as Model<ILog>) || model<ILog>("Log", logSchema);
