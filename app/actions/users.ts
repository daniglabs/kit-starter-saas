"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).userType !== "admin") {
    throw new Error("No autorizado");
  }
  return session.user as { id: string; name: string; email: string };
}

export async function createUser(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const userType = String(formData.get("userType") || "customer");

  if (!name || !email || !password) {
    throw new Error("Nombre, email y contraseña son obligatorios");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Ya existe un usuario con este email");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    passwordHash,
    userType
  });

  await logAction({
    userId: admin.id,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "create",
    entity: "user",
    entityId: String(newUser._id),
    details: `Creó usuario ${email} (${userType})`
  });

  redirect("/admin/users");
}

export async function updateUser(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const userId = String(formData.get("userId") || "");
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const userType = String(formData.get("userType") || "customer");

  if (!userId) {
    throw new Error("userId es obligatorio");
  }

  if (!email) {
    throw new Error("El email es obligatorio");
  }

  const existing = await User.findOne({ email, _id: { $ne: userId } });
  if (existing) {
    throw new Error("Ya existe otro usuario con este email");
  }

  await User.findByIdAndUpdate(userId, { email, userType });

  await logAction({
    userId: admin.id,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "update",
    entity: "user",
    entityId: userId,
    details: `Editó usuario ${email} (${userType})`
  });

  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const userId = String(formData.get("userId") || "");

  if (!userId) {
    throw new Error("userId es obligatorio");
  }

  const targetUser = await User.findById(userId).lean();
  const targetEmail = (targetUser as any)?.email ?? userId;

  await User.findByIdAndDelete(userId);

  await logAction({
    userId: admin.id,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "delete",
    entity: "user",
    entityId: userId,
    details: `Eliminó usuario ${targetEmail}`
  });

  redirect("/admin/users");
}

