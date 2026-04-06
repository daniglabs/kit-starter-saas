import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getCurrentUserWithOrg } from "@/lib/session";
import { Plan } from "@/models/Plan";
import { Subscription } from "@/models/Subscription";
import { changeOrganizationPlan } from "@/app/actions/subscriptions";

function formatMoney(minor: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency || "EUR"
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

function intervalLabel(value: "month" | "year" | "one_time") {
  if (value === "month") return "mensual";
  if (value === "year") return "anual";
  return "pago único";
}

export default async function SettingsBillingPage({
  searchParams
}: {
  searchParams: { changed?: string; error?: string };
}) {
  const user = await getCurrentUserWithOrg();
  if (!user) redirect("/login");
  if (!user.organizationId) redirect("/dashboard");
  if (!user.isOrgAdmin) redirect("/dashboard/settings");

  await connectDB();

  const [plans, currentSubscription] = await Promise.all([
    Plan.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    Subscription.findOne({
      organization: user.organizationId,
      status: { $in: ["trialing", "active", "past_due"] }
    })
      .sort({ updatedAt: -1 })
      .populate("plan")
      .lean()
  ]);

  const currentPlanId = currentSubscription?.plan
    ? String((currentSubscription.plan as any)._id || currentSubscription.plan)
    : null;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Plan y facturación
        </h2>
        <p className="text-sm text-muted-foreground">
          Cambia de plan manualmente mientras se integra la pasarela de pagos.
        </p>
      </header>

      {searchParams.changed === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Plan actualizado correctamente.
        </div>
      )}

      {searchParams.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {searchParams.error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan: any) => {
          const isCurrent = currentPlanId === String(plan._id);
          return (
            <article key={String(plan._id)} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {intervalLabel(plan.interval)}
                  </p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Plan actual
                  </span>
                )}
              </div>

              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatMoney(plan.priceMinor, plan.currency)}
              </p>

              {plan.description && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              )}

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f: string, idx: number) => (
                    <li key={`${plan._id}-feature-${idx}`}>- {f}</li>
                  ))}
                </ul>
              )}

              <form action={changeOrganizationPlan} className="mt-5">
                <input type="hidden" name="planId" value={String(plan._id)} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {isCurrent ? "Activo" : "Cambiar a este plan"}
                </button>
              </form>
            </article>
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        ¿No encuentras un plan que se adapte a tu equipo?{" "}
        <a href="mailto:soporte@saaskit.local" className="font-medium text-primary hover:underline">
          Contacta con soporte
        </a>
        .
      </p>
    </div>
  );
}
