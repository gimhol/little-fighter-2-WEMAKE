// build.js
import { execSync } from "child_process";
import { author, version } from "../package.json";
/* 
https://bun.net.cn/docs/bundler/executables 
*/
const whats = {
  "win:x64": {
    target: "bun-windows-x64",
    outfile: `./exe/win/x64/lf2w-tool.exe`,
    more: [
      `--windows-icon=./icon.ico`,
      `--windows-title "LFW Tool"`,
      `--windows-version ${version}`,
      `--windows-publisher ${author.name}`,
      `--windows-description "Tool for make data for Little Fighter Wemake"`,
      `--windows-copyright "Copyright © 2024 ${author.name}"`
    ].join(' ')
  },
  "mac:x64": { target: "bun-darwin-x64", outfile: "./exe/mac/x64/lf2w-tool", more: '', },
  "mac:arm64": { target: "bun-darwin-arm64", outfile: "./exe/mac/arm64/lf2w-tool", more: '', },
  "linux:x64": { target: "bun-linux-x64", outfile: "./exe/linux/arm64/lf2w-tool", more: '', },
  "linux:arm64": { target: "bun-linux-arm64", outfile: "./exe/linux/arm64/lf2w-tool", more: '', },
}
const { target, outfile, more } = whats[process.argv[2]]
const output = execSync(`
bun build ./src/index.ts 
--compile --minify --sourcemap --bytecode --target=${target} 
--outfile ${outfile}
${more}
`.trim().replace(/\n/g, ' '), { stdio: "pipe", encoding: "utf8" });

