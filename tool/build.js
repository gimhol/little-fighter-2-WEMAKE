// build.js
import { execSync } from "child_process";
// import path from "path";


const whats = {
  "win:x64": { target: "bun-windows-x64", outfile: "./exe/win/x64/lf2w-tool.exe", },
  "mac:x64": { target: "bun-darwin-x64", outfile: "./exe/mac/x64/lf2w-tool", },
  "mac:arm64": { target: "bun-darwin-arm64", outfile: "./exe/mac/arm64/lf2w-tool", },
  "linux:x64": { target: "bun-linux-x64", outfile: "./exe/linux/arm64/lf2w-tool", },
  "linux:arm64": { target: "bun-linux-arm64", outfile: "./exe/linux/arm64/lf2w-tool", },
}
const { target, outfile } = whats[process.argv[2]]
const output = execSync(`bun build ./src/index.ts --compile --minify --sourcemap --bytecode --target=${target} --outfile ${outfile}`, { stdio: "pipe", encoding: "utf8" });
console.log(output)

// setTimeout(() => {
//   const rcedit_path = path.resolve(`./node_modules/rcedit/bin/rcedit-x64.exe`)
//   const exe_path = path.resolve(`./exe/win/x64/lfw-tool.exe`)
//   const cmd = `${rcedit_path} "${exe_path}" --set-product-version "1.0.0"`.replace(/\n|\r/g, ' ')

//   console.log(cmd)
//   const output = execSync(cmd, { stdio: "pipe", encoding: "utf8" });
// }, 1000)

