const { dir } = require("console")
const { watch } = require("fs")
const { readdir, writeFile, stat } = require("fs/promises")
const { join } = require("path")

class AutoIndexExportPlugin {
  /** @type {string[]} */
  dir = []

  debug = () => void 0;

  constructor(opts = {}) {
    if (Array.isArray(opts.dir)) {
      for (const d of opts.dir) {
        if (typeof d === 'string') {
          this.dir.push(d)
        }
      }
    }
    if (typeof opts.debug === 'boolean' && opts.debug) {
      this.debug = console.debug;
    }
  }

  async write_index(dir) {
    let s = '// auto-gen\n'

    const names = await readdir(dir)
    for (const name of names) {
      const child = join(dir, name)
      const file_stat = await stat(child)
      if (file_stat.isFile()) {
        if (name === 'index.ts' || !name.endsWith('.ts')) continue;
        s += `export * from "./${name.substring(0, name.length - 3)}";\n`
      } else if (file_stat.isDirectory()) {
        await this.write_index(child)
        s += `export * from "./${name}";\n`
      }
    }
    this.debug(`write_index: ${dir}, ${s}`)
    await writeFile(join(dir, 'index.ts'), s)
  }

  async listen_dir(dir) {
    this.debug(`listen_dir: ${dir}`)

    const names = await readdir(dir)
    for (const name of names) {
      const path = join(dir, name)
      const s = await stat(path)
      if (s.isDirectory())
        await this.listen_dir(path)
    }

    await this.write_index(dir);

    watch(dir, 'buffer', (t, f) => {
      const n = f.toString();
      if (!n.endsWith('.ts')) return;
      if (n === 'index.ts') return;
      this.write_index(dir).catch(e => console.warn(e));
    })
  }
  apply() {
    for (const dir of this.dir)
      this.listen_dir(dir).catch(e => console.warn(e))
  }
}
new AutoIndexExportPlugin({
  dir: [
    join(__dirname, '../src/LF2/defines'),
    join(__dirname, '../src/LF2/utils')
  ]
}).apply()
module.exports = AutoIndexExportPlugin