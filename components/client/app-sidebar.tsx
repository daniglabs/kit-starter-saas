"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  CreditCard
} from "lucide-react";
import { signOut } from "next-auth/react";

type SidebarVariant = "admin" | "customer";

interface SidebarLink {
  href: string;
  label: string;
  icon: "dashboard" | "users" | "profile" | "settings" | "logs" | "plans";
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
  logs: ScrollText,
  plans: CreditCard
};

export function AppSidebar({ variant, links }: AppSidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-0 flex-col md:h-screen md:w-60 md:shrink-0 md:bg-white">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-foreground hover:bg-gray-100"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar-nav"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium text-foreground">SaaS Kit</span>
      </header>

      <div
        role="presentation"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden
      />

      <aside
        id="app-sidebar-nav"
        className={`fixed inset-y-0 left-0 z-50 flex h-full min-h-0 w-60 max-w-[85vw] flex-col border-r border-border bg-white px-4 py-6 shadow-lg transition-transform duration-200 ease-out md:relative md:inset-auto md:z-auto md:max-w-none md:h-full md:min-h-0 md:translate-x-0 md:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {variant === "admin" ? "Panel admin" : "Panel cliente"}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">SaaS Kit</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = iconMap[link.icon];
            const isActive = activeLink?.href === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            closeMenu();
            signOut({ callbackUrl: "/login" });
          }}
          className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 pt-4 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </aside>
    </div>
  );
}

