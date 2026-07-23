const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const CURRENT_LEVEL: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatMessage(level: string, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  return `[SES:${level.toUpperCase()}] ${ts} ${message}`;
}

function toMessage(msg: unknown): string {
  if (typeof msg === 'string') return msg;
  if (msg instanceof Error) return msg.message;
  try { return JSON.stringify(msg); } catch { return String(msg); }
}

export const logger = {
  debug(message: unknown, data?: unknown) {
    if (shouldLog('debug')) console.debug(formatMessage('debug', toMessage(message), data), data ?? '');
  },
  info(message: unknown, data?: unknown) {
    if (shouldLog('info')) console.info(formatMessage('info', toMessage(message), data), data ?? '');
  },
  warn(message: unknown, data?: unknown) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', toMessage(message), data), data ?? '');
  },
  error(message: unknown, data?: unknown) {
    if (shouldLog('error')) console.error(formatMessage('error', toMessage(message), data), data ?? '');
  },
};
