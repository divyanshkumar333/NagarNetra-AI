"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, Server, Cpu, Key } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Settings className="h-6 w-6" /> System Configuration
        </h2>
        <p className="text-muted-foreground">Manage NagarNetra AI preferences and integration settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Cpu className="h-4 w-4 text-blue-500" /> AI Engine</CardTitle>
            <CardDescription>Adjust the autonomous routing model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Aggressiveness</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Conservative (Safety First)</option>
                <option>Balanced (Default)</option>
                <option>Aggressive (Speed Optimized)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Simulation Tick Rate</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>10 ticks/sec</option>
                <option>30 ticks/sec</option>
                <option>60 ticks/sec</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Server className="h-4 w-4 text-green-500" /> API Connections</CardTitle>
            <CardDescription>External telemetry and city services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City Grid Endpoint</label>
              <input type="text" defaultValue="https://api.nagarnetra.gov/v1/grid" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Key className="h-3 w-3" /> API Key</label>
              <input type="password" defaultValue="************************" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Protocols</CardTitle>
            <CardDescription>Global overrides for city-wide incidents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-black/20">
              <div>
                <p className="font-medium">Auto-dispatch Emergency Services</p>
                <p className="text-xs text-muted-foreground">Automatically route ambulances and fire trucks when severity is HIGH.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            </div>
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-black/20">
              <div>
                <p className="font-medium">Grid Load Shedding</p>
                <p className="text-xs text-muted-foreground">Allow AI to autonomously shut down non-critical grid sectors during power spikes.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline">Reset Defaults</Button>
        <Button onClick={handleSave} disabled={loading} className="w-24">
          {loading ? (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save</>
          )}
        </Button>
      </div>
    </div>
  );
}
