export function find_float(v: any, path: string = ''): [boolean, string] {
  if (v == null) return [false, path];
  if (v == void 0) return [false, path];
  if (typeof v === 'number')
    return [!Number.isInteger(v), path];
  if (Array.isArray(v)) {
    for (let k = 0; k < v.length; ++k) {
      const r = find_float(v[k], path + `/${k}`);
      if (r[0]) return r;
    }
    return [false, path];
  }
  if (typeof v === 'object') {
    for (const k in v) {
      const r = find_float(v[k], path + `/${k}`);
      if (r[0]) return r;
    }
    return [false, path];
  }
  return [false, path];
}
