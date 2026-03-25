import obj_dat_to_json from "../../../src/LF2/dat_translator/obj_dat_to_json";
import { make_bg_data } from "../../../src/LF2/dat_translator/make_bg_data";
import { make_stage_info_list } from "../../../src/LF2/dat_translator/make_stage_info_list";
import { DatTypeEnum, IBgData, IDatIndex, IStageInfo } from "../../../src/LF2/defines";
import type { IDataLists } from "../../../src/LF2/defines/IDataLists";
import type { IEntityData } from "../../../src/LF2/defines/IEntityData";
import { debug, error, info } from "./log";
import { read_lf2_dat_file } from "./read_lf2_dat_file";
import { write_obj_file } from "./write_obj_file";
export type IRet = IEntityData | IBgData | IStageInfo[]

export interface IConvertDatContext {
  out_dir: string;
  src_path: string;
  dst_path: string;
  indexes: IDataLists;
}
export async function convert_dat_file(
  ctx: IConvertDatContext,
): Promise<IRet> {
  let { out_dir, src_path, dst_path, indexes } = ctx;
  debug(`convert_dat_file(
  out_dir = ${JSON.stringify(out_dir)},
  src_path = ${JSON.stringify(src_path)}, 
  dst_path = ${JSON.stringify(dst_path)}, 
  indexes = ${indexes}, 
)`)
  dst_path = dst_path.replace(/\\/g, '/');
  out_dir = out_dir.replace(/\\/g, '/');

  const index_file_value = dst_path.replace(out_dir + "/", "");
  let index_info = indexes.objects.find((v) => index_file_value === v.file.replace(/\\/g, '/'))
  if (index_info) {
    const txt = await read_lf2_dat_file(src_path);
    const ret = obj_dat_to_json(txt, index_info);
    let dirty = ret as Partial<IEntityData>;
    if (typeof dirty.base?.bot_id === 'string' && dirty.base.bot) {
      const { bot } = dirty.base;
      delete dirty.base.bot;
      const bot_dst_path = dst_path.replace(/(.*)\/(.*?)\.obj\.json5$/, `$1/bots/${ret.id}.bot.json5`)
      indexes.bots.push({ id: dirty.base.bot_id, type: DatTypeEnum.Bot, file: bot_dst_path.replace(out_dir + "/", "") });
      await write_obj_file(bot_dst_path, bot);
    }
    info(src_path, "=>\n    " + dst_path);
    await write_obj_file(dst_path, ret);
    return ret;
  }

  index_info = indexes.backgrounds.find((v) => index_file_value === v.file.replace(/\\/g, '/'))
  if (index_info) {
    const txt = await read_lf2_dat_file(src_path);
    const ret = make_bg_data(txt, index_info);
    info(src_path, "=>\n    " + dst_path);
    await write_obj_file(dst_path, ret);
    return ret;
  }

  index_info = indexes.stages.find((v) => index_file_value === v.file.replace(/\\/g, '/'));
  if (index_info) {
    const txt = await read_lf2_dat_file(src_path);
    const ret = make_stage_info_list(txt);
    info(src_path, "=>\n    " + dst_path);
    await write_obj_file(dst_path, ret);
    return ret;
  }

  const message = `Convert failed, ${[
    src_path,
    "If this file is not used, please remove it.",
    'Otherwise, please add it to data.txt.'
  ].join('\n    ')}`
  error(message);
  throw new Error(message);
}
convert_dat_file.get_dst_path = function (
  out_dir: string,
  src_dir: string,
  src_path: string,
  type: 'bg' | 'obj' | 'stage',
  suffix: string = 'json5',
): string {
  const s_type = type ? `.${type}` : ''
  return src_path.replace(src_dir, out_dir).replace(/\\/g, '/').replace(/\.dat$/, `${s_type}.${suffix}`);
}