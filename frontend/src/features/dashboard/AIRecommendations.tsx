"use client";

import { motion } from "framer-motion";
import { Recommendation } from "./useDashboardData";
import { Brain, CheckCircle2, PlayCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIRecommendations({ data }: { data: Recommendation[] }) {
  return (
    <div className="glass-card rounded-lg flex flex-col h-[500px] border border-border/50">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold tracking-tight">AI Operations Desk</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
          Auto-pilot: OFF
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="p-4 rounded-md bg-background/40 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  rec.priority === 'high' ? 'bg-destructive/20 text-destructive border border-destructive/20' : 
                  rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 
                  'bg-primary/20 text-primary border border-primary/20'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                <span className="text-xs font-mono text-primary flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {rec.confidence}% Conf.
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">{rec.time}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
            
            <div className="bg-muted/30 p-2 rounded-sm border border-border/50 mb-4">
              <p className="text-sm font-medium text-foreground"><span className="text-primary mr-2">Action:</span>{rec.action}</p>
              <p className="text-xs text-green-500 mt-1">Expected Impact: {rec.impact}</p>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Execute
              </Button>
              <Button size="sm" variant="outline" className="w-full border-border/50 hover:bg-accent/50">
                <PlayCircle className="w-4 h-4 mr-1.5 text-muted-foreground" /> Simulate
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
