"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "./useDashboardData";
import { DashboardHero } from "./DashboardHero";
import { KPIGrid } from "./KPIGrid";
import { AIRecommendations } from "./AIRecommendations";
import { IncidentTimeline } from "./IncidentTimeline";

export function DashboardMini() {
  const { kpis, incidents } = useDashboardData();

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
      className="flex flex-col gap-6"
    >
      <motion.div variants={item}><DashboardHero /></motion.div>
      
      {/* Force KPI Grid to be 1 column in the mini dashboard to avoid squishing */}
      <motion.div variants={item} className="[&>div]:!grid-cols-1 [&>div]:!gap-3">
        <KPIGrid data={kpis} />
      </motion.div>
      
      <motion.div variants={item}><AIRecommendations /></motion.div>
      <motion.div variants={item}><IncidentTimeline data={incidents} /></motion.div>
    </motion.div>
  );
}
