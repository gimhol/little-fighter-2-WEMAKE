import { match_all } from "./match_all";
export const val_colon_exp = /\s*(\S*)\s*:\s*(\S*)/g;
export function match_colon_value(
  text: string | null | undefined,
): [string, string][];
export function match_colon_value(
  text: string | null | undefined,
  func: (key: string, value: string) => void,
): void;
export function match_colon_value(
  text: string | null | undefined,
  func?: (key: string, value: string) => void,
) {
  if (typeof text !== "string") return func ? void 0 : [];
  if (func)
    return match_all(text.trim(), val_colon_exp, ([, k, v]) => func(k, v));
  return match_all(text.trim(), val_colon_exp).map(([, k, v]) => [k, v]);
}
