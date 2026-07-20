"use client";

import { useAIEngineStore } from "./useAIEngineStore";
import { motion } from "framer-motion";
import { Search, Brain, LineChart, PlaySquare, CheckCircle, Lightbulb, GraduationCap, Zap } from "lucide-react";

const STAGES = [
  { id: "Observe", icon: Search, label: "Observe" },
  { id: "Analyze", icon: Brain, label: "Analyze" },
  { id: "Predict", icon: LineChart, label: "Predict" },
  { id: "Recommend", icon: Lightbulb, label: "Recommend" },
  { id: "Simulate", icon: PlaySquare, label: "Simulate" },
  { id: "Approve", icon: CheckCircle, label: "Approve" },
  { id: "Execute", icon: Zap, label: "Execute" },
  { id: "Learn", icon: GraduationCap, label: "Learn" }
];

export function PipelineVisualizer() {
  const currentStage = useAIEngineStore((state) => state.currentStage);
  const isProcessing = useAIEngineStore((state) => state.isProcessing);

  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="glass-card p-6 w-full border border-border/50 rounded-xl">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-6">AI Decision Pipeline</h3>
      
      <div className="relative flex justify-between items-center w-full">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted/50 -translate-y-1/2 rounded-full overflow-hidden z-0">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Nodes */}
        {STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                  : isPast ? "bg-background border-primary text-primary" 
                  : "bg-background border-muted text-muted-foreground"
                }`}
                animate={isActive && isProcessing ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-xs font-medium transition-colors ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
