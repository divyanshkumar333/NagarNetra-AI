"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Digital Twin",
  "/dashboard": "Dashboard",
  "/traffic": "Traffic Control",
  "/incidents": "Incidents & Dispatch",
  "/ai-studio": "AI Neural Studio",
  "/simulation": "Simulation Rig",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function TopNav() {
  const pathname = usePathname();
  const pageName = ROUTE_NAMES[pathname] || "Dashboard";

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
          <span>Command Center</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">{pageName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search commands, entities..." 
            className="h-9 w-64 bg-input/50 border border-border rounded-md pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background"></span>
        </Button>
      </div>
    </header>
  );
}
