import * as esbuild from "esbuild";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";
import { rmSync } from "fs";

const outDir = "dist";
const entryPoint = "index.ts";
const bundleName = "LFW-CORE";

// Clean
rmSync(outDir, { recursive: true, force: true });

const jsOnly = process.argv.includes("--js-only");
const dtsOnly = process.argv.includes("--dts-only");
const doJs = !dtsOnly || jsOnly;
const doDts = !jsOnly || dtsOnly;

// ── Step 1: Bundle JS with esbuild ──────────────────────────────────
if (doJs) {
  console.log("[esbuild] Bundling JS...");
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    target: "es2022",
    outfile: `${outDir}/${bundleName}.js`,
    sourcemap: true,
    platform: "neutral",
    treeShaking: true,
    packages: "external",
  });
  console.log(`[esbuild] Done → ${outDir}/${bundleName}.js`);
}

// ── Step 2: Generate bundled .d.ts with rollup-plugin-dts ───────────
if (doDts) {
  console.log("[rollup-plugin-dts] Generating .d.ts...");
  const bundle = await rollup({
    input: entryPoint,
    plugins: [dts()],
    external: [/^json5/],
  });
  await bundle.write({
    file: `${outDir}/${bundleName}.d.ts`,
    format: "esm",
  });
  await bundle.close();
  console.log(`[rollup-plugin-dts] Done → ${outDir}/${bundleName}.d.ts`);
}

console.log("Build complete.");
