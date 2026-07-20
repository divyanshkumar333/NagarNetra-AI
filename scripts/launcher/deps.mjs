import fs from "fs";
import crypto from "crypto";
import { exec } from "child_process";
import { ui } from "./ui.mjs";
import { logger } from "./logger.mjs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".launcher-cache.json");

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch(e) {}
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function runCommand(command, cwd, name, progressIdx, onProgress) {
  return new Promise((resolve, reject) => {
    logger.log(name, `Running: ${command}`);
    const proc = exec(command, { cwd });
    
    proc.stdout.on("data", data => {
      logger.log(name, data);
      if (onProgress) onProgress();
    });
    
    proc.stderr.on("data", data => {
      logger.log(name, data, "31"); // red
      if (onProgress) onProgress();
    });
    
    proc.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} failed with exit code ${code}`));
      }
    });
  });
}

export async function checkDependencies() {
  ui.startupProgress[1].progress = 10;
  const cache = getCache();
  
  const frontendLock = path.join(process.cwd(), "frontend", "package-lock.json");
  const backendReqs = path.join(process.cwd(), "backend", "requirements.txt");
  
  const frontHash = getFileHash(frontendLock);
  const backHash = getFileHash(backendReqs);
  
  const hasNodeModules = fs.existsSync(path.join(process.cwd(), "frontend", "node_modules"));
  const hasVenv = fs.existsSync(path.join(process.cwd(), "backend", "venv"));

  let needsFrontend = false;
  let needsBackend = false;

  if (!hasNodeModules || cache.frontend !== frontHash) needsFrontend = true;
  if (!hasVenv || cache.backend !== backHash) needsBackend = true;

  if (!needsFrontend && !needsBackend) {
    ui.startupProgress[1].progress = 100;
    return;
  }

  // Frontend
  if (needsFrontend) {
    ui.startupProgress[1].progress = 30;
    let ticks = 0;
    await runCommand("npm install", path.join(process.cwd(), "frontend"), "NPM", 1, () => {
       ticks++;
       ui.startupProgress[1].progress = Math.min(60, 30 + Math.floor(ticks / 10));
    });
    cache.frontend = frontHash;
  } else {
    ui.startupProgress[1].progress = 60;
  }

  // Backend
  if (needsBackend) {
    const cwd = path.join(process.cwd(), "backend");
    if (!hasVenv) {
      // Use python or py depending on OS
      try {
        await runCommand("python -m venv venv", cwd, "VENV", 1);
      } catch (e) {
        await runCommand("py -m venv venv", cwd, "VENV", 1);
      }
    }
    
    let ticks = 0;
    const activateAndInstall = `venv\\Scripts\\activate.bat && pip install -r requirements.txt`;
    await runCommand(activateAndInstall, cwd, "PIP", 1, () => {
       ticks++;
       ui.startupProgress[1].progress = Math.min(99, 60 + Math.floor(ticks / 5));
    });
    cache.backend = backHash;
  }

  saveCache(cache);
  ui.startupProgress[1].progress = 100;
}
