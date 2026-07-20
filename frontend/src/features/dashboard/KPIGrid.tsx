"use client";

import { motion, useSpring, useTransform, Variants } from "framer-motion";
import { useEffect } from "react";
import { KPIData } from "./useDashboardData";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

function AnimatedNumber({ value, isFloat = false }: { value: number, isFloat?: boolean }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => isFloat ? current.toFixed(1) : Math.round(current).toString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

function MiniSparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (((val - min) / range) * 100);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="w-16 h-8 overflow-visible" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function KPIGrid({ data }: { data: KPIData[] }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
    >
      {data.map((kpi) => {
        const isOptimal = kpi.status === "optimal";
        const isWarning = kpi.status === "warning";
        const isInfo = kpi.status === "info";
        
        const statusColor = isOptimal ? "text-primary" : isWarning ? "text-amber-500" : isInfo ? "text-blue-400" : "text-destructive";
        const StatusIcon = isOptimal ? Activity : isWarning ? AlertCircle : Activity;
        
        return (
          <motion.div 
            key={kpi.label} 
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-card p-4 rounded-lg relative overflow-hidden group border border-border/50 hover:border-primary/50 transition-colors cursor-default"
          >
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
            </div>
            
            <div className="flex items-end justify-between relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-foreground">
                  <AnimatedNumber value={kpi.value} isFloat={kpi.label === "Average Signal Eff." || kpi.label === "Congestion Index"} />
                </span>
                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
              </div>
              
              <MiniSparkline data={kpi.sparkline} color={isOptimal ? "oklch(0.65 0.15 250)" : "oklch(0.75 0.15 50)"} />
            </div>
            
            <div className="mt-3 flex items-center gap-2 relative z-10">
              <div className={`flex items-center text-xs font-medium ${kpi.trend >= 0 ? (isOptimal ? 'text-primary' : 'text-destructive') : (isWarning ? 'text-green-500' : 'text-primary')}`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(kpi.trend)}%
              </div>
              <span className="text-xs text-muted-foreground">vs last hour</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
