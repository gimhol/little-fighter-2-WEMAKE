import { match_all } from "./match_all";

export function match_block(
  text: string | null | undefined,
  start: string,
  end: string,
): string[];
export function match_block(
  text: string | null | undefined,
  start: string,
  end: string,
  func: (text?: string) => void,
): void;
export function match_block(
  text: string | null | undefined,
  start: string,
  end: string,
  func?: (text?: string) => void,
) {
  if (typeof text !== "string") return func ? void 0 : [];

  const regexp = new RegExp(`${start.trim()}((.|\\n)+?)${end.trim()}`, "g");
  if (func) return match_all(text, regexp, ([, c]) => func(c));
  return match_all(text, regexp).map((v) => v[1]);
}

export function match_block_once(
  text: string | null | undefined,
  start: string,
  end: string,
): string | null {
  if (typeof text !== "string") return null;
  return (
    new RegExp(`${start.trim()}((.|\\n)+?)${end.trim()}`, "g").exec(
      text,
    )?.[1] ?? null
  );
}
