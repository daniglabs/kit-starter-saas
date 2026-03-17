import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OrganizationRole } from "@/models/OrganizationRole";
import {
  inviteOrgUser,
  updateOrgUserRole,
  removeOrgUser
} from "@/app/actions/org-users";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { redirect } from "next/navigation";
import { OrgUsersTable } from "@/components/client/org-users-table";

export default async function OrgUsersPage() {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "users.read")) {
    redirect("/dashboard");
  }

  await connectDB();

  const [orgUsers, roles] = await Promise.all([
    User.find({
      organization: user.organizationId,
      userType: "customer"
    })
      .populate("organization")
      .populate("organizationRole")
      .sort({ createdAt: -1 })
      .lean(),
    OrganizationRole.find({
      organization: user.organizationId
    })
      .sort({ name: 1 })
      .lean()
  ]);

  const usersForTable = orgUsers.map((u: any) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    roleId: u.organizationRole ? String(u.organizationRole._id) : null,
    roleName: u.organizationRole?.name ?? "—",
    isOrgAdmin:
      (u.organization as any)?.createdBy?.toString?.() === String(u._id),
    isCurrentUser: String(u._id) === user.id
  }));

  const rolesForSelect = roles.map((r: any) => ({
    _id: String(r._id),
    name: r.name
  }));

  return (
    <div className="space-y-6">
      {hasPermission(user, "users.create") && (
        <section className="card p-4">
          <h2 className="text-sm font-medium text-foreground">
            Invitar usuario
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Añade un nuevo usuario a tu organización asignándole un rol.
          </p>
          <form action={inviteOrgUser} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nombre
                </label>
                <input
                  name="firstName"
                  placeholder="Ej: María"
                  required
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Apellidos
                </label>
                <input
                  name="lastName"
                  placeholder="Ej: García López"
                  className="input-base"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="email@ejemplo.com"
                required
                className="input-base"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Rol
                </label>
                <select name="roleId" required className="select-base w-full">
                  {rolesForSelect.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Invitar usuario
            </button>
          </form>
        </section>
      )}

      <section className="card p-4">
        <h2 className="text-sm font-medium text-foreground">
          Usuarios de la organización
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Gestiona los usuarios invitados y sus roles.
        </p>
        <OrgUsersTable
          users={usersForTable}
          roles={rolesForSelect}
          canUpdate={hasPermission(user!, "users.update")}
          canDelete={hasPermission(user!, "users.delete")}
          updateAction={updateOrgUserRole}
          removeAction={removeOrgUser}
        />
      </section>
    </div>
  );
}
