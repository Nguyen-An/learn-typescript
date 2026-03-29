/**
 * utils.ts – Các tiện ích dùng chung
 * Demo: Default export, re-export, declaration merging
 */

// ── Validator ──
export interface Validator<T> {
  validate(value: T): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class StringValidator implements Validator<string> {
  private rules: Array<(v: string) => string | null> = [];

  minLength(min: number): this {
    this.rules.push(v => v.length < min ? `Tối thiểu ${min} ký tự` : null);
    return this;
  }

  maxLength(max: number): this {
    this.rules.push(v => v.length > max ? `Tối đa ${max} ký tự` : null);
    return this;
  }

  pattern(regex: RegExp, message: string): this {
    this.rules.push(v => !regex.test(v) ? message : null);
    return this;
  }

  email(): this {
    return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ");
  }

  validate(value: string): ValidationResult {
    const errors = this.rules
      .map(rule => rule(value))
      .filter((e): e is string => e !== null);
    return { isValid: errors.length === 0, errors };
  }
}

// ── Logger ──
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private entries: LogEntry[] = [];
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (level < this.minLevel) return;
    const entry: LogEntry = { timestamp: new Date(), level, message, context };
    this.entries.push(entry);
    const levelName = LogLevel[level];
    const ctx = context ? ` ${JSON.stringify(context)}` : "";
    console.log(`[${levelName}] ${message}${ctx}`);
  }

  debug(message: string, ctx?: Record<string, unknown>) { this.log(LogLevel.DEBUG, message, ctx); }
  info(message: string, ctx?: Record<string, unknown>)  { this.log(LogLevel.INFO,  message, ctx); }
  warn(message: string, ctx?: Record<string, unknown>)  { this.log(LogLevel.WARN,  message, ctx); }
  error(message: string, ctx?: Record<string, unknown>) { this.log(LogLevel.ERROR, message, ctx); }

  getEntries(level?: LogLevel): LogEntry[] {
    return level !== undefined
      ? this.entries.filter(e => e.level === level)
      : this.entries;
  }
}

// ── Default export ──
const defaultLogger = new Logger(LogLevel.INFO);
export default defaultLogger;
