import readline from "readline";
import { ui } from "./ui.mjs";
import { logger } from "./logger.mjs";
import { checkEnvironment } from "./env.mjs";
import { checkDependencies } from "./deps.mjs";
import { startBackend, startFrontend, killProcesses, killBackend, killFrontend } from "./process.mjs";
import { openBrowser, waitForFrontend } from "./browser.mjs";

let renderInterval;

async function bootstrap() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === 'c' || key.name === 'q') {
      shutdown();
    }
    else if (key.name === 'd') {
      ui.showLogs = !ui.showLogs;
    }
    else if (key.name === 'c') {
      logger.clear();
    }
    else if (key.name === 'b') {
      openBrowser(true);
    }
    else if (key.name === 'r') {
      if (key.shift) {
        killBackend();
        logger.log("SYSTEM", "Backend restart triggered", "33");
        setTimeout(startBackend, 1000);
      } else {
        killFrontend();
        logger.log("SYSTEM", "Frontend restart triggered", "33");
        setTimeout(startFrontend, 1000);
      }
    }
  });

  // Start render loop
  renderInterval = setInterval(() => {
    ui.render(logger);
  }, 200);

  try {
    checkEnvironment();
    await checkDependencies();
    
    startBackend();
    startFrontend();

    // The other systems (AI, Digital Twin, etc.) become Active when frontend/backend are up
    waitForFrontend(() => {
      ui.status.ai = "Active";
      ui.status.digitalTwin = "Active";
      ui.status.telemetry = "Connected";
      ui.status.simulation = "Ready";
      
      openBrowser();
      ui.stats.startupTime = Date.now() - ui.startTime;
      ui.isReady = true;
    });

  } catch(e) {
    logger.log("FATAL", e.message, "31");
    ui.showLogs = true; // force logs open on crash
  }
}

function shutdown() {
  clearInterval(renderInterval);
  process.stdout.write('\x1B[2J\x1B[0f');
  console.log("Shutting down NagarNetra AI...");
  killProcesses();
  setTimeout(() => process.exit(0), 500);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap();
