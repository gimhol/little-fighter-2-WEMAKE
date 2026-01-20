import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { rmSync } from 'fs';
import typescript from 'rollup-plugin-typescript2';

let targets = [
  { dir: './dist', tsconfig: "./tsconfig.json" },
]
const whats = [{
  format: 'cjs',
  suffix: 'cjs'
}]
const configs = [];

// "amd", "cjs", "system", "es", "iife" or "umd"

for (const { format, suffix = 'js' } of whats) {
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
        file: `${dist_dir}/server.${suffix}`,
        format,
        sourcemap: true,
        name: "lfj-node-server"
      },
      plugins: [
        json(),
        typescript({ tsconfig }),
        commonjs(),
        nodeResolve({ preferBuiltins: true }),
        terser({
          compress: true,
          output: {
            indent_level: 0,
            comments: false
          }
        })
      ]
    }
    configs.push(bundle_js_config)
  }
}

export default configs