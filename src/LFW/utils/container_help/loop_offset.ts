export function loop_offset<T>(list: T[], current: T, offset: number): T | undefined {
  const { length: len } = list;
  if (!len) return;
  offset = offset % len;
  let idx = list.indexOf(current)
  if (offset > 0) idx = (idx + offset) % len
  else idx = (len + idx + offset) % len
  return list[idx];
}
