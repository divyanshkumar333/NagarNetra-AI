import { execSync } from "child_process";
import { ui } from "./ui.mjs";

export function checkEnvironment() {
  ui.startupProgress[0].progress = 10;
  
  try {
    const nodeVer = execSync("node -v").toString().trim();
    ui.startupProgress[0].progress += 40;
    ui.stats.nodeVersion = nodeVer;
  } catch (e) {
    throw new Error("Node.js is not installed or not in PATH");
  }

  try {
    // Try python or py
    let pyVer;
    try {
      pyVer = execSync("python --version").toString().trim();
    } catch (e) {
      pyVer = execSync("py --version").toString().trim();
    }
    ui.startupProgress[0].progress = 100;
    ui.stats.pythonVersion = pyVer;
  } catch (e) {
    throw new Error("Python is not installed or not in PATH");
  }
}
