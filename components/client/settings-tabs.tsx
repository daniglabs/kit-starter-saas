"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsTabsProps {
  canAccessRoles: boolean;
  canAccessUsers: boolean;
  canAccessLogs: boolean;
  canAccessBilling: boolean;
}

export function SettingsTabs({
  canAccessRoles,
  canAccessUsers,
  canAccessLogs,
  canAccessBilling
}: SettingsTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-border">
      {canAccessRoles && (
        <Link
          href="/dashboard/settings/roles"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            pathname?.includes("/roles")
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Roles
        </Link>
      )}
      {canAccessUsers && (
        <Link
          href="/dashboard/settings/users"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            pathname?.includes("/users")
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Usuarios
        </Link>
      )}
      {canAccessBilling && (
        <Link
          href="/dashboard/settings/billing"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            pathname?.includes("/billing")
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Planes
        </Link>
      )}
      {canAccessLogs && (
        <Link
          href="/dashboard/settings/logs"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            pathname?.includes("/logs")
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Logs
        </Link>
      )}
    </nav>
  );
}
