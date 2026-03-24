"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { BillingInterval, PlanTier } from "@/models/Plan";

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  month: "Mensual",
  year: "Anual",
  one_time: "Único"
};

const TIER_LABELS: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  custom: "Personalizado"
};

export interface AdminPlanRow {
  _id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  description: string;
  priceMinor: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  active: boolean;
  sortOrder: number;
  providerPriceIds: Record<string, string>;
}

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

type IntervalFilter = "all" | "month" | "year" | "one_time";

interface AdminPlansTableProps {
  plans: AdminPlanRow[];
  createAction?: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function AdminPlansTable({
  plans,
  createAction,
  updateAction,
  deleteAction
}: AdminPlansTableProps) {
  const [editing, setEditing] = useState<AdminPlanRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [intervalFilter, setIntervalFilter] = useState<IntervalFilter>("all");

  const filteredPlans = useMemo(() => {
    if (intervalFilter === "month") {
      return plans.filter((p) => p.interval === "month");
    }
    if (intervalFilter === "year") {
      return plans.filter((p) => p.interval === "year");
    }
    if (intervalFilter === "one_time") {
      return plans.filter((p) => p.interval === "one_time");
    }
    return plans;
  }, [plans, intervalFilter]);

  const filterPill = (value: IntervalFilter, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setIntervalFilter(value)}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        intervalFilter === value
          ? "bg-primary text-primary-foreground"
          : "bg-gray-100 text-muted-foreground hover:bg-gray-200 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Intervalo
          </span>
          {filterPill("all", "Todos")}
          {filterPill("month", "Mensuales")}
          {filterPill("year", "Anuales")}
          {filterPill("one_time", "Pago único")}
        </div>
        {createAction && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-2 self-start text-sm"
          >
            <Plus className="h-4 w-4" />
            Crear plan
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Nivel</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Intervalo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay planes con este filtro.
                </td>
              </tr>
            )}
            {filteredPlans.map((plan) => (
              <tr
                key={plan._id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  {plan.name}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{plan.slug}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {TIER_LABELS[plan.tier]}
                </td>
                <td className="px-3 py-2">
                  {formatMoney(plan.priceMinor, plan.currency)}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {INTERVAL_LABELS[plan.interval]}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      plan.active
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {plan.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateOpen(false);
                        setEditing(plan);
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <form action={deleteAction} className="inline">
                      <input type="hidden" name="planId" value={plan._id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && createAction && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-xl">
            <header className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Crear plan
              </h2>
              <p className="text-xs text-muted-foreground">
                Precio en euros (se guarda en céntimos). Slug único.
              </p>
            </header>
            <form action={createAction} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Nombre
                  </label>
                  <input
                    name="name"
                    placeholder="Ej. Pro"
                    required
                    className="input-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Slug
                  </label>
                  <input
                    name="slug"
                    placeholder="ej. pro-mensual"
                    required
                    className="input-base"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nivel
                </label>
                <select name="tier" className="select-base w-full">
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="input-base min-h-[4rem]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Precio (€)
                  </label>
                  <input
                    name="priceEuros"
                    type="text"
                    inputMode="decimal"
                    defaultValue="0"
                    className="input-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Moneda
                  </label>
                  <input
                    name="currency"
                    defaultValue="EUR"
                    className="input-base"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Intervalo
                </label>
                <select name="interval" className="select-base w-full">
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                  <option value="one_time">Pago único</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Funcionalidades (una por línea)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  className="input-base min-h-[6rem] font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  IDs pasarelas (JSON opcional)
                </label>
                <textarea
                  name="providerPriceIds"
                  rows={2}
                  placeholder='{"stripe":"price_xxx"}'
                  className="input-base min-h-[3rem] font-mono text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="rounded border-border"
                />
                <span>Plan activo</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Crear plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-xl">
            <header className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Editar plan
              </h2>
              <p className="text-xs text-muted-foreground">
                Slug único; precio en euros (se guarda en céntimos).
              </p>
            </header>
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="planId" value={editing._id} />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nombre
                </label>
                <input
                  name="name"
                  defaultValue={editing.name}
                  required
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Slug
                </label>
                <input
                  name="slug"
                  defaultValue={editing.slug}
                  required
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nivel (agrupa mensual/anual)
                </label>
                <select
                  name="tier"
                  defaultValue={editing.tier}
                  className="select-base w-full"
                >
                  {(Object.keys(TIER_LABELS) as PlanTier[]).map((t) => (
                    <option key={t} value={t}>
                      {TIER_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editing.description}
                  className="input-base min-h-[4rem]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Precio (€)
                  </label>
                  <input
                    name="priceEuros"
                    type="text"
                    inputMode="decimal"
                    defaultValue={(editing.priceMinor / 100).toFixed(2)}
                    required
                    className="input-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Moneda (ISO)
                  </label>
                  <input
                    name="currency"
                    defaultValue={editing.currency}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Intervalo
                  </label>
                  <select
                    name="interval"
                    defaultValue={editing.interval}
                    className="select-base w-full"
                  >
                    {(Object.keys(INTERVAL_LABELS) as BillingInterval[]).map(
                      (i) => (
                        <option key={i} value={i}>
                          {INTERVAL_LABELS[i]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Orden
                  </label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={editing.sortOrder}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Funcionalidades (una por línea)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={editing.features.join("\n")}
                  className="input-base min-h-[6rem] font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  IDs en pasarelas (JSON)
                </label>
                <textarea
                  name="providerPriceIds"
                  rows={2}
                  defaultValue={JSON.stringify(editing.providerPriceIds, null, 0)}
                  placeholder='{"stripe":"price_xxx"}'
                  className="input-base min-h-[3rem] font-mono text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing.active}
                  className="rounded border-border"
                />
                <span>Plan activo (visible para nuevas suscripciones)</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
