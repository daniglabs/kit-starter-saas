import {
  ACTION_LABELS,
  ENTITY_LABELS
} from "@/lib/constants/log-labels";

export type LogRow = {
  _id: string;
  createdAt: Date;
  userName: string;
  userEmail: string;
  action: string;
  entity: string;
  details: string;
};

interface LogsTableProps {
  logs: LogRow[];
  emptyMessage?: string;
  colSpan?: number;
}

export function LogsTable({
  logs,
  emptyMessage = "No hay registros aún.",
  colSpan = 5
}: LogsTableProps) {
  return (
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
                colSpan={colSpan}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            logs.map((log) => (
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
  );
}
