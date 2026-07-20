"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Activity, Car, FileText, Monitor, Settings, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden"
          >
            <Command
              className="flex flex-col h-full w-full bg-transparent text-foreground"
              loop
            >
              <div className="flex items-center px-4 border-b border-border/50">
                <Command.Input 
                  placeholder="Search pages, scenarios, or settings..." 
                  className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  autoFocus
                />
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
                
                <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <Item onSelect={() => runCommand(() => router.push("/"))} icon={<Monitor />}>Dashboard</Item>
                  <Item onSelect={() => runCommand(() => router.push("/digital-twin"))} icon={<Activity />}>Digital Twin</Item>
                  <Item onSelect={() => runCommand(() => router.push("/traffic"))} icon={<Car />}>Traffic Control</Item>
                  <Item onSelect={() => runCommand(() => router.push("/simulation"))} icon={<Radio />}>Simulation Engine</Item>
                  <Item onSelect={() => runCommand(() => router.push("/telemetry"))} icon={<Radio />}>IoT Telemetry</Item>
                  <Item onSelect={() => runCommand(() => router.push("/ai-studio"))} icon={<FileText />}>AI Studio</Item>
                  <Item onSelect={() => runCommand(() => router.push("/settings"))} icon={<Settings />}>Settings</Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({ children, icon, onSelect }: { children: React.ReactNode, icon: React.ReactNode, onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 mt-1"
    >
      <div className="w-4 h-4 text-muted-foreground flex items-center justify-center">
        {icon}
      </div>
      {children}
    </Command.Item>
  );
}
