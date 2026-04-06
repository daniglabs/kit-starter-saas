import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { resetPassword } from "@/app/actions/auth-public";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token || "";
  const error = searchParams.error;
  const hasToken = !!token;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md space-y-6 p-8">
        <header className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Restablecer contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Define una nueva contraseña para tu cuenta.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {!hasToken ? (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
            <p>No se encontró un token válido en la URL.</p>
            <Link href="/forgot-password" className="font-medium underline">
              Solicitar un nuevo enlace
            </Link>
          </div>
        ) : (
          <form action={resetPassword} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="input-base block w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="input-base block w-full"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Guardar contraseña
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}
