import { spawn } from "child_process";
import { ui } from "./ui.mjs";
import { logger } from "./logger.mjs";
import path from "path";

export const processes = {
  backend: null,
  frontend: null
};

export function startBackend() {
  ui.status.backend = "Starting";
  ui.startupProgress[2].progress = 10;
  
  const cwd = path.join(process.cwd(), "backend");
  // using shell: true to support venv activation
  const cmd = `venv\\Scripts\\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000`;
  
  processes.backend = spawn(cmd, { cwd, shell: true });
  
  let started = false;

  processes.backend.stdout.on("data", data => {
    const str = data.toString();
    logger.log("API", str, "34"); // Blue
    if (str.includes("Uvicorn running on") || str.includes("Application startup complete")) {
      ui.status.backend = "Running";
      ui.startupProgress[2].progress = 100;
      started = true;
    }
  });

  processes.backend.stderr.on("data", data => {
    logger.log("API", data.toString(), "31");
  });

  processes.backend.on("close", code => {
    logger.log("API", `Process exited with code ${code}`, "31");
    ui.status.backend = "Stopped";
    processes.backend = null;
    // Auto restart if it was running and died unexpectedly
    if (started && ui.isReady) {
      ui.status.backend = "Restarting";
      setTimeout(startBackend, 2000);
    }
  });
}

export function startFrontend() {
  ui.status.frontend = "Starting";
  ui.startupProgress[3].progress = 10;

  const cwd = path.join(process.cwd(), "frontend");
  // Next.js dev server
  processes.frontend = spawn("npm", ["run", "dev"], { cwd, shell: true });
  
  let started = false;

  processes.frontend.stdout.on("data", data => {
    const str = data.toString();
    logger.log("UI", str, "35"); // Magenta
    if (str.includes("Ready in") || str.includes("compiled client and server successfully")) {
      ui.status.frontend = "Running";
      ui.startupProgress[3].progress = 100;
      started = true;
    }
  });

  processes.frontend.stderr.on("data", data => {
    logger.log("UI", data.toString(), "33"); // Yellow warning
  });

  processes.frontend.on("close", code => {
    logger.log("UI", `Process exited with code ${code}`, "31");
    ui.status.frontend = "Stopped";
    processes.frontend = null;
    if (started && ui.isReady) {
      ui.status.frontend = "Restarting";
      setTimeout(startFrontend, 2000);
    }
  });
}

export function killBackend() {
  if (processes.backend) {
    try { process.kill(processes.backend.pid, 'SIGKILL'); } catch(e){}
    processes.backend = null;
  }
}

export function killFrontend() {
  if (processes.frontend) {
    try { process.kill(processes.frontend.pid, 'SIGKILL'); } catch(e){}
    processes.frontend = null;
  }
}

export function killProcesses() {
  killBackend();
  killFrontend();
}
