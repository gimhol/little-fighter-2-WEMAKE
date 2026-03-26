import fs from "fs/promises";

export async function auto_exports(dir) {
  const files = await fs.readdir(dir);
  files.forEach((v, i, a) => a[i] = v.replace(/\\/g, '/'))
  files.sort();
  const lines = []
  for (const file of files) {
    if (file.endsWith('/index.ts')) continue;
    const sub = `${dir}/${file}`
    const s = await fs.stat(sub)
    if (s.isFile() && file.endsWith('.ts')) {
      lines.push(`export * from "./${file.replace(/.ts$/, '')}";`)
    } else if (s.isDirectory() && auto_exports(sub) > 0) {
      lines.push(`export * from "./${file}";`)
    }
  }
  if (lines.length) {
    lines.unshift(`/************ [START] auto-exports ************/`)
    lines.push(`/************ [END] auto-exports ************/`)
    const s = await fs.stat(`${dir}/index.ts`).catch(() => null)
    if (!s) {
      await fs.writeFile(`${dir}/index.ts`, lines.join('\n'))
    } else if (s.isFile()) {
      const buf = await fs.readFile(`${dir}/index.ts`);
      const str = buf.toString().trim()
      if (str.startsWith(lines[0]) && str.endsWith(lines[lines.length - 1])) {
        await fs.writeFile(`${dir}/index.ts`, lines.join('\n'))
      } else if (!str) {
        await fs.writeFile(`${dir}/index.ts`, lines.join('\n'))
      } else {
        throw `${dir}/index.ts is not empty`;
      }
    } else {
      throw `${dir}/index.ts is not file`;
    }
  }
  return lines.length;
}
if (process.argv[2])
  auto_exports(process.argv[2])