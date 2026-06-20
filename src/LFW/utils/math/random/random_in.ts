export function random_in(a: number, b: number): number {
  if (a > b) return random_in(b, a);
  return a + (b - a) * Math.random();
}
