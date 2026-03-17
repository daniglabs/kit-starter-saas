import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ProfileSuccessBanner } from "@/components/client/profile-success-banner";
import { updateProfile, changePassword } from "@/app/actions/profile";

interface ProfileFormProps {
  userId: string;
  redirectTo: string;
  profileUpdated?: boolean;
  passwordUpdated?: boolean;
}

export async function ProfileForm({
  userId,
  redirectTo,
  profileUpdated,
  passwordUpdated
}: ProfileFormProps) {
  await connectDB();
  const user = await User.findById(userId).lean();

  if (!user) return null;

  const firstName =
    (user as any).firstName || (user.name || "").split(" ")[0] || "";
  const lastName =
    (user as any).lastName ||
    (user.name || "").split(" ").slice(1).join(" ") ||
    "";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mi perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Edita tu información personal y cambia tu contraseña.
        </p>
      </header>

      <ProfileSuccessBanner
        profileUpdated={profileUpdated}
        passwordUpdated={passwordUpdated}
        redirectTo={redirectTo}
      />

      <section className="card p-6">
        <h2 className="text-sm font-medium text-foreground">Datos personales</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Actualiza tu nombre y apellidos.
        </p>
        <form
          action={updateProfile}
          className="mt-4 space-y-4"
        >
          <input
            type="hidden"
            name="redirectTo"
            value={redirectTo}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nombre
              </label>
              <input
                name="firstName"
                defaultValue={firstName}
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
                defaultValue={lastName}
                className="input-base"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email (no editable)
            </label>
            <p className="rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Guardar cambios
          </button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-sm font-medium text-foreground">
          Cambiar contraseña
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Introduce tu contraseña actual y la nueva contraseña.
        </p>
        <form
          action={changePassword}
          className="mt-4 space-y-4"
        >
          <input
            type="hidden"
            name="redirectTo"
            value={redirectTo}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Contraseña actual
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              placeholder="••••••••"
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Nueva contraseña
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Confirmar nueva contraseña
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="Repite la nueva contraseña"
              className="input-base"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Cambiar contraseña
          </button>
        </form>
      </section>
    </div>
  );
}

