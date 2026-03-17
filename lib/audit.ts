import { connectDB } from "@/lib/db";
import { Log } from "@/models/Log";

export interface LogActionParams {
  userId: string | null;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export async function logAction(params: LogActionParams) {
  try {
    await connectDB();
    await Log.create({
      userId: params.userId || null,
      userEmail: params.userEmail,
      userName: params.userName,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details,
      metadata: params.metadata ?? {}
    });
  } catch (err) {
    console.error("[audit] Error al registrar log:", err);
  }
}
