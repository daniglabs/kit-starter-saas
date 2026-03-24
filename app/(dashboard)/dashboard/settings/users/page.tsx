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
import { InviteOrgUserModal } from "@/components/client/invite-org-user-modal";

export default async function OrgUsersPage({
  searchParams
}: {
  searchParams: Promise<{ invited?: string }>
}) {
  const params = await searchParams;
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "users.read")) {
    if (hasPermission(user, "roles.read")) {
      redirect("/dashboard/settings/roles");
    }
    if (hasPermission(user, "logs.read")) {
      redirect("/dashboard/settings/logs");
    }
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
      {params.invited === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Invitación enviada correctamente por correo.
        </div>
      )}

      {hasPermission(user, "users.create") && (
        <section className="card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Invitar usuario
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Añade un nuevo usuario a tu organización asignándole un rol.
              </p>
            </div>
            <InviteOrgUserModal roles={rolesForSelect} inviteAction={inviteOrgUser} />
          </div>
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
