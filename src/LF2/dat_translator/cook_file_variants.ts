import { IEntityData } from "../defines";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";

const suffix_reg = /\.[^.]*$/
const get_letter = (offset: number) => String.fromCharCode(98 + offset);

export function cook_file_variants(ret: IEntityData) {
  const { files = {} } = ret.base;
  const file_keys = Object.keys(files);
  if (!file_keys.length || file_keys.length % 2 !== 0)
    return;
  const infos: ILegacyPictureInfo[] = file_keys.sort().map(k => files[k] as ILegacyPictureInfo)
  const indexes = [0]
  const first_str = infos[0].path.replace(suffix_reg, '')
  for (let i = 0; i < 16; ++i) {
    const letter = get_letter(i);
    const v_idx = infos.findIndex(info => info.path.replace(suffix_reg, '') === first_str + letter);
    if (v_idx < 1) break;
    indexes.push(v_idx);
  }
  const gap = indexes.reduce<number | null>((pre, item, idx, arr) => {
    if (idx === 0) return item;
    const diff = item - arr[idx - 1];
    if (idx === 1) return diff
    return pre === diff ? pre : null
  }, 0)
  if (!gap) return;
  let is_match = true;
  for (let i = 0; i < gap; ++i) {
    const template = infos[i]
    const variants = indexes.slice(1).map(j => infos[j + i])
    is_match = !variants.some((variant, idx) => {
      const is_path_ok =
        variant.path.replace(suffix_reg, '') ===
        template.path.replace(suffix_reg, '') + get_letter(idx);
      return !is_path_ok ||
        variant.col !== template.col ||
        variant.row !== template.row ||
        variant.cell_w !== template.cell_w ||
        variant.cell_h !== template.cell_h
    })
    if (!is_match) return;
  }
  for (let i = 0; i < gap; ++i) {
    infos[i].variants = indexes.slice(1).map(j => infos[j + i].id)
  }
}