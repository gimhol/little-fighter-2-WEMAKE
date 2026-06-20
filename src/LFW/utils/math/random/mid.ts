export function mid(a: number, b: number): number {
  if (a > b) return mid(b, a);
  return a + (b - a) * 0.5;
}
