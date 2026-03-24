import { cp, mkdir, readFile, writeFile } from "fs/promises";
import JSON5 from "json5";
import { dirname, join } from "path";
import { ActionType, IEntityData, IOpointInfo, ITempDataLists, ITempDatIndex, TNextFrame } from "../../src/LF2/defines";
import { conf } from "./conf";
import { error, log, warn } from "./utils/log";
import { make_zip_and_json } from "./utils/make_zip_and_json";


const { isArray } = Array
async function read_json<T>(src: string) {
  const v = await readFile(src);
  const text = v.toString();
  return JSON5.parse<T>(text);
}

async function write_json<T>(dst: string, outputs: any) {
  await mkdir(dirname(dst), { recursive: true })
  await writeFile(dst, JSON5.stringify(outputs, { space: 2, quote: '"' }))
}
function arraying<T>(v: T | T[] | undefined): T[] {
  if (!v) return []
  if (isArray(v)) return v;
  return [v];
}

function children<K extends string, V>(obj?: { [x in K]?: V; }): V[] {
  if (!obj) return [];
  return Object.keys(obj).map(k => obj[k as K]).filter(Boolean) as V[];
}

export async function make_pick_zip() {
  const { IN_LFW_DIR, IN_LFW_INDEX, LFW_PICKS, CONF_FILE, OUT_DATA_NAME, TMP_DIR, OUT_DIR } = conf()
  if (OUT_DATA_NAME) log({ OUT_DATA_NAME })
  else return error(`'data zip' will not be created, because 'OUT_DATA_NAME' is not set in '${CONF_FILE}'.`)
  if (IN_LFW_DIR) log({ IN_LFW_DIR })
  else return error(`'${OUT_DATA_NAME}' will not be created, because 'IN_LFW_DIR' is not set in '${CONF_FILE}'.`)
  if (IN_LFW_INDEX) log({ IN_LFW_INDEX })
  else return error(`'${OUT_DATA_NAME}' will not be created, because 'IN_LFW_INDEX' is not set in '${CONF_FILE}'.`)
  if (LFW_PICKS) log({ LFW_PICKS })
  else return error(`'${OUT_DATA_NAME}' will not be created, because 'LFW_PICKS' is not set in '${CONF_FILE}'.`)
  if (TMP_DIR) log({ TMP_DIR })
  else return error(`'${OUT_DATA_NAME}' will not be created, because 'TMP_DIR' is not set in '${CONF_FILE}'.`)
  if (OUT_DIR) log({ OUT_DIR })
  else return error(`'${OUT_DATA_NAME}' will not be created, because 'OUT_DIR' is not set in '${CONF_FILE}'.`)

  const inputs = await read_json<ITempDataLists>(join(IN_LFW_DIR, IN_LFW_INDEX))
  const outputs: ITempDataLists = {
    objects: [],
    backgrounds: [],
    stages: [],
    bots: []
  }
  LFW_PICKS.split(';').forEach(v => {
    const txt = v.trim();
    if (!txt) return;
    const [type, remains] = v.split(':');
    if (typeof remains !== 'string')
      return warn(`type not correct`);
    if (!type || !(type in outputs))
      return warn(`type not supported, got ${type}, must be one of "objects, backgrounds, stages, bots"`);
    const oids = remains.split(',');
    if (!oids.length) return;
    const input = inputs[type as keyof ITempDataLists];
    const output = outputs[type as keyof ITempDataLists];
    for (const oid of oids) {
      const item = input.find(v => v.id === oid)
      if (!item) {
        warn(`oid ${oid} not found in ${type}`);
        continue;
      }
      output.push(item)
    }
  })
  // console.log(outputs)
  const file_pairs = new Set<string>();
  function add_file_pairs(...files: (string | undefined)[]) {
    if (!IN_LFW_DIR || !TMP_DIR) return;
    for (const file of files) {
      if (!file) continue;
      file_pairs.add([
        join(IN_LFW_DIR, file).replace(/\\\\/g, '/'),
        join(TMP_DIR, file).replace(/\\\\/g, '/')
      ].join('===>'))
    }
  }
  const depend_opoints = new Map<ITempDatIndex, Set<string>>();
  for (const item of outputs.objects) {
    const src = join(IN_LFW_DIR, item.file).replace(/\\\\/g, '/');
    const data = await read_json<IEntityData>(src)
    children(data.frames).forEach(frame => {
      frame.opoint?.forEach(opoint => {
        arraying(opoint.oid).forEach(oid => {
          if (!oid) return;
          const duplicated = outputs.objects.some(v => v.id === oid || v.alias === oid)
          if (duplicated) return;
          const item = inputs.objects.find(v => v.id === oid || v.alias === oid)
          if (!item) return;

          let set = depend_opoints.get(item)
          if (!set) depend_opoints.set(item, set = new Set())
          arraying(opoint.action).reduce<string[]>((r, v) => {
            r.push(...arraying(v.id))
            return r;
          }, []).forEach(v => set.add(`${data.id}(${data.base.name})->${frame.id}===>${v}`))
        })
      })
    })
    add_file_pairs(
      data.base.head,
      data.base.small,
      ...data.base.hit_sounds || [],
      ...data.base.dead_sounds || [],
      ...data.base.drop_sounds || [],
      ...Object.keys(data.base.files).map(k => data.base.files[k].path),
      ...Object.keys(data.frames).reduce<string[]>((r, k) => {
        const frame = data.frames[k];
        arraying(frame.sound).forEach(v => r.push(v));
        arraying(frame.on_dead).forEach(v => arraying(v?.sounds).forEach(v => r.push(v)))
        arraying(frame.on_exhaustion).forEach(v => arraying(v?.sounds).forEach(v => r.push(v)))
        arraying(frame.on_landing).forEach(v => arraying(v?.sounds).forEach(v => r.push(v)))
        const { hit, hold, key_down, key_up, seqs } = frame;
        const hithold: { [x in string]?: TNextFrame } = Object.assign({}, hit, hold, key_down, key_up, seqs)
        children(hithold).map(arraying).forEach(v => v.forEach(v => arraying(v?.sounds).forEach(v => r.push(v))))
        frame.itr?.forEach(v => v.actions?.forEach(v => {
          if (
            v.type === ActionType.A_Sound ||
            v.type === ActionType.V_Sound
          ) v.data.path.map(v => r.push(v))
        }))
        frame.bdy?.forEach(v => v.actions?.forEach(v => {
          if (
            v.type === ActionType.A_Sound ||
            v.type === ActionType.V_Sound
          ) v.data.path.map(v => r.push(v))
        }))
        return r
      }, []),
      ...children(data.itr_prefabs).reduce<string[]>((r, v) => {
        v.actions?.forEach(v => {
          if (
            v.type === ActionType.A_Sound ||
            v.type === ActionType.V_Sound
          ) v.data.path.map(v => r.push(v))
        })
        return r;
      }, []),
      ...children(data.bdy_prefabs).reduce<string[]>((r, v) => {
        v.actions?.forEach(v => {
          if (
            v.type === ActionType.A_Sound ||
            v.type === ActionType.V_Sound
          ) v.data.path.map(v => r.push(v))
        })
        return r;
      }, []),
      ...arraying(data.on_dead).reduce<string[]>((r, v) => {
        arraying(v?.sounds).forEach(v => r.push(v))
        return r;
      }, []),
      ...arraying(data.on_exhaustion).reduce<string[]>((r, v) => {
        arraying(v?.sounds).forEach(v => r.push(v))
        return r;
      }, []),
    )
    const dst = join(TMP_DIR, item.file).replace(/\\\\/g, '/');
    await cp(src, dst, { recursive: true }).catch(e => error(e))
  }
  for (const [obj, actions] of depend_opoints) {
    warn(' depend object: ', obj, ` actions:`, actions)

  }

  for (const a of file_pairs) {
    const [src, dst] = a.split('===>')
    await cp(src, dst, { recursive: true }).catch(e => error(e))
  }
  await write_json(join(TMP_DIR, IN_LFW_INDEX), outputs)
  await make_zip_and_json(TMP_DIR, OUT_DIR, OUT_DATA_NAME, (inf) => {
    inf.type = 'data';
    return inf;
  });
  return [IN_LFW_INDEX, LFW_PICKS].join()


}
