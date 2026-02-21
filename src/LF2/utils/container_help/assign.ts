import { Unsafe } from "../type_check";


export function assign<T extends {}>(output: Unsafe<T>, item: Partial<T>, ...items: T[]): T {
  return Object.assign(output || {}, item, ...items);
}
