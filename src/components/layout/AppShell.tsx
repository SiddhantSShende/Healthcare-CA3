import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  FlaskConical,
  GitCompare,
  Hospital,
  Info,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}

export const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your workflow overview",
  },
  {
    to: "/cost-estimator",
    label: "Cost estimator",
    icon: Calculator,
    description: "Estimate a service cost",
  },
  {
    to: "/providers",
    label: "Providers",
    icon: Hospital,
    description: "Explore the directory",
  },
  {
    to: "/compare",
    label: "Compare",
    icon: GitCompare,
    description: "Side-by-side comparison",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Healthcare data insights",
  },
  {
    to: "/methodology",
    label: "Methodology",
    icon: FlaskConical,
    description: "Models & explainability",
  },
  {
    to: "/about",
    label: "About",
    icon: Info,
    description: "Project information",
  },
];

function labelForPath(pathname: string): string {
  const item = navItems.find((nav) => pathname.startsWith(nav.to));
  return item?.label ?? "HealthCompare";
}

function SidebarNav({
  collapsed,
  compareCount,
  onNavigate,
}: {
  collapsed: boolean;
  compareCount: number;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
              />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.to === "/compare" && compareCount > 0 && (
                    <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {compareCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {item.description}
                </span>
              </span>
            )}
            {collapsed && item.to === "/compare" && compareCount > 0 && (
              <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {compareCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center px-4 py-5"
      aria-label="HealthCompare home"
    >
      <Logo showWordmark={!collapsed} />
    </Link>
  );
}

/**
 * Shared application shell: collapsible sidebar, top bar with breadcrumbs,
 * and a mobile navigation drawer. The landing page uses its own layout.
 */
export function AppShell({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { compareProviderIds } = useAppStore();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("hc.sidebar-collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("hc.sidebar-collapsed", prev ? "0" : "1");
      return !prev;
    });
  };

  const currentLabel = labelForPath(pathname);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
            collapsed ? "w-[76px]" : "w-[264px]",
          )}
        >
          <div className={cn("flex items-center justify-between", collapsed && "justify-center px-0")}>
            <BrandMark collapsed={collapsed} />
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 text-muted-foreground"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto mb-1 h-8 w-8 text-muted-foreground"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
            </Button>
          )}
          <SidebarNav collapsed={collapsed} compareCount={compareProviderIds.length} />
          {!collapsed && (
            <div className="mx-3 mb-4 rounded-xl border border-dashed border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Demonstration mode</p>
              <p className="mt-1">
                All data shown is synthetic and clearly labelled. No real provider or price data is
                used.
              </p>
            </div>
          )}
        </aside>

        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <BrandMark collapsed={false} />
            <SidebarNav
              collapsed={false}
              compareCount={compareProviderIds.length}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
            <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
              <span className="lg:hidden">
                <MobileTriggerSlot />
              </span>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto flex items-center gap-2">{actions}</div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
            HealthCompare — academic healthcare analytics prototype. Estimates and indicators are
            illustrative demonstration data, not guaranteed prices or medical advice.
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}

/** The sheet trigger lives inside the header; this wires it via the Sheet context. */
function MobileTriggerSlot() {
  // The SheetTrigger is rendered inside the Sheet above; to keep a single
  // source of truth we re-render a labelled trigger button that opens the
  // same sheet through a click proxy.
  return <MobileTriggerBridge />;
}

import { useSheetContextSafe } from "@/components/layout/mobile-nav-bridge";

function MobileTriggerBridge() {
  const open = useSheetContextSafe();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2"
      aria-label="Open navigation menu"
      onClick={() => open()}
    >
      <Menu className="h-5 w-5" aria-hidden />
    </Button>
  );
}
