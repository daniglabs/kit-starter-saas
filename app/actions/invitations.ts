"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { consumeValidInvitation } from "@/lib/invitations";
import { logAction } from "@/lib/audit";

export type InvitationFormState = { error: string | null };

export async function completeInvitation(
  _prevState: InvitationFormState,
  formData: FormData
): Promise<InvitationFormState> {
  await connectDB();

  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) return { error: "Invitación no válida" };
  if (!password || !confirmPassword) {
    return { error: "Debes completar ambos campos" };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const invitation = await consumeValidInvitation(token);
  if (!invitation) {
    redirect("/login?error=InvitacionExpirada");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(invitation.user, { passwordHash });

  const user = await User.findById(invitation.user).lean();
  const inviteOrg = (user as { organization?: unknown } | null)?.organization;
  await logAction({
    userId: user?._id ? String(user._id) : null,
    organizationId: inviteOrg ? String(inviteOrg) : null,
    userEmail: user?.email ?? invitation.email,
    userName: user?.name ?? invitation.email,
    action: "accept_invitation",
    entity: "auth",
    entityId: String(invitation._id),
    details: "Aceptó invitación y definió contraseña"
  });

  redirect("/login?invited=1");
}
