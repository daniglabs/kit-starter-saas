import { connectDB } from "@/lib/db";
import { Log } from "@/models/Log";
import { User } from "@/models/User";

/** Resuelve la organización del usuario para etiquetar logs (cliente). */
export async function organizationIdForUser(
  userId: string | null | undefined
): Promise<string | null> {
  if (!userId) return null;
  await connectDB();
  const u = await User.findById(userId).select("organization").lean();
  const org = (u as { organization?: unknown } | null)?.organization;
  return org ? String(org) : null;
}

export interface LogActionParams {
  userId: string | null;
  /** Organización a la que pertenece la acción (null = plataforma / sin ámbito org) */
  organizationId?: string | null;
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
      organization: params.organizationId || null,
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
