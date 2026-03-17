"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { updateUser, deleteUser } from "@/app/actions/users";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface UsersTableProps {
  users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Creado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-3 py-2 text-sm text-foreground">{user.name}</td>
                <td className="px-3 py-2 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-3 py-2 text-sm capitalize">{user.userType}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <form action={deleteUser} className="inline">
                      <input
                        type="hidden"
                        name="userId"
                        value={String(user._id)}
                      />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
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
                Editar usuario
              </h2>
              <p className="text-xs text-muted-foreground">
                Modifica el email y el rol del usuario.
              </p>
            </header>
            <form action={updateUser} className="space-y-4">
              <input type="hidden" name="userId" value={editingUser._id} />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  required
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Tipo de usuario
                </label>
                <select
                  name="userType"
                  defaultValue={editingUser.userType}
                  className="select-base w-full"
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
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
