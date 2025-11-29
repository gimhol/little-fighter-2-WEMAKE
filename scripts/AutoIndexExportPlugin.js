const { watch } = require("fs")
const { readdir, writeFile, stat, readFile } = require("fs/promises")
const { join } = require("path")
/**
 * @param {string} content
 * @param {string} start_txt
 * @param {string} end_txt
 * @returns {[string,string,string]}
 */
function split_text(content, start_txt, end_txt) {
  let start_idx = content.indexOf(start_txt)
  let end_idx = content.indexOf(end_txt)
  if (start_idx < 0) throw new Error(`[get_text] 'start' not found`)
  if (end_idx < 0) throw new Error(`[get_text] 'start' not found`)
  start_idx += start_txt.length;

  return [
    content.substring(0, start_idx),
    content.substring(start_idx, end_idx),
    content.substring(end_idx),

  ]
}
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
    let s = '\n'
    const names = await readdir(dir)
    for (const name of names) {
      const child = join(dir, name)
      const file_stat = await stat(child)
      if (file_stat.isFile()) {
        if (name === 'index.ts' || !name.endsWith('.ts') || name.endsWith('.test.ts')) continue;
        s += `export * from "./${name.substring(0, name.length - 3)}";\n`
      } else if (file_stat.isDirectory()) {
        await this.write_index(child)
        s += `export * from "./${name}";\n`
      }
    }
    this.debug(`write_index: ${dir}, ${s}`)

    const content = await readFile(join(dir, 'index.ts')).then(r => r.toString()).catch(() => {
      return `/*** AUTO EXPORT START ***//*** AUTO EXPORT END ***/`
    })
    try {
      const [txt_0, , txt_1] = split_text(
        content,
        `/*** AUTO EXPORT START ***/`,
        `/*** AUTO EXPORT END ***/`
      )
      await writeFile(join(dir, 'index.ts'), txt_0 + s + txt_1)
    } catch (e) {
      console.warn(dir)
      throw e;
    }


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
      const name = f.toString();
      if (!name.endsWith('.ts') || name === 'index.ts' || name.endsWith('.test.ts')) return;
      this.write_index(dir).catch(e => console.warn(e));
    })
  }
  apply() {
    for (const dir of this.dir)
      this.listen_dir(dir).catch(e => console.warn(e))
  }
}

module.exports = AutoIndexExportPlugin