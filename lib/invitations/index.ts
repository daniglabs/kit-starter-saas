import crypto from "crypto";
import { UserInvitation } from "@/models/UserInvitation";

export const INVITATION_EXPIRY_HOURS = 24;

export function hashInvitationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createInvitationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function consumeValidInvitation(token: string) {
  const tokenHash = hashInvitationToken(token);
  const now = new Date();

  const invitation = await UserInvitation.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: now }
  });

  if (!invitation) return null;

  invitation.usedAt = now;
  await invitation.save();

  return invitation;
}
