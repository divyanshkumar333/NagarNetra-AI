import { exec } from "child_process";
import { ui } from "./ui.mjs";
import { logger } from "./logger.mjs";
import http from "http";

let browserOpened = false;

export function openBrowser(force = false) {
  if (browserOpened && !force) return;
  
  ui.startupProgress[4].progress = 50;
  logger.log("SYSTEM", "Launching browser...", "36");
  
  const url = "http://localhost:3000";
  
  // Windows start command
  exec(`start ${url}`, (err) => {
    if (err) {
      logger.log("SYSTEM", "Failed to open browser", "31");
    } else {
      ui.startupProgress[4].progress = 100;
      ui.status.browser = "Connected";
      browserOpened = true;
    }
  });
}

// Simple health check to see if frontend is responding before opening browser
export function waitForFrontend(callback) {
  const check = () => {
    http.get("http://localhost:3000", (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        callback();
      } else {
        setTimeout(check, 1000);
      }
    }).on('error', () => {
      setTimeout(check, 1000);
    });
  };
  check();
}
