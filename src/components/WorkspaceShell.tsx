import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Upload, BarChart3,
  Gauge, Wand2, FileText, Moon, Sun, ChevronRight, FileSpreadsheet, Settings,
  Users, ShieldAlert, BellRing, LogOut,
} from "lucide-react";
import logo from "@/assets/intellecta-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useHydrateWorkspace } from "@/stores/workspace";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@tanstack/react-router";

const NAV: { label: string; items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Data",
    items: [
      { to: "/data/upload", label: "Data Portal", icon: Upload },
      { to: "/eda", label: "Insights & Trends", icon: BarChart3 },
    ],
  },
  {
    label: "Students",
    items: [
      { to: "/students", label: "Cohort Roster", icon: Users },
      { to: "/interventions", label: "Interventions", icon: ShieldAlert },
    ],
  },
  {
    label: "Modeling",
    items: [
      { to: "/model/evaluate", label: "Evaluate", icon: Gauge },
      { to: "/predict", label: "Predict", icon: Wand2 },
      { to: "/predict/batch", label: "Batch Predict", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Administration",
    items: [{ to: "/admin/models", label: "Model Operations", icon: Settings }],
  },
  {
    label: "Output",
    items: [
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/alerts", label: "Alerts", icon: BellRing },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/data/upload": "Data Portal",
  "/data/clean": "Cleaning",
  "/eda": "Insights & Trends",
  "/features": "Feature Engineering",
  "/students": "Cohort Roster",
  "/interventions": "Risk Mitigation & Interventions",
  "/alerts": "Automated Alerts",
  "/model/train": "Model Training",
  "/model/evaluate": "Evaluate",
  "/predict": "Predict",
  "/predict/batch": "Batch Predict",
  "/admin/models": "Model Operations",
  "/reports": "Reports & Insights",
};

function AppSidebar() {
  const loc = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" onClick={closeOnMobile} className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
            <img src={logo} alt="Intellecta" className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-mono text-sm font-bold tracking-[0.18em] text-sidebar-foreground">INTELLECTA</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">ML Workspace</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = loc.pathname === item.to;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to} onClick={closeOnMobile}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <LogoutMenuItem collapsed={collapsed} />
        {!collapsed && (
          <div className="px-2 py-1.5 text-[11px] text-sidebar-foreground/60">
            Intellecta v1 · UCI + synthetic
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function LogoutMenuItem({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const handle = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={handle} tooltip="Sign out" className="text-sidebar-foreground/90 hover:text-sidebar-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && (
            <span className="truncate">
              {user?.email ? `Sign out (${user.email})` : "Sign out"}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function RouteProgress() {
  const loc = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 350);
    return () => clearTimeout(t);
  }, [loc.pathname]);
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-50 h-0.5 bg-primary transition-all duration-300 ${
        visible ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}

function Topbar() {
  const loc = useLocation();
  const title = TITLES[loc.pathname] ?? "Intellecta";
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/75 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <nav className="ml-2 flex items-center gap-1.5 text-sm">
          <Link to="/dashboard" className="font-mono text-xs font-bold tracking-[0.18em] text-muted-foreground hover:text-foreground">INTELLECTA</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{title}</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs text-muted-foreground md:inline-flex">
          Role: <span className="ml-1 font-medium text-foreground">Faculty</span>
        </span>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

export function WorkspaceShell() {
  const loc = useLocation();
  useHydrateWorkspace();
  // Splash route renders fullscreen without the sidebar shell.
  if (loc.pathname === "/" || loc.pathname === "/auth") return <Outlet />;
  return (
    <SidebarProvider>
      <RouteProgress />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
