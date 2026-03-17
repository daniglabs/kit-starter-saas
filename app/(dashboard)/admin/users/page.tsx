import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createUser } from "@/app/actions/users";
import { UsersTable } from "@/components/client/users-table";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  const usersForTable = users.map((u: any) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    userType: u.userType,
    createdAt: u.createdAt
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona usuarios, roles y accesos del SaaS.
          </p>
        </div>
        <a
          href="#create-user"
          className="btn-primary whitespace-nowrap"
        >
          Crear usuario
        </a>
      </header>

      <section className="card p-4">
        <h2 className="text-sm font-medium text-foreground">Listado de usuarios</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Edita o elimina usuarios desde los botones de cada fila.
        </p>
        <UsersTable users={usersForTable} />
      </section>

      <div
        id="create-user"
        className="modal-target fixed inset-0 z-30 flex items-center justify-center bg-black/60 opacity-0 pointer-events-none"
      >
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl">
          <header className="mb-4 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Crear nuevo usuario
            </h2>
            <p className="text-xs text-muted-foreground">
              Introduce los datos del nuevo usuario. Podrás cambiar su rol más
              tarde desde la tabla.
            </p>
          </header>
          <form
            action={createUser}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Nombre</label>
              <input
                name="name"
                placeholder="Nombre"
                required
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email</label>
              <input
                name="email"
                type="email"
                placeholder="email@empresa.com"
                required
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Contraseña</label>
              <input
                name="password"
                type="password"
                placeholder="Contraseña segura"
                required
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tipo de usuario</label>
              <select
                name="userType"
                className="select-base w-full"
                defaultValue="customer"
              >
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <a
                href="/admin/users"
                className="btn-ghost text-xs"
              >
                Cancelar
              </a>
              <button
                type="submit"
                className="btn-primary text-xs"
              >
                Crear usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

