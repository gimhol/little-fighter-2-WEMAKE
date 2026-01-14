
import { zip } from "compressing"
import fs from "fs/promises"

async function main() {
  const { version } = await fs.readFile("./package.json").then(b => JSON.parse(b.toString()))
  const output_dir = `./release/${version}`
  const outzip_path = `./release/Little-Fighter-2-Wemake-${version}.zip`

  await fs.mkdir(`${output_dir}/frontend`, { recursive: true }).catch(e => e)
  fs.cp("./dist", `${output_dir}/frontend`, { recursive: true })
  fs.cp("./tool/dist/tool.cjs", `${output_dir}/tool.cjs`)
  fs.cp("./server/dist/cjs/server.cjs", `${output_dir}/server.cjs`)
  await zip.compressDir(output_dir, outzip_path, { ignoreBase: true });
}
main();