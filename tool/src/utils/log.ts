let __verbose = true;
export function debug(...any: any[]) {
  if (__verbose) return console.debug(`\x1b[90m[D]`, ...any, '\x1b[0m');
}
export function log(...any: any[]) {
  return console.log(`[I]`, ...any);
}
export function info(...any: any[]) {
  return console.log(`[I]`, ...any);
}
export function error(...any: any[]) {
  return console.error(`\x1b[31m[E]`, ...any, '\x1b[0m');
}
export function warn(...any: any[]) {
  return console.warn(`\x1b[33m[W]`, ...any, '\x1b[0m');
}
export class Logger {
  static readonly log = log
  static readonly debug = debug
  static readonly warn = warn;
  static readonly error = error;
  static get verbose(): boolean { return __verbose }
  static set verbose(v: boolean) { __verbose = v }
}