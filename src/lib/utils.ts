import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple logger that is silent in production builds and redacts sensitive values
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = ['authorization', 'token', 'password', 'secret', 'api_key', 'apikey', 'access_token', 'refresh_token', 'email'];

function redact(value: any): any {
  try {
    if (value == null) return value;
    if (typeof value === 'string') {
      // redact emails and long tokens
      const redactedEmail = value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '***@***');
      if (redactedEmail !== value) return redactedEmail;
      if (value.length > 24) return value.slice(0, 6) + '***' + value.slice(-4);
      return value;
    }
    if (Array.isArray(value)) return value.map(redact);
    if (typeof value === 'object') {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
          out[k] = '***';
        } else {
          out[k] = redact(v);
        }
      }
      return out;
    }
    return value;
  } catch {
    return '***';
  }
}

function baseLog(level: LogLevel, message?: any, ...optionalParams: any[]) {
  if (!import.meta.env.DEV) return; // no-op in production
  const safeParams = optionalParams.map(redact);
  // eslint-disable-next-line no-console
  console[level](message, ...safeParams);
}

export const logger = {
  debug: (msg?: any, ...args: any[]) => baseLog('debug', msg, ...args),
  info: (msg?: any, ...args: any[]) => baseLog('info', msg, ...args),
  warn: (msg?: any, ...args: any[]) => baseLog('warn', msg, ...args),
  error: (msg?: any, ...args: any[]) => baseLog('error', msg, ...args),
  redact,
};