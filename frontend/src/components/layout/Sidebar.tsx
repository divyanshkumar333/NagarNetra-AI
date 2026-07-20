import Link from "next/link";
import { LayoutDashboard, Globe, Activity, ShieldAlert, Cpu, Maximize, BarChart3, Settings } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Digital Twin", href: "/digital-twin", icon: Globe },
    { label: "Traffic", href: "/traffic", icon: Activity },
    { label: "Incidents", href: "/incidents", icon: ShieldAlert },
    { label: "AI Studio", href: "/ai-studio", icon: Cpu },
    { label: "Simulation", href: "/simulation", icon: Maximize },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground h-full flex flex-col glass-panel rounded-none border-t-0 border-b-0 border-l-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="font-bold text-lg tracking-wider text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/50">
            <span className="text-primary text-xs">NN</span>
          </div>
          NagarNetra AI
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">OP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Cmd Center 1</span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
