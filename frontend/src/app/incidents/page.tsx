"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

const incidents = [
  { id: "INC-2931", type: "Traffic Collision", location: "Sector 4 Intersection", severity: "high", status: "active", time: "10 mins ago" },
  { id: "INC-2930", type: "Power Fluctuation", location: "Downtown Grid A", severity: "medium", status: "investigating", time: "45 mins ago" },
  { id: "INC-2929", type: "Water Pipe Burst", location: "Residential Sector 7", severity: "high", status: "resolved", time: "3 hours ago" },
  { id: "INC-2928", type: "AI Routing Anomaly", location: "Highway 12", severity: "low", status: "resolved", time: "5 hours ago" },
  { id: "INC-2927", type: "Unauthorized Drone", location: "Airspace B", severity: "medium", status: "active", time: "1 min ago" },
];

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
          <AlertCircle className="h-6 w-6" /> Incident Command Center
        </h2>
        <p className="text-muted-foreground">Monitor and resolve city-wide anomalies detected by NagarNetra AI.</p>
      </div>
      <div className="glass-card p-6 border-destructive/20 min-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[100px]">Incident ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id} className="border-border/10 hover:bg-white/5 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">{incident.id}</TableCell>
                <TableCell className="font-medium">{incident.type}</TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    incident.severity === 'high' ? 'border-destructive text-destructive' :
                    incident.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                    'border-blue-500 text-blue-500'
                  }>
                    {incident.severity.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs">
                    {incident.status === 'active' && <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />}
                    {incident.status === 'investigating' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {incident.status === 'resolved' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    <span className="capitalize">{incident.status}</span>
                    <span className="text-muted-foreground/50 ml-2">({incident.time})</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {incident.status !== 'resolved' ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs border-primary/50 text-primary hover:bg-primary/20">
                      Deploy AI Protocol
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" disabled>
                      Resolved
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
