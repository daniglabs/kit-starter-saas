"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OrganizationRole } from "@/models/OrganizationRole";
import { logAction } from "@/lib/audit";

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
  const password = String(formData.get("password") || "");
  const roleId = String(formData.get("roleId") || "");

  if (!email || !firstName || !password || !roleId) {
    throw new Error("Email, nombre, contraseña y rol son obligatorios");
  }

  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || firstName;

  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });
  if (!role) throw new Error("Rol no válido");

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Ya existe un usuario con este email");

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    name,
    firstName,
    lastName,
    passwordHash,
    userType: "customer",
    organization: user.organizationId,
    organizationRole: roleId
  });

  await logAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "invite",
    entity: "org_user",
    entityId: String(newUser._id),
    details: `Invité a ${email} (${name}) en la organización`
  });

  redirect("/dashboard/settings/users");
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

  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });
  if (!role) throw new Error("Rol no válido");

  await User.findByIdAndUpdate(userId, { organizationRole: roleId });

  await logAction({
    userId: user.id,
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

  const targetEmail = targetUser.email;

  await User.findByIdAndUpdate(userId, {
    organization: null,
    organizationRole: null
  });

  await logAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "remove",
    entity: "org_user",
    entityId: userId,
    details: `Eliminó a ${targetEmail} de la organización`
  });

  redirect("/dashboard/settings/users");
}
