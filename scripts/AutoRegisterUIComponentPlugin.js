const { watch } = require("fs");
const { readFile, readdir, writeFile } = require("fs/promises");
const { join } = require("path");

/**
 * @param {string} content
 * @param {string} start_txt
 * @param {string} end_txt
 * @returns {[string,string,string]}
 */
function split_text(content, start_txt, end_txt) {
  let start_idx = content.indexOf(start_txt)
  if (start_idx < 0) throw new Error(`[get_text] 'start' not found`)
  start_idx += start_txt.length;
  const end_idx = content.indexOf(end_txt)
  return [
    content.substring(0, start_idx),
    content.substring(start_idx, end_idx),
    content.substring(end_idx),
  ]
}

class AutoRegisterUIComponentPlugin {
  dir_path = join(__dirname, '../src/LF2/ui/component')
  code_path = join(this.dir_path, '_COMPONENTS.ts')
  reg1 = /export class (.*?) extends UIComponent[<|\s]/g
  reg2 = /export class (.*?) extends UIComponent[<|\s]/
  async run() {
    const content = await readFile(this.code_path).then(r => r.toString());
    const [txt_0, , remain_txt] = split_text(
      content,
      `/*** COMPONENTS IMPORT START ***/`,
      `/*** COMPONENTS IMPORT END ***/`
    )
    const [txt_1, , txt_2] = split_text(
      remain_txt,
      `/*** COMPONENTS MAP START ***/`,
      `/*** COMPONENTS MAP END ***/`
    )

    const file_names = await readdir(this.dir_path);
    let import_txt = '\n'
    let map_txt = '\n'
    let i = 0;
    let line_len = 0;
    for (const name of file_names) {
      if (!name.endsWith('.ts')) continue;
      const file_path = join(this.dir_path, name);
      const content = await readFile(file_path).then(r => r.toString());
      const arr = content.match(this.reg1)
      if (!arr?.length) continue;

      const mod_name = `_${(++i).toString(16)}`
      import_txt += `import * as ${mod_name} from "./${name.substring(0, name.length - 3)}";\n`
      const component_names = arr.map(v => v.match(this.reg2)[1].trim())
      for (let name of component_names) {
        name = name.trim()
        const i = name.indexOf('<')
        if (i > 0) name = name.substring(0, i)
        const me = `${mod_name}.${name}, `
        if (line_len === 0) {
          map_txt += '  ' + me
          line_len += me.length + 2
        } else {
          map_txt += me
          line_len += me.length;
        }
        if (line_len >= 80) {
          map_txt += '\n';
          line_len = 0;
        }
      }
    }
    map_txt = map_txt.substring(0, map_txt.length - 2)
    map_txt += '\n'



    await writeFile(this.code_path, txt_0 + import_txt + txt_1 + map_txt + txt_2)
  }
  _jid = 0;
  apply() {
    this.run()


    watch(this.dir_path, 'buffer', async (p, f) => {

      const filename = f.toString()
      if (!filename.endsWith('.ts')) return;
      const jid = ++this._jid
      const file_path = join(this.dir_path, filename)
      const changed = await readFile(file_path)
        .then(r => r.toString())
        .then(r => !!r.match(this.reg1).length)
        .catch(_ => false)
      if (!changed || jid === this._jid) return;
      await this.run().catch(() => null)
    })
  }
}
module.exports = AutoRegisterUIComponentPlugin