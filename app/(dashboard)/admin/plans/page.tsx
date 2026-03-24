import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";
import { createPlan, updatePlan, deletePlan } from "@/app/actions/plans";
import {
  AdminPlansTable,
  type AdminPlanRow
} from "@/components/client/admin-plans-table";

export default async function AdminPlansPage() {
  await connectDB();
  const plans = await Plan.find().sort({ sortOrder: 1, name: 1 }).lean();

  const rows: AdminPlanRow[] = plans.map((p: any) => ({
    _id: String(p._id),
    name: p.name,
    slug: p.slug,
    tier: p.tier ?? "custom",
    description: p.description ?? "",
    priceMinor: p.priceMinor ?? 0,
    currency: p.currency ?? "EUR",
    interval: p.interval,
    features: Array.isArray(p.features) ? p.features : [],
    active: p.active !== false,
    sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : 0,
    providerPriceIds:
      p.providerPriceIds && typeof p.providerPriceIds === "object"
        ? { ...p.providerPriceIds }
        : {}
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Planes
        </h1>
        <p className="text-sm text-muted-foreground">
          Define planes de precio (mensual, anual, etc.). El cliente elegirá
          en facturación; las pasarelas usan los IDs configurados en JSON.
        </p>
        <p className="text-xs text-muted-foreground">
          Descuento anual sugerido en seed: 25% sobre 12 meses (Pro: 180€/año;
          Business: 540€/año).
        </p>
      </header>

      <section className="card p-4">
        <h2 className="text-sm font-medium text-foreground">Catálogo actual</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Filtra por mensual, anual o pago único; crea un plan desde el botón o
          edita desde la tabla. No se puede eliminar si hay suscripciones
          activas vinculadas.
        </p>
        <AdminPlansTable
          plans={rows}
          createAction={createPlan}
          updateAction={updatePlan}
          deleteAction={deletePlan}
        />
      </section>
    </div>
  );
}
