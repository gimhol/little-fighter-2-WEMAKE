import { LF2 } from "../LF2";
import { BotController } from "../bot/BotController";
import { BallController } from "../controller/BallController";
import { IBaseData, IBgData, IBotData, IDataLists, IEntityData, IStageInfo } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { Defines } from "../defines/defines";
import { Ditto } from "../ditto";
import { Factory } from "../entity";
import {
  is_ball_data,
  is_bg_data,
  is_entity_data,
  is_fighter_data,
  is_weapon_data,
} from "../entity/type_check";
import { Randoming } from "../helper/Randoming";
import { is_non_blank_str, is_str } from "../utils/type_check";
import { check_stage_info } from "./check_stage_info";
import { preprocess_bg_data } from "./preprocess_bg_data";
import { preprocess_entity_data } from "./preprocess_entity_data";
import { preprocess_stage } from "./preprocess_stage";

export interface IDataListMap {
  background: IBgData[];
  [EntityEnum.Entity]: IEntityData[];
  [EntityEnum.Fighter]: IEntityData[];
  [EntityEnum.Weapon]: IEntityData[];
  [EntityEnum.Ball]: IEntityData[]
}

const create_data_list_map = (): IDataListMap => ({
  background: [Defines.VOID_BG],
  [EntityEnum.Entity]: [],
  [EntityEnum.Fighter]: [],
  [EntityEnum.Weapon]: [],
  [EntityEnum.Ball]: []
});

class Inner {
  readonly mgr: DatMgr;
  readonly id: number;
  get cancelled(): boolean {
    return this.mgr.inner_id !== this.id;
  }
  data_list_map = create_data_list_map();
  data_map = new Map<string, IEntityData>();
  stages: IStageInfo[] = [Defines.VOID_STAGE];
  bot_map = new Map<string, IBotData>();

  get lf2() {
    return this.mgr.lf2;
  }

  constructor(mgr: DatMgr, id: number) {
    this.mgr = mgr;
    this.id = id;
  }

  private async _cook_data(data: IBaseData): Promise<IBaseData> {
    const jobs: Promise<any>[] = [];
    if (is_bg_data(data)) data = preprocess_bg_data(this.lf2, data, jobs)
    if (is_ball_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new BallController(a, b));
    else if (is_weapon_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new BallController(a, b));
    else if (is_fighter_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new BotController(a, b));
    if (is_entity_data(data)) {
      if (data.base.bot_id) {
        data.base.bot = data.base.bot ?? this.bot_map.get(data.base.bot_id)
      };
      data = await preprocess_entity_data(this.lf2, data, jobs);
    }
    return data;
  }

  private _add_obj(index_id: string | number, data: IEntityData) {
    const _index_id = "" + index_id;
    if (this.data_map.has(_index_id)) {
      Ditto.warn(
        DatMgr.TAG + "::_add_obj",
        "id duplicated, old data will be overwritten!",
        "old data:",
        this.data_map.get(_index_id),
        "new data:",
        data,
      );
    }
    this.data_map.set(_index_id, data);
    const list = this.data_list_map[data.type]
    if (!list.some(v => v === data)) list.push(data);
  }

  private _add_bg(data: IBgData) {
    const list = this.data_list_map[data.type]
    if (!list.some(v => v === data)) list.push(data);
  }

  async load(index_files: string[]) {
    for (const k of Object.keys(Defines.BuiltIn_Imgs)) {
      const src = (Defines.BuiltIn_Imgs as any)[k];
      if (!is_non_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      await this.lf2.images.load_img(src, src);
      // await this.lf2.images.load_img(src + '?white', src);
    }
    for (const k of Object.keys(Defines.BuiltIn_Dats)) {
      const src = (Defines.BuiltIn_Dats as any)[k];
      if (!is_non_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      const raw = await this.lf2.import_json<IBaseData>(src).then(r => r[0])
      const cooked = await this._cook_data(raw) as IEntityData;
      this._add_obj(src, cooked);
    }
    const data: IDataLists = { objects: [], backgrounds: [], stages: [], bots: [] }
    for (const file of index_files) {
      const { objects = [], backgrounds = [], stages = [], bots = [] } = await this.lf2.import_json<Partial<IDataLists>>(file, true)
        .then(r => r[0]).catch(e => { Ditto.warn(`FAIL TO LOAD DAT INDEX ${file}, ` + e); return {} as Partial<IDataLists> });

      data.objects.push(...objects)
      data.backgrounds.push(...backgrounds)
      data.stages.push(...stages)
      data.bots.push(...bots)
    }

    if (this.cancelled) throw new Error("cancelled");
    for (const { id, file } of data.bots) {
      this.lf2.on_loading_content(`${file}`, 0);
      const bot_data = await this.lf2.import_json<IBotData>(file, true)
        .then(r => {
          return r[0]
        }).catch(e => {
          Ditto.warn(`FAILED TO LOAD BOT DATA: ${file}`);
          return undefined
        });
      if (bot_data) {
        this.bot_map.set(id, bot_data);
        if (id != file) this.bot_map.set(file, bot_data);
        if (id != bot_data.id) this.bot_map.set(bot_data.id, bot_data);
      }
    }

    for (const { id, file } of data.objects) {
      if (this.cancelled) throw new Error("cancelled");
      try {
        this.lf2.on_loading_content(`${file}`, 0);
        const raw = await this.lf2.import_json<IEntityData>(file, true).then(r => r[0])
        const cooked = await this._cook_data(raw) as IEntityData;

        this._add_obj(id, cooked);
        if (id != file) this._add_obj(file, cooked);
        if (id != cooked.id) this._add_obj(cooked.id, cooked);
      } catch (e) {
        throw new Error(`fail to load obj: ${file}, reason: ${e}`)
      }
    }
    for (const { id, file } of data.backgrounds) {
      if (this.cancelled) throw new Error("cancelled");
      try {
        this.lf2.on_loading_content(`${file}`, 0);
        const raw = await this.lf2.import_json(file, true).then(r => r[0])
        const cooked = await this._cook_data(raw) as IBgData;
        this._add_bg(cooked)
      } catch (e) {
        throw new Error(`fail to load bg: ${file}, reason: ${e}`)
      }
    }
    const stages: IStageInfo[] = []
    for (const stage_file of data.stages) {
      this.lf2.on_loading_content(`${stage_file.file}`, 0);
      const stage_datas = await this.lf2.import_json<IStageInfo[]>(stage_file.file, true)
        .then(r => r[0])
        .catch(e => { Ditto.warn(`FAILED TO LOAD STATE: ${stage_file.file}`); return [] as IStageInfo[] });
      this.lf2.on_loading_content(`${stage_file.file}`, 100);
      for (const stage of stage_datas) {
        stages.push(preprocess_stage(stage))
      }
    }

    if (!this.stages.length)
      this.stages.unshift(Defines.VOID_STAGE)
    for (const stage of stages) {
      const idx = this.stages.findIndex(v => v.id === stage.id);
      check_stage_info(stage)
      if (idx < 0) this.stages.push(stage);
      this.stages[idx] = stage;
    }
  }
}

export default class DatMgr {
  static readonly TAG: string = "DatMgr";

  find_group(group: string) {
    const f = (v: IEntityData) => v.base.group?.some(g => g === group)
    return {
      characters: this.fighters.filter(f),
      weapons: this.weapons.filter(f),
      entity: this.entity.filter(f),
      balls: this.balls.filter(f),
    };
  }
  private _inner_id: number = 0;
  private _inner = new Inner(this, ++this._inner_id);
  get inner_id(): number {
    return this._inner_id;
  }
  readonly lf2: LF2;

  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  load(index_files: string[]): Promise<void> {
    return this._inner.load(index_files);
  }

  dispose(): void {
    ++this._inner_id;
  }

  clear(): void {
    this._inner = new Inner(this, ++this._inner_id);
  }

  get fighters() {
    return this._inner.data_list_map[EntityEnum.Fighter];
  }
  get weapons() {
    return this._inner.data_list_map[EntityEnum.Weapon];
  }
  get backgrounds() {
    return this._inner.data_list_map.background;
  }
  get balls() {
    return this._inner.data_list_map[EntityEnum.Ball];
  }
  get entity() {
    return this._inner.data_list_map[EntityEnum.Entity];
  }
  get stages(): IStageInfo[] {
    return this._inner.stages;
  }

  find(id: number | string): IEntityData | undefined {
    return this._inner.data_map.get("" + id);
  }

  private randomings = new Map<string, Randoming<IEntityData>>();
  get_randoming_by_group(group: string) {
    let ret = this.randomings.get(group);
    if (!ret) {
      const { characters, weapons, entity, balls } = this.find_group(group);
      this.randomings.set(
        group,
        ret = new Randoming([
          ...characters, ...weapons, ...entity, ...balls
        ], this.lf2)
      );
    }
    return ret
  }

  find_weapon(id: string): IEntityData | undefined;
  find_weapon(predicate: IFindPredicate<IEntityData>): IEntityData | undefined;
  find_weapon(
    arg_0: string | IFindPredicate<IEntityData>,
  ): IEntityData | undefined {
    return is_str(arg_0)
      ? this.weapons.find((v) => v.id === arg_0)
      : this.weapons.find(arg_0);
  }

  find_fighter(id: string): IEntityData | undefined;
  find_fighter(
    predicate: IFindPredicate<IEntityData>,
  ): IEntityData | undefined;
  find_fighter(
    arg_0: string | IFindPredicate<IEntityData>,
  ): IEntityData | undefined {
    return is_str(arg_0)
      ? this.fighters.find((v) => v.id === arg_0)
      : this.fighters.find(arg_0);
  }

  find_background(id: string): IBgData | undefined;
  find_background(predicate: IFindPredicate<IBgData>): IBgData | undefined;
  find_background(
    arg_0: string | IFindPredicate<IBgData>,
  ): IBgData | undefined {
    return is_str(arg_0)
      ? this.backgrounds.find((v) => v.id === arg_0)
      : this.backgrounds.find(arg_0);
  }

  get_characters_of_group(group: string): IEntityData[] {
    return this.fighters.filter(
      (v) => v.base.group && v.base.group.indexOf(group) >= 0,
    );
  }
  get_fighters_not_in_group(group: string): IEntityData[] {
    return this.fighters.filter(
      (v) => !v.base.group || v.base.group.indexOf(group) < 0,
    );
  }
}
interface IFindPredicate<T> {
  (value: T, index: number, obj: T[]): unknown;
}

