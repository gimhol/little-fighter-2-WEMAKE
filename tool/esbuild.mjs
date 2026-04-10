import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: './dist/tool.cjs',
  minify: true,
})