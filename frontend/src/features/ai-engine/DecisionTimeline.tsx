"use client";

import { useAIEngineStore } from "./useAIEngineStore";
import { motion } from "framer-motion";
import { History, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";

export function DecisionTimeline() {
  const decisionLog = useAIEngineStore((state) => state.decisionLog);
  const learningStats = useAIEngineStore((state) => state.learningStats);

  return (
    <div className="glass-card p-6 border border-border/50 rounded-xl max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
          <History className="w-4 h-4" /> AI Decision Log
        </h3>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {decisionLog.length} Actions
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {decisionLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No decisions logged yet.</p>
          </div>
        ) : (
          decisionLog.map((log, i) => {
            const stats = log.recommendationId ? learningStats[log.recommendationId] : null;

            return (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-6 border-l border-border/50 pb-6 last:pb-0"
              >
                {/* Node */}
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatRelative(new Date(log.timestamp), new Date())}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary font-semibold">{log.confidence}% Conf</span>
                    {log.result === "Success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-sm mb-1 text-foreground">{log.action}</h4>
                <p className="text-xs text-muted-foreground mb-3">{log.reason}</p>

                {stats && (
                  <div className="bg-muted/10 border border-border/50 rounded-md p-3 grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Avg Improvement</div>
                      <div className="text-sm font-mono text-green-500">+{stats.averageImprovement}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Operator Acceptance</div>
                      <div className="text-sm font-mono text-primary">{stats.operatorAcceptanceRate}%</div>
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full text-xs">
                  <PlayCircle className="w-3 h-3 mr-2" /> Replay Simulation
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
