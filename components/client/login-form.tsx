"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, LogIn } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const invitedParam = searchParams.get("invited");
  const errorMessage =
    localError ||
    (errorParam === "CredentialsSignin"
      ? "Credenciales no válidas"
      : errorParam === "InvitacionExpirada"
      ? "La invitación ha expirado o ya fue utilizada"
      : errorParam);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setLocalError("Email y contraseña son obligatorios");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/"
    });

    if (result?.error) {
      setLocalError("Credenciales no válidas");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md space-y-6 p-8">
        <header className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Accede a tu cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Un único login para panel de administrador o cliente según tu rol.
          </p>
        </header>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {invitedParam === "1" && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Cuenta activada correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
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

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-base block w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-70"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

