export class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(prefix, msg, colorCode = "0") {
    const lines = msg.toString().split('\n');
    lines.forEach(line => {
      const cleanLine = line.replace(/\r/g, '').trimEnd();
      if (cleanLine) {
        this.logs.push(`\x1b[90m[\x1b[0m\x1b[${colorCode}m${prefix}\x1b[0m\x1b[90m]\x1b[0m ${cleanLine}`);
      }
    });

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(this.logs.length - this.maxLogs);
    }
  }

  getLogs(count = 15) {
    return this.logs.slice(-count);
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
