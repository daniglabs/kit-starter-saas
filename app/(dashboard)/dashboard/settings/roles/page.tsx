import { connectDB } from "@/lib/db";
import { OrganizationRole } from "@/models/OrganizationRole";
import {
  PERMISSIONS,
  type Permission
} from "@/models/OrganizationRole";
import {
  createOrgRole,
  updateOrgRole,
  deleteOrgRole
} from "@/app/actions/org-roles";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { redirect } from "next/navigation";
import { OrgRolesTable } from "@/components/client/org-roles-table";

const PERMISSION_LABELS: Record<Permission, string> = {
  "users.create": "Crear usuarios",
  "users.read": "Consultar usuarios",
  "users.update": "Editar usuarios",
  "users.delete": "Eliminar usuarios",
  "roles.create": "Crear roles",
  "roles.read": "Consultar roles",
  "roles.update": "Editar roles",
  "roles.delete": "Eliminar roles"
};

export default async function OrgRolesPage() {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "roles.read")) {
    redirect("/dashboard");
  }

  await connectDB();
  const roles = await OrganizationRole.find({
    organization: user.organizationId
  })
    .sort({ isSystem: -1, name: 1 })
    .lean();

  const rolesForTable = roles.map((r: any) => ({
    _id: String(r._id),
    name: r.name,
    permissions: r.permissions ?? [],
    isSystem: r.isSystem ?? false
  }));

  return (
    <div className="space-y-6">
      {hasPermission(user, "roles.create") && (
        <section className="card p-4">
          <h2 className="text-sm font-medium text-foreground">
            Crear nuevo rol
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Define un rol con permisos específicos para tu organización.
          </p>
          <form action={createOrgRole} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nombre del rol
              </label>
              <input
                name="name"
                placeholder="Ej: Editor, Viewer..."
                required
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Permisos
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={perm}
                      className="rounded border-border"
                    />
                    <span>{PERMISSION_LABELS[perm]}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Crear rol
            </button>
          </form>
        </section>
      )}

      <section className="card p-4">
        <h2 className="text-sm font-medium text-foreground">Roles existentes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Los roles de sistema no se pueden editar ni eliminar.
        </p>
        <OrgRolesTable
          roles={rolesForTable}
          permissionLabels={PERMISSION_LABELS}
          canUpdate={hasPermission(user!, "roles.update")}
          canDelete={hasPermission(user!, "roles.delete")}
          updateAction={updateOrgRole}
          deleteAction={deleteOrgRole}
        />
      </section>
    </div>
  );
}
