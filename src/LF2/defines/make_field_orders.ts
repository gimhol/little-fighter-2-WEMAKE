export function make_field_orders<T>(input: Record<keyof T, number>): Record<keyof T, number> {
  let order = -1;
  for (const key in input) input[key as keyof T] = ++order;
  return input;
}
