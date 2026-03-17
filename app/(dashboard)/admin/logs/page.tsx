import { connectDB } from "@/lib/db";
import { Log } from "@/models/Log";

const PAGE_SIZE = 50;

export default async function AdminLogsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDB();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    Log.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Log.countDocuments()
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ACTION_LABELS: Record<string, string> = {
    login: "Login",
    logout: "Logout",
    create: "Crear",
    update: "Editar",
    delete: "Eliminar",
    invite: "Invitar",
    update_role: "Cambiar rol",
    remove: "Eliminar de org",
    password_change: "Cambiar contraseña"
  };

  const ENTITY_LABELS: Record<string, string> = {
    auth: "Autenticación",
    user: "Usuario",
    org_user: "Usuario org",
    org_role: "Rol org",
    profile: "Perfil"
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Logs de actividad
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro de todas las acciones realizadas por los usuarios de la plataforma.
        </p>
      </header>

      <section className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No hay registros aún.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr
                    key={String(log._id)}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("es-ES", {
                        dateStyle: "short",
                        timeStyle: "medium"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-foreground">
                          {log.userName}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({log.userEmail})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ENTITY_LABELS[log.entity] ?? log.entity}
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-muted-foreground">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <a
                href={page > 1 ? `/admin/logs?page=${page - 1}` : "#"}
                className={`rounded px-3 py-1 text-sm ${
                  page > 1
                    ? "text-primary hover:bg-primary/10"
                    : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                Anterior
              </a>
              <a
                href={page < totalPages ? `/admin/logs?page=${page + 1}` : "#"}
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
