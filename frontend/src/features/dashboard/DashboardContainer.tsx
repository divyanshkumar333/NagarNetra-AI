"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "./useDashboardData";
import { DashboardHero } from "./DashboardHero";
import { KPIGrid } from "./KPIGrid";
import { TrafficOverview } from "./TrafficOverview";
import { AIRecommendations } from "./AIRecommendations";
import { IncidentTimeline } from "./IncidentTimeline";
import { AnalyticsCharts } from "./AnalyticsCharts";

export function DashboardContainer() {
  const { kpis, recommendations, incidents, chartData } = useDashboardData();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-[1800px] mx-auto"
    >
      <DashboardHero />
      <KPIGrid data={kpis} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <TrafficOverview />
          <AnalyticsCharts data={chartData} />
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AIRecommendations data={recommendations} />
          <IncidentTimeline data={incidents} />
        </div>
      </div>
    </motion.div>
  );
}
