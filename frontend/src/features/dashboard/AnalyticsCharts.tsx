"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartProps {
  data: { time: string; volume: number; density: number }[];
}

export function AnalyticsCharts({ data }: ChartProps) {
  // Memoize to prevent unnecessary re-renders of the chart
  const chartData = useMemo(() => data, [data]);

  return (
    <div className="glass-card rounded-lg flex flex-col h-[400px] border border-border/50">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold tracking-tight">Traffic Volume & Density Trends</h3>
      </div>
      
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.70 0.15 300)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="oklch(0.70 0.15 300)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 10%)" vertical={false} />
            <XAxis dataKey="time" stroke="oklch(0.65 0.01 250)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="oklch(0.65 0.01 250)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="oklch(0.65 0.01 250)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'oklch(0.16 0.01 250)', borderColor: 'oklch(0.25 0.02 250)', borderRadius: '8px' }}
              itemStyle={{ color: 'oklch(0.95 0 0)' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="volume" stroke="oklch(0.65 0.15 250)" fillOpacity={1} fill="url(#colorVolume)" />
            <Area yAxisId="right" type="monotone" dataKey="density" stroke="oklch(0.70 0.15 300)" fillOpacity={1} fill="url(#colorDensity)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
