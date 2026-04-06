"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import {
  createPasswordResetToken,
  getPasswordResetExpiryDate,
  hashPasswordResetToken
} from "@/lib/auth/password-reset";
import { getAppPublicUrl } from "@/lib/mail/templates/utils";
import { sendPasswordResetEmail } from "@/lib/mail";

function normalizeEmail(raw: FormDataEntryValue | null) {
  return String(raw || "").toLowerCase().trim();
}

function normalizeName(raw: FormDataEntryValue | null) {
  return String(raw || "").trim();
}

function toErrorParam(message: string) {
  return encodeURIComponent(message);
}

export async function registerUser(formData: FormData) {
  const name = normalizeName(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !email || !password || !confirmPassword) {
    redirect(`/register?error=${toErrorParam("Todos los campos son obligatorios")}`);
  }
  if (password.length < 6) {
    redirect(`/register?error=${toErrorParam("La contraseña debe tener al menos 6 caracteres")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/register?error=${toErrorParam("Las contraseñas no coinciden")}`);
  }

  await connectDB();
  const existingUser = await User.findOne({ email }).select("_id").lean();
  if (existingUser) {
    redirect(`/register?error=${toErrorParam("Ya existe una cuenta con este email")}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    email,
    name,
    firstName: name,
    lastName: "",
    passwordHash,
    userType: "customer",
    organization: null,
    organizationRole: null
  });

  redirect("/login?registered=1");
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  if (!email) redirect("/forgot-password?sent=1");

  await connectDB();

  const user = await User.findOne({ email }).select("_id").lean();
  if (user?._id) {
    const token = createPasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);

    await PasswordResetToken.deleteMany({
      user: user._id,
      usedAt: null
    });

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: getPasswordResetExpiryDate(),
      usedAt: null
    });

    const resetUrl = `${getAppPublicUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await sendPasswordResetEmail({
        to: email,
        resetUrl
      });
    } catch (error) {
      console.error("[auth-public] Error enviando email de reset:", error);
    }
  }

  // Mensaje genérico para evitar enumeración de usuarios.
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    redirect(`/reset-password?error=${toErrorParam("Token no válido")}`);
  }
  if (!password || !confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${toErrorParam("Debes completar ambos campos")}`);
  }
  if (password.length < 6) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${toErrorParam("La contraseña debe tener al menos 6 caracteres")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${toErrorParam("Las contraseñas no coinciden")}`);
  }

  await connectDB();

  const resetRecord = await PasswordResetToken.findOne({
    tokenHash: hashPasswordResetToken(token),
    usedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!resetRecord) {
    redirect(`/reset-password?error=${toErrorParam("El enlace no es válido o ha caducado")}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(resetRecord.user, { passwordHash });

  resetRecord.usedAt = new Date();
  await resetRecord.save();

  await PasswordResetToken.deleteMany({
    user: resetRecord.user,
    usedAt: null
  });

  redirect("/login?reset=1");
}
