"use client";

import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";
import type { SidebarVariant } from "@/components/client/app-sidebar";

interface BackofficeTopbarProps {
  variant: SidebarVariant;
  userName?: string;
}

export function BackofficeTopbar({
  variant,
  userName
}: BackofficeTopbarProps) {
  const displayName = (userName || "").trim() || "Usuario";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="z-20 border-b border-border bg-white">
      <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div>
        
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-3 sm:gap-3 sm:pl-4">
          {variant === "customer" && (
            <Link
              href="/dashboard/settings/billing"
              className="btn-primary whitespace-nowrap text-xs"
            >
              Mejorar plan
            </Link>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
            aria-label="Menú de usuario"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initial}
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {displayName}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
