"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; name: string; email: string } | undefined;
  if (!user?.id) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function updateProfile(formData: FormData) {
  const currentUser = await getAuthenticatedUser();
  await connectDB();

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/");

  if (!firstName) {
    throw new Error("El nombre es obligatorio");
  }

  const name = lastName ? `${firstName} ${lastName}` : firstName;

  const existingProfile = await User.findById(currentUser.id)
    .select("organization")
    .lean();
  const profileOrgId = existingProfile?.organization
    ? String(existingProfile.organization)
    : null;

  await User.findByIdAndUpdate(currentUser.id, {
    firstName,
    lastName,
    name
  });

  await logAction({
    userId: currentUser.id,
    organizationId: profileOrgId,
    userEmail: currentUser.email ?? "",
    userName: currentUser.name ?? "",
    action: "update",
    entity: "profile",
    entityId: currentUser.id,
    details: `Actualizó su perfil (${name})`
  });

  const url = new URL(redirectTo, "http://localhost");
  url.searchParams.set("profileUpdated", "1");
  redirect(url.pathname + url.search);
}

export async function changePassword(formData: FormData) {
  const currentUser = await getAuthenticatedUser();
  await connectDB();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const redirectTo = String(formData.get("redirectTo") || "/");

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("La nueva contraseña y la confirmación no coinciden");
  }

  if (newPassword.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
  }

  const user = await User.findById(currentUser.id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("La contraseña actual no es correcta");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(currentUser.id, { passwordHash });

  const orgPwd = user.organization
    ? String(user.organization)
    : null;

  await logAction({
    userId: currentUser.id,
    organizationId: orgPwd,
    userEmail: currentUser.email ?? "",
    userName: currentUser.name ?? "",
    action: "password_change",
    entity: "profile",
    entityId: currentUser.id,
    details: "Cambió su contraseña"
  });

  const url = new URL(redirectTo, "http://localhost");
  url.searchParams.set("passwordUpdated", "1");
  redirect(url.pathname + url.search);
}
