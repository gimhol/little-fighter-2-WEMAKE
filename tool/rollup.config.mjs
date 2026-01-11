import commonjs from '@rollup/plugin-commonjs';
export default {
  input: './node_modules/.tool_tmp/tool/src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    commonjs({
      transformMixedEsModules: true
    })
  ]
};