import fs from "fs/promises";

const sig = [
  [`/*** AUTO EXPORT START ***/`, `/*** AUTO EXPORT END ***/`],
  [`/************ [START] auto-exports ************/`, `/************ [END] auto-exports ************/`],
].filter(Boolean)

export async function auto_exports(dir) {
  const files = await fs.readdir(dir);
  files.forEach((v, i, a) => a[i] = v.replace(/\\/g, '/'))
  files.sort();
  const lines = []
  for (const file of files) {
    if (file === `index.ts`) continue;
    if (file === `_.ts`) continue;
    if (file.endsWith(`.test.ts`)) continue;
    const sub = `${dir}/${file}`
    const s = await fs.stat(sub)
    if (s.isFile() && file.endsWith('.ts')) {
      lines.push(`export * from "./${file.replace(/.ts$/, '')}";`)
    } else if (s.isDirectory() && await auto_exports(sub) > 0) {
      lines.push(`export * from "./${file}";`)
    }
  }
  if (lines.length) {
    lines.unshift(sig[0][0])
    lines.push(sig[0][1])
    const s = await fs.stat(`${dir}/index.ts`).catch(() => null)
    if (!s) {
      await fs.writeFile(`${dir}/index.ts`, lines.join('\n'))
    } else if (s.isFile()) {
      const buf = await fs.readFile(`${dir}/index.ts`);
      const str = buf.toString().trim()
      if (sig.some(([a, b]) => str.startsWith(a) && str.endsWith(b))) {
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