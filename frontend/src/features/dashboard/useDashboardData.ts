import { useState, useEffect } from "react";

export interface KPIData {
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: "optimal" | "warning" | "critical" | "info";
  sparkline: number[];
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  impact: string;
  reasoning: string;
  action: string;
  time: string;
}

export interface Incident {
  id: string;
  type: "accident" | "congestion" | "weather" | "emergency" | "maintenance";
  severity: "critical" | "warning" | "info";
  description: string;
  location: string;
  time: string;
}

export function useDashboardData() {
  const [kpis, setKpis] = useState<KPIData[]>([
    { label: "Live Traffic Flow", value: 84, unit: "k/hr", trend: 2.4, status: "optimal", sparkline: [70, 75, 72, 80, 84, 82, 84] },
    { label: "Active Incidents", value: 12, unit: "", trend: -5.0, status: "warning", sparkline: [15, 14, 16, 13, 14, 12, 12] },
    { label: "Congestion Index", value: 42, unit: "%", trend: 1.2, status: "optimal", sparkline: [40, 41, 39, 45, 43, 41, 42] },
    { label: "Emergency Vehicles", value: 8, unit: " active", trend: 0, status: "info" as "info" | "optimal" | "warning" | "critical", sparkline: [6, 7, 8, 8, 9, 8, 8] },
    { label: "Average Signal Eff.", value: 94, unit: "%", trend: 0.5, status: "optimal", sparkline: [91, 92, 93, 93, 94, 94, 94] },
    { label: "Avg Travel Time", value: 28, unit: " min", trend: -1.2, status: "optimal", sparkline: [32, 31, 30, 29, 28, 29, 28] },
  ]);

  const recommendations: Recommendation[] = [
    {
      id: "REC-001",
      priority: "high",
      confidence: 94,
      impact: "-14% Congestion",
      reasoning: "Heavy load detected on Northern Artery. Diverting traffic via Eastern Bypass will distribute volume.",
      action: "Increase signal timing at Junction A by 12s",
      time: "Just now",
    },
    {
      id: "REC-002",
      priority: "high",
      confidence: 98,
      impact: "-5m Response Time",
      reasoning: "Ambulance approaching gridlock at Sector 4. Green wave protocol recommended.",
      action: "Prioritize ambulance route via Sector 4",
      time: "2m ago",
    },
    {
      id: "REC-003",
      priority: "medium",
      confidence: 88,
      impact: "Improve Flow",
      reasoning: "Minor accident at Downtown crossing causing bottleneck.",
      action: "Dispatch traffic officer to Downtown crossing",
      time: "15m ago",
    },
  ];

  const incidents: Incident[] = [
    { id: "INC-1", type: "accident", severity: "critical", description: "Multi-vehicle collision blocking 2 lanes", location: "I-95 North, Mile 42", time: "10:42 AM" },
    { id: "INC-2", type: "emergency", severity: "warning", description: "Fire apparatus en route to structure fire", location: "Downtown Sector 4", time: "10:38 AM" },
    { id: "INC-3", type: "congestion", severity: "warning", description: "Unusual volume causing gridlock", location: "Stadium District", time: "10:15 AM" },
    { id: "INC-4", type: "maintenance", severity: "info", description: "Scheduled pothole repair", location: "Avenue of the Americas", time: "09:00 AM" },
  ];

  const chartData = [
    { time: "06:00", volume: 2400, density: 30 },
    { time: "07:00", volume: 5600, density: 65 },
    { time: "08:00", volume: 8900, density: 92 },
    { time: "09:00", volume: 7200, density: 78 },
    { time: "10:00", volume: 6800, density: 72 },
    { time: "11:00", volume: 6400, density: 68 },
    { time: "12:00", volume: 7100, density: 75 },
  ];

  // Simulate live updates for KPIs
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.label === "Active Incidents" || kpi.label === "Emergency Vehicles") return kpi;
          const variance = (Math.random() - 0.5) * 2; // -1 to +1
          const newValue = Math.max(0, kpi.value + (kpi.value * variance * 0.01)); // max 1% change
          const newSparkline = [...kpi.sparkline.slice(1), newValue];
          return { ...kpi, value: newValue, sparkline: newSparkline };
        })
      );
    }, 5000); // Update every 5 seconds to reduce thrashing
    return () => clearInterval(interval);
  }, []);

  return { kpis, recommendations, incidents, chartData };
}
