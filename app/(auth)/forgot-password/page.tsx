import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth-public";

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { sent?: string };
}) {
  const sent = searchParams.sent === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md space-y-6 p-8">
        <header className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            ¿Has olvidado tu contraseña?
          </h1>
          <p className="text-sm text-muted-foreground">
            Te enviaremos un enlace para restablecerla.
          </p>
        </header>

        {sent && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Si existe una cuenta con ese email, te hemos enviado un enlace para
            restablecer la contraseña.
          </div>
        )}

        <form action={requestPasswordReset} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-base block w-full"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Enviar enlace
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}
