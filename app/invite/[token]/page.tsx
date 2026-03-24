import Link from "next/link"
import { connectDB } from "@/lib/db"
import { UserInvitation } from "@/models/UserInvitation"
import { hashInvitationToken } from "@/lib/invitations"
import { InviteAcceptForm } from "@/components/client/invite-accept-form"

export default async function InvitationPage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  await connectDB()

  const invitation = await UserInvitation.findOne({
    tokenHash: hashInvitationToken(token),
    usedAt: null,
    expiresAt: { $gt: new Date() }
  }).lean()

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-md space-y-4 p-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Invitacion no valida
          </h1>
          <p className="text-sm text-muted-foreground">
            El enlace no existe, ya fue usado o ha caducado.
          </p>
          <Link href="/login" className="btn-primary w-full">
            Ir al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md space-y-6 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Activa tu cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Define tu contraseña para completar el acceso.
          </p>
        </header>

        <InviteAcceptForm token={token} />
      </div>
    </main>
  )
}
