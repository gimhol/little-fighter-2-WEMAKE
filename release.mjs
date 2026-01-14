
import { zip } from "compressing"
import fs from "fs/promises"

async function main() {
  const { version } = await fs.readFile("./package.json").then(b => JSON.parse(b.toString()))
  const output_dir = `./release/${version}`

  await fs.mkdir(`${output_dir}/frontend`, { recursive: true }).catch(e => e)
  fs.cp("./dist", `${output_dir}/frontend`, { recursive: true })
  fs.cp("./tool/dist/index.js", `${output_dir}/tool.cjs`)
  fs.cp("./server/dist/cjs/index.cjs", `${output_dir}/server.cjs`)
  await zip.compressDir(output_dir, output_dir + `.zip`, { ignoreBase: true });
}
main();