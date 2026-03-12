"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("No autorizado");
  }
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "customer");

  if (!name || !email || !password) {
    throw new Error("Nombre, email y contraseña son obligatorios");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Ya existe un usuario con este email");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role
  });

  redirect("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "customer");

  if (!userId) {
    throw new Error("userId es obligatorio");
  }

  await User.findByIdAndUpdate(userId, { role });

  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const userId = String(formData.get("userId") || "");

  if (!userId) {
    throw new Error("userId es obligatorio");
  }

  await User.findByIdAndDelete(userId);

  redirect("/admin/users");
}

