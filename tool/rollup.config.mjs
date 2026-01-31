import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
export default {
  input: './node_modules/.tool_tmp/tool/src/index.js',
  external: [
    "path/posix",
    "fs/promises",
    "stream/promises",
    "fs",
    "readline",
    "crypto",
    "assert",
    "stream",
    "path",
    "child_process",
    "constants",
    "util",
    "events",
    "zlib",
    "buffer",
  ],
  output: {
    file: 'dist/tool.cjs',
    format: 'cjs'
  },
  plugins: [
    json(),
    resolve({ preferBuiltins: false }),
    commonjs(),
    terser({
      compress: true,
      output: {
        indent_level: 0,
        comments: false
      }
    })
  ]
};