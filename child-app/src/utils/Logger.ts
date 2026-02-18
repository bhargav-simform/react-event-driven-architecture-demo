/**
 * Logger utility with different log levels
 * Can be extended to send logs to external services
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  constructor(private context: string) {}

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}]`;

    switch (level) {
      case 'info':
        console.log(`${prefix} ℹ️ ${message}`, data ?? '');
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`, data ?? '');
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data ?? '');
        break;
      case 'debug':
        console.debug(`${prefix} 🔍 ${message}`, data ?? '');
        break;
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown): void {
    this.log('error', message, error);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }
}
