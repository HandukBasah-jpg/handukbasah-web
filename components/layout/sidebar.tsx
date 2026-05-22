"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  StickyNote,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Keuangan",
    href: "/keuangan",
    icon: Wallet,
  },
  {
    label: "Notepad",
    href: "/notepad",
    icon: StickyNote,
  },
  {
    label: "Kalender",
    href: "/kalender",
    icon: CalendarDays,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-xl border border-border/50 p-2.5 rounded-xl shadow-lg"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-2xl transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight">HandukBasah</h1>
                <p className="text-[10px] text-muted-foreground">Personal App</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="h-9 w-9 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          )}

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-[72px] h-6 w-6 items-center justify-center rounded-full bg-card border border-border/50 shadow-md hover:bg-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-3 w-3 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-3">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-blue-500/10 text-indigo-400 shadow-sm border border-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive && "text-indigo-400"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="text-sm">Keluar</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
