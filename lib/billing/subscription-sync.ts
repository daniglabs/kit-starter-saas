import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";
import { Subscription } from "@/models/Subscription";
import type { NormalizedBillingEvent } from "./types";

async function resolvePlanId(
  planId?: string,
  planSlug?: string
): Promise<string | null> {
  if (planId) {
    const p = await Plan.findById(planId).select("_id").lean();
    return p ? String((p as { _id: unknown })._id) : null;
  }
  if (planSlug) {
    const p = await Plan.findOne({ slug: planSlug }).select("_id").lean();
    return p ? String((p as { _id: unknown })._id) : null;
  }
  return null;
}

export async function applyNormalizedBillingEvents(
  events: NormalizedBillingEvent[]
) {
  await connectDB();
  for (const ev of events) {
    if (ev.type === "subscription.upsert") {
      await upsertSubscription(ev);
    }
  }
}

async function upsertSubscription(
  ev: Extract<NormalizedBillingEvent, { type: "subscription.upsert" }>
) {
  const planOid = await resolvePlanId(ev.planId, ev.planSlug);
  if (!planOid) {
    console.warn("[billing] Suscripción sin plan resuelto; se omite", ev);
    return;
  }

  await Subscription.findOneAndUpdate(
    {
      organization: ev.organizationId,
      provider: ev.provider,
      providerSubscriptionId: ev.providerSubscriptionId
    },
    {
      $set: {
        organization: ev.organizationId,
        plan: planOid,
        status: ev.status,
        provider: ev.provider,
        providerSubscriptionId: ev.providerSubscriptionId,
        providerCustomerId: ev.providerCustomerId,
        currentPeriodStart: ev.currentPeriodStart,
        currentPeriodEnd: ev.currentPeriodEnd,
        cancelAtPeriodEnd: ev.cancelAtPeriodEnd ?? false,
        trialEnd: ev.trialEnd
      }
    },
    { upsert: true, new: true }
  );
}
