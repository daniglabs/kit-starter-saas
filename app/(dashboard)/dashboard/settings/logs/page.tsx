import { connectDB } from "@/lib/db";
import { Log } from "@/models/Log";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { redirect } from "next/navigation";
import { LogsTable, type LogRow } from "@/components/logs-table";

const PAGE_SIZE = 50;

export default async function OrgSettingsLogsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "logs.read")) {
    redirect("/dashboard");
  }

  await connectDB();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const filter = { organization: user.organizationId };

  const [rawLogs, total] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Log.countDocuments(filter)
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

  const pageLink = (p: number) => {
    const q = new URLSearchParams();
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return `/dashboard/settings/logs${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">
            Actividad en tu organización
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Registros de acciones realizadas por usuarios de esta organización
            (acceso, invitaciones, roles, perfil, etc.).
          </p>
        </div>
        <LogsTable logs={logs} emptyMessage="No hay actividad registrada para tu organización." />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <a
                href={page > 1 ? pageLink(page - 1) : "#"}
                className={`rounded px-3 py-1 text-sm ${
                  page > 1
                    ? "text-primary hover:bg-primary/10"
                    : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                Anterior
              </a>
              <a
                href={page < totalPages ? pageLink(page + 1) : "#"}
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
