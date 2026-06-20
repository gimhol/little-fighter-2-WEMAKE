
function split_path(path: string, suffix: string): [string, string, string] | undefined {
  if (!path.endsWith(suffix)) return
  const name_index = path.lastIndexOf('/')
  const dir_part = path.substring(0, name_index + 1)
  const name_part = path.substring(name_index + 1, path.length - suffix.length)
  return [dir_part, name_part, suffix]
}


/**
 * 根据引入名，获取后备名, 包含引入名
 *
 * @export
 * @todo 也许使“引入名”变明确才更合适，而不是找好几次
 * @param {string} name 引入名
 * @returns {string[]} 备选引入名列表
 */
export function get_import_fallbacks(name: string): [string[], string] {
  const fallbacks = [name];
  let ppp: [string, string, string] | undefined
  if (ppp =
    split_path(name, ".png") ||
    split_path(name, ".bmp") ||
    split_path(name, ".webp")
  ) {
    fallbacks.unshift(...[
      ppp[0] + ppp[1] + "@4x.webp",
      ppp[0] + ppp[1] + "@4x.png",
      ppp[0] + ppp[1] + "@3x.webp",
      ppp[0] + ppp[1] + "@3x.png",
      ppp[0] + ppp[1] + "@2x.webp",
      ppp[0] + ppp[1] + "@2x.png",
      ppp[0] + "@4x/" + ppp[1] + ".webp",
      ppp[0] + "@4x/" + ppp[1] + ".png",
      ppp[0] + "@3x/" + ppp[1] + ".webp",
      ppp[0] + "@3x/" + ppp[1] + ".png",
      ppp[0] + "@2x/" + ppp[1] + ".webp",
      ppp[0] + "@2x/" + ppp[1] + ".png",
      ppp[0] + ppp[1] + ".webp",
      ppp[0] + ppp[1] + ".png",
    ].filter((v) => v !== name));
    return [fallbacks, ppp[2]];
  }

  /*
  举例：
    输入 a.wav
    输出 [a.mp3, a.wav.mp3, a.wav]
  */
  if (
    ppp =
    split_path(name, ".wav") ||
    split_path(name, ".wma")
  ) {
    fallbacks.unshift(
      ppp[0] + ppp[1] + '.mp3',
      ppp[0] + ppp[1] + ppp[2] + '.mp3',
    )
    return [fallbacks, ppp[2]];
  }
  return [fallbacks, '']
}
