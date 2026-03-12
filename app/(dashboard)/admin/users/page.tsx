import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createUser, updateUserRole, deleteUser } from "@/app/actions/users";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
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
        <h2 className="text-sm font-medium">Listado de usuarios</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Edita el rol o elimina usuarios existentes.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Creado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr
                  key={user._id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-3 py-2 text-sm">{user.name}</td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-3 py-2">
                    <form
                      action={updateUserRole}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="userId"
                        value={String(user._id)}
                      />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded-lg border border-border bg-black/30 px-2 py-1 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-full bg-primary/80 px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary"
                      >
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <form
                      action={deleteUser}
                      className="inline"
                    >
                      <input
                        type="hidden"
                        name="userId"
                        value={String(user._id)}
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-red-50 hover:bg-red-500"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div
        id="create-user"
        className="modal-target fixed inset-0 z-30 flex items-center justify-center bg-black/60 opacity-0 pointer-events-none"
      >
        <div className="w-full max-w-md rounded-xl border border-border bg-black p-6 shadow-lg">
          <header className="mb-4 space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight">
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
              <label className="text-xs font-medium">Nombre</label>
              <input
                name="name"
                placeholder="Nombre"
                required
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Email</label>
              <input
                name="email"
                type="email"
                placeholder="email@empresa.com"
                required
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Contraseña</label>
              <input
                name="password"
                type="password"
                placeholder="Contraseña segura"
                required
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Rol</label>
              <select
                name="role"
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
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

