import { readdirSync, statSync } from "fs";
export class ClassifyResult {
  directories: string[] = [];
  protected file: { [x in string]?: string[] } = {};

  get_files(...suffix: string[]): string[] {
    const ret: string[] = [];
    for (const s of suffix) {
      const l = this.file[s]
      if (l?.length) ret.push(...l)
    }
    return ret;
  }
  add(suffix: string | undefined, filepath: string) {
    const s = '' + suffix?.toLowerCase()
    const l = this.file[s] || (this.file[s] = [])
    l.push(filepath)
  }
}

export function classify(
  cur_dir_path: string,
  result: ClassifyResult = new ClassifyResult(),
): ClassifyResult {
  for (const name of readdirSync(cur_dir_path)) {
    const sub_path = cur_dir_path + "/" + name;
    const stat = statSync(sub_path);
    if (stat.isFile()) {
      const parts = name.split('.').filter(Boolean)
      result.add(parts[parts.length - 1], sub_path)
      if (parts.length === 1) result.add('', sub_path)
      continue;
    }
    if (stat.isDirectory()) {
      result.directories.push(sub_path);
      classify(sub_path, result);
      continue;
    }
  }
  return result;
}
