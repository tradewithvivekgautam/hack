export type LogLevel = "debug" | "info" | "warn" | "error";

const priorities: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(minimum: LogLevel) {
  function write(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (priorities[level] < priorities[minimum]) return;
    const entry = { timestamp: new Date().toISOString(), level, message, ...data };
    const serialized = JSON.stringify(entry);
    if (level === "error") console.error(serialized);
    else if (level === "warn") console.warn(serialized);
    else console.log(serialized);
  }
  return {
    debug: (message: string, data?: Record<string, unknown>) => write("debug", message, data),
    info: (message: string, data?: Record<string, unknown>) => write("info", message, data),
    warn: (message: string, data?: Record<string, unknown>) => write("warn", message, data),
    error: (message: string, data?: Record<string, unknown>) => write("error", message, data),
  };
}
export type Logger = ReturnType<typeof createLogger>;
