import { redirect } from "next/navigation";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");

  // Redirigir a la primera sección a la que tenga acceso
  if (hasPermission(user, "users.read")) redirect("/dashboard/settings/users");
  if (hasPermission(user, "roles.read")) redirect("/dashboard/settings/roles");
  if (hasPermission(user, "logs.read")) redirect("/dashboard/settings/logs");
  redirect("/dashboard");
}
