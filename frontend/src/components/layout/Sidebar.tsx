"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ListTodo, Users, CheckSquare,
  BarChart3, ScrollText, Settings, Zap, History,
  User, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui";

const adminNav = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/admin/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/dashboard/admin/users", icon: Users, label: "Users" },
  { href: "/dashboard/admin/reviews", icon: CheckSquare, label: "Reviews" },
  { href: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
  { href: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
];

const userNav = [
  { href: "/dashboard/user", icon: LayoutDashboard, label: "My Tasks" },
  { href: "/ai-studio", icon: Zap, label: "AI Studio" },
  { href: "/dashboard/user/history", icon: History, label: "History" },
  { href: "/dashboard/user/profile", icon: User, label: "Profile" },
  { href: "/dashboard/user/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const nav = isAdmin ? adminNav : userNav;

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-card border-r border-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-display font-bold text-lg tracking-tight"
              >
                TaskHub
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-item", active && "sidebar-item-active")}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-border">
        <div className={cn("flex items-center gap-3 px-2 py-2", !sidebarOpen && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <AnimatePresence>
            {sidebarOpen && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
