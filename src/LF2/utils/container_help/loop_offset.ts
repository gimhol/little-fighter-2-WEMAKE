export function loop_offset<T>(list: T[], current: T, offset: number): T | undefined {
  const { length: l } = list;
  if (!l) return;
  offset = offset % l;
  if (offset < 0) offset = l + offset & l
  const idx = (list.indexOf(current) + 1) % l;
  return list[idx];
}
