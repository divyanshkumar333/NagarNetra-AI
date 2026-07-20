import readline from "readline";
import os from "os";

export class UI {
  constructor() {
    this.showLogs = false;
    this.status = {
      backend: "Pending",
      frontend: "Pending",
      ai: "Pending",
      digitalTwin: "Pending",
      telemetry: "Pending",
      simulation: "Pending",
      browser: "Pending"
    };
    
    this.stats = {
      startupTime: 0,
      memory: "0 MB",
      cpu: "0%",
      uptime: 0,
      connectedSensors: 0,
      activeVehicles: 0,
      emergencyEvents: 0
    };

    this.startupProgress = [
      { step: "Checking Environment...", progress: 0 },
      { step: "Checking Dependencies...", progress: 0 },
      { step: "Starting Backend...", progress: 0 },
      { step: "Starting Frontend...", progress: 0 },
      { step: "Launching Browser...", progress: 0 }
    ];
    
    this.isReady = false;
    this.startTime = Date.now();
  }

  getProgressBar(progress) {
    const totalBlocks = 18;
    const filled = Math.round((progress / 100) * totalBlocks);
    const empty = totalBlocks - filled;
    return `\x1b[36m${'█'.repeat(filled)}\x1b[90m${'░'.repeat(empty)}\x1b[0m ${progress}%`;
  }

  getColor(status) {
    switch (status) {
      case "Running":
      case "Active":
      case "Connected":
      case "Ready": return "\x1b[32m"; // Green
      case "Pending": return "\x1b[90m"; // Gray
      case "Failed":
      case "Stopped": return "\x1b[31m"; // Red
      case "Restarting": return "\x1b[33m"; // Yellow
      default: return "\x1b[37m"; // White
    }
  }

  updateStats() {
    // Basic fake or real stats
    this.stats.uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memUsage = process.memoryUsage();
    this.stats.memory = Math.round(memUsage.rss / 1024 / 1024) + " MB";
    // Mock CPU based on load
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    for(let cpu in cpus){
      user += cpus[cpu].times.user;
      nice += cpus[cpu].times.nice;
      sys += cpus[cpu].times.sys;
      irq += cpus[cpu].times.irq;
      idle += cpus[cpu].times.idle;
    }
    const total = user + nice + sys + idle + irq;
    const active = total - idle;
    if (this.lastCpu) {
      const diffTotal = total - this.lastCpu.total;
      const diffActive = active - this.lastCpu.active;
      this.stats.cpu = Math.round((diffActive / diffTotal) * 100) + "%";
    }
    this.lastCpu = { total, active };

    if (this.isReady) {
       this.stats.activeVehicles = 600 + Math.floor(Math.sin(this.stats.uptime / 5) * 50);
       this.stats.connectedSensors = 100;
       this.stats.emergencyEvents = Math.random() > 0.95 ? this.stats.emergencyEvents + 1 : this.stats.emergencyEvents;
    }
  }

  render(logger) {
    this.updateStats();
    
    // Clear screen
    process.stdout.write('\x1B[2J\x1B[0f');
    process.stdout.write('\x1B[0;0H');

    // Header
    console.log(`\x1b[36m╔══════════════════════════════════════════════════════════════╗\x1b[0m`);
    console.log(`\x1b[36m║\x1b[0m\x1b[1m                    NagarNetra AI v1.0                        \x1b[0m\x1b[36m║\x1b[0m`);
    console.log(`\x1b[36m║\x1b[0m             Smart City Command Center Launcher               \x1b[36m║\x1b[0m`);
    console.log(`\x1b[36m╚══════════════════════════════════════════════════════════════╝\x1b[0m`);
    console.log("");
    
    // Top Row: Overview + Stats
    console.log("\x1b[1mSystem Overview\x1b[0m");
    console.log("");
    
    const overviewLines = [
      `Backend              ${this.getColor(this.status.backend)}● ${this.status.backend}\x1b[0m`,
      `Frontend             ${this.getColor(this.status.frontend)}● ${this.status.frontend}\x1b[0m`,
      `AI Engine            ${this.getColor(this.status.ai)}● ${this.status.ai}\x1b[0m`,
      `Digital Twin         ${this.getColor(this.status.digitalTwin)}● ${this.status.digitalTwin}\x1b[0m`,
      `Telemetry            ${this.getColor(this.status.telemetry)}● ${this.status.telemetry}\x1b[0m`,
      `Simulation           ${this.getColor(this.status.simulation)}● ${this.status.simulation}\x1b[0m`,
      `Browser              ${this.getColor(this.status.browser)}● ${this.status.browser}\x1b[0m`
    ];

    const statsLines = [
      `Startup Time         \x1b[33m${this.stats.startupTime > 0 ? (this.stats.startupTime / 1000).toFixed(1) + 's' : '...'}\x1b[0m`,
      `Memory Usage         \x1b[33m${this.stats.memory}\x1b[0m`,
      `CPU Usage            \x1b[33m${this.stats.cpu}\x1b[0m`,
      `Uptime               \x1b[33m${this.stats.uptime}s\x1b[0m`,
      `Connected Sensors    \x1b[33m${this.stats.connectedSensors}\x1b[0m`,
      `Active Vehicles      \x1b[33m${this.stats.activeVehicles}\x1b[0m`,
      `Emergency Events     \x1b[33m${this.stats.emergencyEvents}\x1b[0m`
    ];

    for (let i = 0; i < overviewLines.length; i++) {
       console.log(`${overviewLines[i].padEnd(45)}  |  ${statsLines[i] || ""}`);
    }

    console.log("\n\x1b[90m------------------------------------------------------------------\x1b[0m\n");

    if (!this.isReady) {
      console.log("\x1b[1mStartup Experience\x1b[0m\n");
      this.startupProgress.forEach(p => {
        console.log(`${p.step}`);
        console.log(`${this.getProgressBar(p.progress)}\n`);
      });
    } else {
      console.log("\x1b[32m✓ NagarNetra AI is Ready\x1b[0m\n");
    }

    if (this.showLogs) {
      console.log("\x1b[90m------------------------------------------------------------------\x1b[0m");
      console.log("\x1b[1mDeveloper Console (Logs)\x1b[0m");
      const logs = logger.getLogs(12);
      logs.forEach(l => console.log(l));
      if (logs.length === 0) console.log("\x1b[90mNo logs yet...\x1b[0m");
    }

    console.log("\n\x1b[90m------------------------------------------------------------------\x1b[0m");
    console.log("\x1b[37m[D] Toggle Logs   [C] Clear Logs   [B] Browser   [R] Restart UI   [Shift+R] Restart API   [Q] Quit\x1b[0m");
  }
}

export const ui = new UI();
