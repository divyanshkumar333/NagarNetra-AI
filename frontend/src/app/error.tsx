"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Command Center Exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] w-full text-center px-4">
      <div className="p-4 bg-red-500/10 rounded-full mb-6 border border-red-500/20">
        <AlertOctagon className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">Critical System Failure</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected exception occurred within the NagarNetra AI runtime. 
        Diagnostics have been logged. Please reboot the module.
      </p>
      
      <Button variant="outline" className="gap-2" onClick={() => reset()}>
        <RotateCcw className="w-4 h-4" /> Reboot Module
      </Button>
    </div>
  );
}
