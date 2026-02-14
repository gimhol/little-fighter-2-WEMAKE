import dat_to_json from "../../../src/LF2/dat_translator/dat_2_json";
import type { IDataLists } from "../../../src/LF2/defines/IDataLists";
import type { IEntityData } from "../../../src/LF2/defines/IEntityData";
import { debug, error, info } from "./log";
import { read_lf2_dat_file } from "./read_lf2_dat_file";
import { write_obj_file } from "./write_obj_file";
export type IRet = ReturnType<typeof dat_to_json>;

export async function convert_dat_file(
  out_dir: string,
  src_path: string,
  dst_path: string,
  indexes: IDataLists,
): Promise<IRet> {
  debug(`convert_dat_file(
  out_dir = ${JSON.stringify(out_dir)},
  src_path = ${JSON.stringify(src_path)}, 
  dst_path = ${JSON.stringify(dst_path)}, 
  indexes = ${indexes}, 
)`)
  dst_path = dst_path.replace(/\\/g, '/');
  out_dir = out_dir.replace(/\\/g, '/');

  const index_file_value = dst_path.replace(out_dir + "/", "");
  const index_info =
    indexes.objects.find((v) => index_file_value === v.file.replace(/\\/g, '/')) ||
    indexes.backgrounds.find((v) => index_file_value === v.file.replace(/\\/g, '/'));

  const txt = await read_lf2_dat_file(src_path);
  const ret = dat_to_json(txt, index_info);
  if (!ret) {
    error("Convert failed", [
      src_path,
      "If this file is not used, please remove it.",
      'Otherwise, please add it to data.txt.'
    ].join('\n    '));
    return void 0;
  }
  if (dst_path.endsWith('.obj.json5')) {
    let dirty = ret as Partial<IEntityData>;
    // NOTE: 很奇怪hunter 的frame3有个opoint
    if (dirty?.frames?.[3]?.opoint && index_info?.type === "0") {
      delete dirty.frames[3].opoint;
    }
    if (typeof dirty.base?.bot_id === 'string' && dirty.base.bot) {
      const { bot } = dirty.base;
      delete dirty.base.bot;
      const bot_dst_path = dst_path.replace(/(.*)\/(.*?)\.obj\.json5$/, '$1/bots/$2.bot.json5')
      indexes.bots.push({ id: dirty.base.bot_id, type: 'bot', file: bot_dst_path.replace(out_dir + "/", "") });
      await write_obj_file(bot_dst_path, bot);
    }
  }

  info(src_path, "=>\n    "+ dst_path);
  await write_obj_file(dst_path, ret);
  return ret;
}
convert_dat_file.get_dst_path = function (
  out_dir: string,
  src_dir: string,
  src_path: string,
  type: 'bg' | 'obj' | 'index' | 'stage',
  suffix: string = 'json5',
): string {

  const s_type = type ? `.${type}` : ''
  return src_path.replace(src_dir, out_dir).replace(/\\/g, '/').replace(/\.dat$/, `${s_type}.${suffix}`);
};
