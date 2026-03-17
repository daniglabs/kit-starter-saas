"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Permission } from "@/models/OrganizationRole";

interface OrgRoleRow {
  _id: string;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
}

interface OrgRolesTableProps {
  roles: OrgRoleRow[];
  permissionLabels: Record<Permission, string>;
  canUpdate: boolean;
  canDelete: boolean;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function OrgRolesTable({
  roles,
  permissionLabels,
  canUpdate,
  canDelete,
  updateAction,
  deleteAction
}: OrgRolesTableProps) {
  const [editingRole, setEditingRole] = useState<OrgRoleRow | null>(null);

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Permisos</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role._id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-3 py-2 text-sm text-foreground">
                  {role.name}
                  {role.isSystem && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (sistema)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {role.permissions.length > 0
                    ? role.permissions.map((p) => permissionLabels[p]).join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {canUpdate && !role.isSystem && (
                      <button
                        type="button"
                        onClick={() => setEditingRole(role)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && !role.isSystem && (
                      <form action={deleteAction} className="inline">
                        <input
                          type="hidden"
                          name="roleId"
                          value={role._id}
                        />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRole && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl">
            <header className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Editar rol
              </h2>
              <p className="text-xs text-muted-foreground">
                Modifica el nombre y los permisos del rol.
              </p>
            </header>
            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="roleId" value={editingRole._id} />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nombre
                </label>
                <input
                  name="name"
                  defaultValue={editingRole.name}
                  required
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Permisos
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(permissionLabels) as Permission[]).map(
                    (perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="permissions"
                          value={perm}
                          defaultChecked={editingRole.permissions.includes(perm)}
                          className="rounded border-border"
                        />
                        <span>{permissionLabels[perm]}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
