"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "./useDashboardData";
import { DashboardHero } from "./DashboardHero";
import { KPIGrid } from "./KPIGrid";
import { TrafficOverview } from "./TrafficOverview";
import { AIRecommendations } from "./AIRecommendations";
import { IncidentTimeline } from "./IncidentTimeline";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { SimulationModal } from "../ai-engine/SimulationModal";

export function DashboardContainer() {
  const { kpis, incidents, chartData } = useDashboardData();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1800px] mx-auto pb-10"
    >
      <motion.div variants={item}><DashboardHero /></motion.div>
      <motion.div variants={item}><KPIGrid data={kpis} /></motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div variants={item} className="h-full"><TrafficOverview /></motion.div>
          <motion.div variants={item}><AnalyticsCharts data={chartData} /></motion.div>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div variants={item}><AIRecommendations /></motion.div>
          <motion.div variants={item}><IncidentTimeline data={incidents} /></motion.div>
        </div>
      </div>
      <SimulationModal />
    </motion.div>
  );
}
