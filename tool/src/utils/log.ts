import { conf } from "../conf";
export function debug(...any: any[]) {
  if (conf.DEBUG) return log(`[DEBUG]`, ...any);
}
export function log(...any: any[]) {
  return console.log(`[INFO]`, ...any);
}
export function info(...any: any[]) {
  return console.log(`[INFO]`, ...any);
}
export class Logger {
  static readonly log = log
  static readonly debug = debug
}