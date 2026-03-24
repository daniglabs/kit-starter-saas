import { connectDB } from "@/lib/db";
import { Log } from "@/models/Log";
import { Organization } from "@/models/Organization";
import { LogsTable, type LogRow } from "@/components/logs-table";

const PAGE_SIZE = 50;

function buildLogsQueryString(page: number, orgId: string | undefined) {
  const q = new URLSearchParams();
  if (page > 1) q.set("page", String(page));
  if (orgId) q.set("org", orgId);
  const s = q.toString();
  return `/admin/logs${s ? `?${s}` : ""}`;
}

export default async function AdminLogsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; org?: string }>;
}) {
  await connectDB();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const orgFilter = params.org?.trim() || undefined;
  const skip = (page - 1) * PAGE_SIZE;

  const filter = orgFilter ? { organization: orgFilter } : {};

  const [rawLogs, total, organizations] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Log.countDocuments(filter),
    Organization.find().sort({ name: 1 }).select("name slug").lean()
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const logs: LogRow[] = rawLogs.map((log: any) => ({
    _id: String(log._id),
    createdAt: log.createdAt,
    userName: log.userName,
    userEmail: log.userEmail,
    action: log.action,
    entity: log.entity,
    details: log.details
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Logs de actividad
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro de acciones en toda la plataforma. Filtra por organización
          para ver solo la actividad de clientes en esa organización.
        </p>
      </header>

      <form
        method="get"
        className="card flex flex-wrap items-end gap-4 p-4"
      >
        <input type="hidden" name="page" value="1" />
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <label
            htmlFor="admin-logs-org"
            className="text-xs font-medium text-foreground"
          >
            Organización
          </label>
          <select
            id="admin-logs-org"
            name="org"
            defaultValue={orgFilter ?? ""}
            className="select-base w-full max-w-md"
          >
            <option value="">Todas las organizaciones</option>
            {organizations.map((o: any) => (
              <option key={String(o._id)} value={String(o._id)}>
                {o.name} ({o.slug})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm">
          Filtrar
        </button>
        {orgFilter && (
          <a href="/admin/logs" className="btn-ghost text-sm">
            Quitar filtro
          </a>
        )}
      </form>

      <section className="card overflow-hidden p-0">
        <LogsTable logs={logs} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <a
                href={
                  page > 1
                    ? buildLogsQueryString(page - 1, orgFilter)
                    : "#"
                }
                className={`rounded px-3 py-1 text-sm ${
                  page > 1
                    ? "text-primary hover:bg-primary/10"
                    : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                Anterior
              </a>
              <a
                href={
                  page < totalPages
                    ? buildLogsQueryString(page + 1, orgFilter)
                    : "#"
                }
                className={`rounded px-3 py-1 text-sm ${
                  page < totalPages
                    ? "text-primary hover:bg-primary/10"
                    : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                Siguiente
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
