import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = config.app.logLevel as LogLevel;
    return levels[level] >= levels[configLevel];
  }

  private log(level: LogLevel, message: string, meta?: object) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: config.app.environment,
      ...meta
    };

    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, meta?: object) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: object) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: object) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: object) {
    this.log('error', message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  }
}

export const logger = new Logger();