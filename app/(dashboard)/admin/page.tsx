export default async function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de administrador
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido al resumen del panel. Desde aquí podrás navegar a
            usuarios, organizaciones y métricas.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h2 className="text-sm font-medium">Organizaciones</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Resumen y gestión de organizaciones (placeholder).
          </p>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-medium">Usuarios</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Consulta y gestiona los usuarios desde la pestaña Usuarios.
          </p>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-medium">Actividad</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Métricas básicas del SaaS (placeholder).
          </p>
        </div>
      </section>
    </div>
  );
}

