import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { rmSync } from 'fs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

let targets = [
  { dir: './dist', tsconfig: "./tsconfig.json" },
]
let formats = ['cjs']
const configs = [];

// "amd", "cjs", "system", "es", "iife" or "umd"

for (const format of formats) {
  for (const { dir, tsconfig } of targets) {
    const dist_dir = `${dir}/${format}`
    try {
      rmSync(dist_dir, { recursive: true, focus: true })
    } catch (error) {
      //
    }
    const bundle_js_config = {
      input: 'src/index.ts',
      output: {
        file: `${dist_dir}/index.js`,
        format,
        sourcemap: true,
        name: "lfj-node-server"
      },
      plugins: [
        json(),
        typescript({ tsconfig }),
        commonjs(),
        nodeResolve({ preferBuiltins: true })
      ]
    }
    configs.push(bundle_js_config)
  }
}

export default configs