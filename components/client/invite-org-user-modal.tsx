"use client"

import { useState } from "react"

interface RoleOption {
  _id: string
  name: string
}

interface InviteOrgUserModalProps {
  roles: RoleOption[]
  inviteAction: (formData: FormData) => Promise<void>
}

export function InviteOrgUserModal({ roles, inviteAction }: InviteOrgUserModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => setIsOpen(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="btn-primary whitespace-nowrap">
        Crear usuario
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-xl">
            <header className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Crear usuario
              </h2>
              <p className="text-xs text-muted-foreground">
                Completa los datos para invitar un nuevo usuario. Recibirá un email para definir su contraseña.
              </p>
            </header>

            <form action={inviteAction} className="space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Rol
                </label>
                <select
                  name="roleId"
                  required
                  className="select-base w-full"
                >
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={handleClose} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Invitar usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
