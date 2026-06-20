export function match_hash_end(
  text: string | null | undefined,
): string | undefined {
  if (typeof text !== "string") return void 0;
  return text.match(/#(.*)[\n|\r|\0]*/)?.[1];
}
