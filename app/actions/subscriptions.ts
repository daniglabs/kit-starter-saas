"use server";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getCurrentUserWithOrg } from "@/lib/session";
import { Plan } from "@/models/Plan";
import { Subscription } from "@/models/Subscription";
import { logAction } from "@/lib/audit";

function computePeriodEnd(interval: "month" | "year" | "one_time", from: Date) {
  if (interval === "month") {
    const d = new Date(from);
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  if (interval === "year") {
    const d = new Date(from);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  return undefined;
}

export async function changeOrganizationPlan(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user) redirect("/login");
  if (!user.organizationId) {
    redirect("/dashboard/billing?error=No%20tienes%20organizaci%C3%B3n%20asociada");
  }
  if (!user.isOrgAdmin && user.userType !== "admin") {
    redirect("/dashboard/billing?error=Solo%20el%20administrador%20de%20la%20organizaci%C3%B3n%20puede%20cambiar%20el%20plan");
  }

  const planId = String(formData.get("planId") || "");
  if (!planId) {
    redirect("/dashboard/billing?error=Debes%20seleccionar%20un%20plan");
  }

  await connectDB();

  const plan = await Plan.findById(planId).lean();
  if (!plan || plan.active === false) {
    redirect("/dashboard/billing?error=El%20plan%20seleccionado%20no%20est%C3%A1%20disponible");
  }

  const now = new Date();
  const provider = "manual";
  const providerSubscriptionId = `manual-${user.organizationId}`;

  const sub = await Subscription.findOneAndUpdate(
    {
      organization: user.organizationId,
      provider,
      providerSubscriptionId
    },
    {
      $set: {
        organization: user.organizationId,
        plan: plan._id,
        status: "active",
        provider,
        providerSubscriptionId,
        cancelAtPeriodEnd: false,
        currentPeriodStart: now,
        currentPeriodEnd: computePeriodEnd(plan.interval, now),
        trialEnd: undefined,
        metadata: { source: "dashboard_manual_switch" }
      }
    },
    { upsert: true, new: true }
  );

  await logAction({
    userId: user.id,
    organizationId: user.organizationId,
    userEmail: user.email,
    userName: user.name,
    action: "update",
    entity: "subscription",
    entityId: String(sub._id),
    details: `Cambió plan a ${plan.name} (${plan.slug})`
  });

  redirect("/dashboard/billing?changed=1");
}
