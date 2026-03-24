"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { OrganizationRole } from "@/models/OrganizationRole";
import { UserInvitation } from "@/models/UserInvitation";
import { logAction } from "@/lib/audit";
import { createInvitationToken, hashInvitationToken, INVITATION_EXPIRY_HOURS } from "@/lib/invitations";
import { sendInvitationEmail } from "@/lib/mail";

export async function inviteOrgUser(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "users.create")) {
    throw new Error("No tienes permiso para invitar usuarios");
  }

  await connectDB();

  const email = String(formData.get("email") || "").toLowerCase().trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const roleId = String(formData.get("roleId") || "");

  if (!email || !firstName || !roleId) {
    throw new Error("Email, nombre y rol son obligatorios");
  }

  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || firstName;

  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });
  if (!role) throw new Error("Rol no válido");

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Ya existe un usuario con este email");

  const temporaryPassword = crypto.randomBytes(24).toString("hex");
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  let newUser: any = null;
  try {
    newUser = await User.create({
      email,
      name,
      firstName,
      lastName,
      passwordHash,
      userType: "customer",
      organization: user.organizationId,
      organizationRole: roleId
    });

    await UserInvitation.deleteMany({ email });
    const rawToken = createInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);

    await UserInvitation.create({
      user: newUser._id,
      email,
      tokenHash,
      expiresAt
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invite/${rawToken}`;
    await sendInvitationEmail({
      to: email,
      invitedByName: user.name,
      invitationUrl
    });
  } catch (error) {
    if (newUser?._id) {
      await UserInvitation.deleteMany({ user: newUser._id });
      await User.findByIdAndDelete(newUser._id);
    }
    throw error;
  }

  await logAction({
    userId: user.id,
    organizationId: user.organizationId,
    userEmail: user.email,
    userName: user.name,
    action: "invite",
    entity: "org_user",
    entityId: String(newUser._id),
    details: `Invité a ${email} (${name}) en la organización`,
    metadata: { invitationSent: true }
  });

  redirect("/dashboard/settings/users?invited=1");
}

export async function updateOrgUserRole(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "users.update")) {
    throw new Error("No tienes permiso para editar usuarios");
  }

  await connectDB();

  const userId = String(formData.get("userId") || "");
  const roleId = String(formData.get("roleId") || "");

  const targetUser = await User.findOne({
    _id: userId,
    organization: user.organizationId,
    userType: "customer"
  });
  if (!targetUser) throw new Error("Usuario no encontrado");

  const org = await Organization.findById(user.organizationId).lean();
  if (org?.createdBy?.toString() === userId) {
    throw new Error("No se puede cambiar el rol del administrador de la organización");
  }

  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });
  if (!role) throw new Error("Rol no válido");

  await User.findByIdAndUpdate(userId, { organizationRole: roleId });

  await logAction({
    userId: user.id,
    organizationId: user.organizationId,
    userEmail: user.email,
    userName: user.name,
    action: "update_role",
    entity: "org_user",
    entityId: userId,
    details: `Cambió rol de usuario a ${role.name}`
  });

  redirect("/dashboard/settings/users");
}

export async function removeOrgUser(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "users.delete")) {
    throw new Error("No tienes permiso para eliminar usuarios");
  }

  await connectDB();

  const userId = String(formData.get("userId") || "");

  const targetUser = await User.findOne({
    _id: userId,
    organization: user.organizationId,
    userType: "customer"
  });
  if (!targetUser) throw new Error("Usuario no encontrado");

  if (targetUser._id.toString() === user.id) {
    throw new Error("No puedes eliminarte a ti mismo");
  }

  const org = await Organization.findById(user.organizationId).lean();
  if (org?.createdBy?.toString() === userId) {
    throw new Error("No se puede eliminar al administrador de la organización");
  }

  const targetEmail = targetUser.email;

  await User.findByIdAndUpdate(userId, {
    organization: null,
    organizationRole: null
  });

  await logAction({
    userId: user.id,
    organizationId: user.organizationId,
    userEmail: user.email,
    userName: user.name,
    action: "remove",
    entity: "org_user",
    entityId: userId,
    details: `Eliminó a ${targetEmail} de la organización`
  });

  redirect("/dashboard/settings/users");
}
