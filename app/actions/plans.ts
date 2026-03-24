"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";
import { Subscription } from "@/models/Subscription";
import { logAction } from "@/lib/audit";
import type { BillingInterval, PlanTier } from "@/models/Plan";

const TIERS: PlanTier[] = ["free", "pro", "business", "custom"];
const INTERVALS: BillingInterval[] = ["month", "year", "one_time"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).userType !== "admin") {
    throw new Error("No autorizado");
  }
  return session.user as { id: string; name: string; email: string };
}

function parseEurosToMinor(raw: string): number {
  const normalized = String(raw || "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Precio inválido");
  }
  return Math.round(n * 100);
}

function parseFeatures(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseProviderPriceIds(raw: string): Record<string, string> {
  const t = raw.trim();
  if (!t) return {};
  try {
    const obj = JSON.parse(t) as unknown;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new Error();
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    throw new Error("providerPriceIds debe ser un JSON objeto, ej: {\"stripe\":\"price_xxx\"}");
  }
}

function parseTier(raw: string): PlanTier {
  const t = raw as PlanTier;
  if (!TIERS.includes(t)) return "custom";
  return t;
}

function parseInterval(raw: string): BillingInterval {
  const i = raw as BillingInterval;
  if (!INTERVALS.includes(i)) {
    throw new Error("Intervalo no válido");
  }
  return i;
}

export async function createPlan(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = String(formData.get("description") || "").trim();
  const priceMinor = parseEurosToMinor(String(formData.get("priceEuros") ?? "0"));
  const currency = String(formData.get("currency") || "EUR")
    .trim()
    .toUpperCase();
  const interval = parseInterval(String(formData.get("interval") || "month"));
  const tier = parseTier(String(formData.get("tier") || "custom"));
  const active =
    formData.get("active") === "on" || formData.get("active") === "true";
  const features = parseFeatures(String(formData.get("features") || ""));
  const providerPriceIds = parseProviderPriceIds(
    String(formData.get("providerPriceIds") || "")
  );

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios");
  }

  const existing = await Plan.findOne({ slug });
  if (existing) {
    throw new Error("Ya existe un plan con este slug");
  }

  const last = await Plan.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
  const sortOrder = ((last as { sortOrder?: number } | null)?.sortOrder ?? -1) + 1;

  const plan = await Plan.create({
    name,
    slug,
    tier,
    description,
    priceMinor,
    currency,
    interval,
    features,
    active,
    sortOrder,
    providerPriceIds
  });

  await logAction({
    userId: admin.id,
    organizationId: null,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "create",
    entity: "plan",
    entityId: String(plan._id),
    details: `Creó plan ${name} (${slug})`
  });

  redirect("/admin/plans");
}

export async function updatePlan(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const planId = String(formData.get("planId") || "");
  if (!planId) throw new Error("planId es obligatorio");

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = String(formData.get("description") || "").trim();
  const priceMinor = parseEurosToMinor(String(formData.get("priceEuros") ?? "0"));
  const currency = String(formData.get("currency") || "EUR")
    .trim()
    .toUpperCase();
  const interval = parseInterval(String(formData.get("interval") || "month"));
  const tier = parseTier(String(formData.get("tier") || "custom"));
  const active =
    formData.get("active") === "on" || formData.get("active") === "true";
  const sortOrder = Number(formData.get("sortOrder"));
  const features = parseFeatures(String(formData.get("features") || ""));
  const providerPriceIds = parseProviderPriceIds(
    String(formData.get("providerPriceIds") || "")
  );

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios");
  }

  const dup = await Plan.findOne({ slug, _id: { $ne: planId } });
  if (dup) {
    throw new Error("Ya existe otro plan con este slug");
  }

  await Plan.findByIdAndUpdate(planId, {
    $set: {
      name,
      slug,
      tier,
      description,
      priceMinor,
      currency,
      interval,
      features,
      active,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      providerPriceIds
    }
  });

  await logAction({
    userId: admin.id,
    organizationId: null,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "update",
    entity: "plan",
    entityId: planId,
    details: `Actualizó plan ${name} (${slug})`
  });

  redirect("/admin/plans");
}

export async function deletePlan(formData: FormData) {
  const admin = await requireAdmin();
  await connectDB();

  const planId = String(formData.get("planId") || "");
  if (!planId) throw new Error("planId es obligatorio");

  const subs = await Subscription.countDocuments({ plan: planId });
  if (subs > 0) {
    throw new Error(
      "No se puede eliminar: hay suscripciones asociadas a este plan"
    );
  }

  const plan = await Plan.findByIdAndDelete(planId);
  await logAction({
    userId: admin.id,
    organizationId: null,
    userEmail: admin.email ?? "",
    userName: admin.name ?? "",
    action: "delete",
    entity: "plan",
    entityId: planId,
    details: `Eliminó plan ${plan?.name ?? planId}`
  });

  redirect("/admin/plans");
}
