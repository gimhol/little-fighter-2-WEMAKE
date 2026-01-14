import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve';
export default {
  input: './node_modules/.tool_tmp/tool/src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    json(),
    resolve({ preferBuiltins: false }),
    commonjs()
  ]
};