"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, Settings, ScrollText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

type SidebarVariant = "admin" | "customer";

interface SidebarLink {
  href: string;
  label: string;
  icon: "dashboard" | "users" | "profile" | "settings" | "logs";
}

interface AppSidebarProps {
  variant: SidebarVariant;
  links: SidebarLink[];
}

const iconMap: Record<SidebarLink["icon"], React.ComponentType<any>> = {
  dashboard: LayoutDashboard,
  users: Users,
  profile: UserCircle,
  settings: Settings,
  logs: ScrollText
};

export function AppSidebar({ variant, links }: AppSidebarProps) {
  const pathname = usePathname();

  const activeLink = links.reduce<SidebarLink | null>((best, link) => {
    if (pathname === link.href) {
      return link;
    }
    if (pathname.startsWith(`${link.href}/`)) {
      if (!best || link.href.length > best.href.length) {
        return link;
      }
    }
    return best;
  }, null);

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-white px-4 py-6 shadow-sm">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {variant === "admin" ? "Panel admin" : "Panel cliente"}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">SaaS Kit</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          const isActive = activeLink?.href === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

