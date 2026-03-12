export default async function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Panel de cliente
        </h1>
        <p className="text-sm text-muted-foreground">
          Este es el resumen de tu cuenta. Aquí podrás ver tus métricas y
          actividad reciente.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-sm font-medium">Resumen</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Aquí podrás mostrar métricas y KPIs del cliente (placeholder).
          </p>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-medium">Organización</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Información sobre la organización asociada (placeholder).
          </p>
        </div>
      </section>
    </div>
  );
}

