"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/useSimulationStore";

export function useKeyboardShortcuts() {
  const { isActive, isPaused, pauseSimulation, resumeSimulation, resetSimulation } = useSimulationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space for play/pause simulation
      if (e.code === "Space") {
        e.preventDefault();
        if (isActive) {
          if (isPaused) resumeSimulation();
          else pauseSimulation();
        }
      }

      // R for replay/reset simulation
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetSimulation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isPaused, pauseSimulation, resumeSimulation, resetSimulation]);
}
