const fs = require('fs/promises');
const path = require('path');

function extractClassNames(code) {
  // 步骤1：先移除注释和字符串，避免干扰匹配（关键！）
  const cleanCode = code
    .replace(/\/\/.*/g, '') // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/(["'`])(?:\\.|[^\\])*?\1/g, ''); // 移除字符串（单引号、双引号、模板字符串）

  // 步骤2：JS 原生兼容的核心正则（支持嵌套泛型、泛型约束/默认值）
  // 泛型部分：< 开头，允许嵌套 <>（用 (?:<[^<>]*>|[^<>])* 模拟），直到最外层 > 结束
  const classRegex = /(?:export\s+|abstract\s+|declare\s+)*class\s+([\w$]+)\s*(?:<(?:<[^<>]*>|[^<>])*>)?\s*(?:extends\s+([\w$<>,\s]+?))?(?:\s+implements\s+[\s\S]*?)?\{/g;

  const results = [];
  let match;

  while ((match = classRegex.exec(cleanCode)) !== null) {
    const className = match[1]; // 捕获组1：类名
    const superClassStr = match[2]; // 捕获组2：父类字符串（支持带泛型的父类）

    // 处理父类：去重、去空白、过滤空字符串（保留父类的泛型结构）
    const superClasses = superClassStr
      ? superClassStr.split(',').map(s => s.trim()).filter(Boolean).map(parent => {
        // 关键：移除父类名后的泛型（<...> 及其内部内容）
        // 正则：匹配第一个 < 到对应的 > 之间的所有内容，替换为空
        return parent.replace(/<(?:<[^<>]*>|[^<>])*>/, '');
      })
      : [];

    results.push({ className, superClasses });
  }

  return results;
}

async function find_ts_files(dir, output = []) {
  const names = await fs.readdir(dir)
  for (let i = 0; i < names.length; i++) {
    const filename = path.join(dir, names[i])
    const stat = await fs.stat(filename)
    if (stat.isFile() && filename.endsWith('.ts'))
      output.push(filename)
    else if (stat.isDirectory())
      find_ts_files(filename, output);
  }
  return output;
}

async function find_ui_component_cls(dir) {
  /** @type {string[]} */
  const filenames = await find_ts_files(dir);
  const results_map = {};
  for (const filename of filenames) {
    const key = filename.substring(dir.length + 1, filename.length - 3)
    const content = await fs.readFile(filename).then(r => r.toString())
    const result = extractClassNames(content).filter(v => v.superClasses.length)
    if (key === 'Flex') console.log(result)
    if (key === 'GamePrepareLogic') console.log(result)
    if (!result.length) continue;
    results_map[key.replace(/\\/g, '/')] = result
  }
  const finding_supers = [`UIComponent`];
  const outputs = {}
  while (finding_supers.length) {
    const finding_super = finding_supers.shift()
    const keys = Object.keys(results_map)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const results = results_map[key]
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const super_name = result.superClasses[0]
        if (super_name == finding_super) {
          finding_supers.push(result.className)
          const classnames = outputs[key] || [];
          classnames.push(result.className)
          outputs[key] = classnames;
          results.splice(j, 1);
          --j
        }
      }
      if (!results.length)
        delete results_map[key]
    }
  }
  console.log(JSON.stringify(outputs, null, 2))
}

dir_path = path.join(__dirname, '../src/LF2/ui/component')
find_ui_component_cls(dir_path)
module.exports = find_ui_component_cls