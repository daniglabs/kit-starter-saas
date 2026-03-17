"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface OrgUserRow {
  _id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string;
  isOrgAdmin: boolean;
  isCurrentUser: boolean;
}

interface RoleOption {
  _id: string;
  name: string;
}

interface OrgUsersTableProps {
  users: OrgUserRow[];
  roles: RoleOption[];
  canUpdate: boolean;
  canDelete: boolean;
  updateAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
}

export function OrgUsersTable({
  users,
  roles,
  canUpdate,
  canDelete,
  updateAction,
  removeAction
}: OrgUsersTableProps) {
  const [editingUser, setEditingUser] = useState<OrgUserRow | null>(null);

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-3 py-2 text-sm text-foreground">
                  {user.name}
                  {user.isOrgAdmin && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (admin org)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-3 py-2 text-sm">{user.roleName}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {canUpdate && !user.isOrgAdmin && (
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                        title="Editar rol"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && !user.isCurrentUser && !user.isOrgAdmin && (
                      <form action={removeAction} className="inline">
                        <input type="hidden" name="userId" value={user._id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Eliminar de la organización"
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

      {editingUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl">
            <header className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Editar rol de usuario
              </h2>
              <p className="text-xs text-muted-foreground">
                Cambia el rol de {editingUser.name} en la organización.
              </p>
            </header>
            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="userId" value={editingUser._id} />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Rol
                </label>
                <select
                  name="roleId"
                  defaultValue={editingUser.roleId ?? ""}
                  required
                  className="select-base w-full"
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
