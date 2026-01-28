import { Callbacks, get_short_file_size_txt, new_id, new_team, PIO } from "./base";
import { KEY_NAME_LIST, LocalController } from "./controller";
import * as D from "./defines";
import { CMD, CMD_NAMES } from "./defines/CMD";
import * as I from "./ditto";
import { Entity, Factory } from "./entity";
import { IDebugging, make_debugging } from "./entity/make_debugging";
import * as Helper from "./helper";
import { I18N } from "./I18N";
import { ILf2Callback } from "./ILf2Callback";
import DatMgr from "./loader/DatMgr";
import get_import_fallbacks from "./loader/get_import_fallbacks";
import { PlayerInfo } from "./PlayerInfo";
import { Stage } from "./stage";
import * as UI from "./ui";
import { fisrt, is_str, MersenneTwister } from "./utils";
import { World } from "./World";

const cheat_info_pair = (n: D.CheatType) =>
  [
    n,
    {
      keys: D.Defines.CheatKeys[n],
      sound: D.Defines.CheatTypeSounds[n],
    },
  ] as const;

export class LF2 implements I.IKeyboardCallback, IDebugging {
  static readonly TAG = "LF2";
  static readonly instances: LF2[] = []
  static readonly VERSION_NAME: string = 'v0.1.12'
  static readonly DATA_VERSION: number = D.Defines.DATA_VERSION;
  static readonly DATA_TYPE: string = 'DataZip';

  static get PREL_ZIPS() { return this._PREL_ZIPS }
  static get DATA_ZIPS() { return this._DATA_ZIPS }
  static set PREL_ZIPS(v: (I.IZip | string)[]) { this._PREL_ZIPS = v; this.instances.forEach(v => v.update_zip_names()) }
  static set DATA_ZIPS(v: (I.IZip | string)[]) { this._DATA_ZIPS = v; this.instances.forEach(v => v.update_zip_names()) }
  private static _PREL_ZIPS: (I.IZip | string)[] = ["prel.zip.json"];
  private static _DATA_ZIPS: (I.IZip | string)[] = ["data.zip.json"];
  static get instance(): LF2 | undefined { return LF2.instances[0] }
  static get world(): World | undefined { return this.instance?.world }
  static get ui() { return LF2.instances[0].ui }
  static get ditto() { return I.Ditto }

  get lang(): string { return this._i18n.lang }
  set lang(v: string) { this._i18n.lang = v }
  dev: boolean = false;
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;

  readonly callbacks = new Callbacks<ILf2Callback>();
  private _disposed: boolean = false;
  private _ui_stacks: UI.UIStack[] = [];
  private _loading: boolean = false;
  private _playable: boolean = false;
  private _mt = new MersenneTwister(Date.now())
  get mt() { return this._mt }
  readonly bat_spreading_x = new Helper.Randoming(D.Defines.BAT_CHASE_SPREADING_VX, this)
  readonly bat_spreading_z = new Helper.Randoming(D.Defines.BAT_CHASE_SPREADING_VZ, this)
  readonly disater_spreading_x = new Helper.Randoming(D.Defines.DISATER_SPREADING_VX, this)
  readonly disater_spreading_y = new Helper.Randoming(D.Defines.DISATER_SPREADING_VY, this)
  readonly jan_devil_judgement_spreading_x = new Helper.Randoming(D.Defines.DEVIL_JUDGEMENT_SPREADING_VX, this)
  readonly jan_devil_judgement_spreading_y = new Helper.Randoming(D.Defines.DEVIL_JUDGEMENT_SPREADING_VY, this)

  get loading() {
    return this._loading;
  }
  get playable() {
    return this._playable;
  }
  get need_load() {
    return !this._playable && !this._loading;
  }
  get ui_stacks(): UI.UIStack[] {
    return this._ui_stacks
  }
  get ui(): UI.UINode | undefined {
    return this._ui_stacks[this._ui_stacks.length - 1]?.ui;
  }
  readonly world: World;

  /**
   * 资源包列表
   * 
   * 
   * @readonly
   * @type {I.IZip[]}
   * @memberof LF2
   */
  readonly zips: I.IZip[] = [];
  readonly md5s: string[] = [];
  readonly players: Map<string, PlayerInfo> = new Map([
    ["1", new PlayerInfo("1")],
    ["2", new PlayerInfo("2")],
    ["3", new PlayerInfo("3")],
    ["4", new PlayerInfo("4")],
    ["5", new PlayerInfo("5")],
    ["6", new PlayerInfo("6")],
    ["7", new PlayerInfo("7")],
    ["8", new PlayerInfo("8")],
  ]);
  ensure_player(player_id: string): PlayerInfo {
    let ret = this.players.get(player_id)
    if (!ret) this.players.set(player_id, ret = new PlayerInfo(player_id))
    return ret
  }
  readonly characters = new Helper.CharactersHelper(this);
  readonly weapons = new Helper.WeaponsHelper(this);
  readonly entities = new Helper.EntitiesHelper(this);
  readonly balls = new Helper.BallsHelper(this);
  readonly datas: DatMgr;
  readonly sounds: I.ISounds;
  readonly images: I.IImageMgr;
  readonly keyboard: I.IKeyboard;
  readonly pointings: I.IPointings;

  get stages(): D.IStageInfo[] {
    return this.datas.stages;
  }

  find_stage(stage_id: string): D.IStageInfo | undefined {
    return this.stages.find((v) => v.id === stage_id);
  }

  readonly bgms: string[] = []


  protected find_in_zip(paths: string[]): I.IZipObject | undefined {
    const len = paths.length;
    for (let i = 0; i < len; i++) {
      const idx = i
      const path = paths[idx];
      const obj = fisrt(this.zips, (z) => z.file(path));
      if (!obj) continue;
      return obj;
    }
  }

  /**
   * TODO
   *
   * @template C 
   * @param {string} path
   * @param {boolean} exact 准确匹配
   * @return {Promise<C>}
   * @memberof LF2
   */
  @PIO
  async import_json<C = any>(path: string, exact: boolean = true): Promise<[C, I.HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.json<C>(), zip_obj.name];
    const ret = await I.Ditto.Importer.import_as_json<C>(paths);
    return ret;
  }

  /**
   * 加载资源
   *
   * @param {string} path 资源路径
   * @param {boolean} exact 准确匹配
   * @return {Promise<[I.BlobUrl, I.HitUrl]>}
   * @memberof LF2
   */
  @PIO async import_resource(path: string, exact: boolean): Promise<[I.BlobUrl, I.HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.blob_url(), zip_obj.name];
    return I.Ditto.Importer.import_as_blob_url(paths);
  }

  @PIO async import_array_buffer(path: string, exact: boolean): Promise<[ArrayBuffer, I.HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.array_buffer(), zip_obj.name];
    return I.Ditto.Importer.import_as_array_buffer(paths);
  }

  constructor(dev = false) {
    this.dev = dev;
    make_debugging(this)
    this.debug(`constructor`)
    this.datas = new DatMgr(this);
    this.sounds = new I.Ditto.Sounds(this);
    this.images = new I.Ditto.ImageMgr(this);
    this.keyboard = new I.Ditto.Keyboard(this);
    this.keyboard.callback.add(this);
    this.pointings = new I.Ditto.Pointings();
    I.Ditto.Cache.forget(LF2.DATA_TYPE, LF2.DATA_VERSION).catch(e => { })
    I.Ditto.Cache.forget(PlayerInfo.DATA_TYPE, PlayerInfo.DATA_VERSION).catch(e => { })
    this.world = new World(this);
    this.world.start_update();
    this.world.start_render();
    LF2.instances.push(this)
    this.pointings.callback.add(new I.Ditto.UIInputHandle(this));

    const ui_stack = new UI.UIStack(this, 0);
    ui_stack.callback.add({
      on_set: (curr, prev) => this.callbacks.emit("on_ui_changed")(curr, prev),
      on_push: (curr, prev) => this.callbacks.emit("on_ui_changed")(curr, prev),
      on_pop: (curr, poppeds) => this.callbacks.emit("on_ui_changed")(curr, poppeds[0]),
    })
    this.ui_stacks.push(ui_stack)
    this._i18n.add({
      '': {
        VERSION_NAME: LF2.VERSION_NAME,
        DATA_LIST: LF2.PREL_ZIPS.map(v => typeof v === 'string' ? v : v.name)
      }
    })
  }

  random_entity_info(e: Entity) {
    const { left: l, right: r, near: n, far: f } = this.world;
    e.id = new_id();
    e.facing = this.mt.range(0, 100) % 2 ? -1 : 1;
    e.position.set(
      this.mt.range(l, r),
      550,
      this.mt.range(f, n),
    )
    return e;
  }

  private _curr_key_list: string = "";
  private readonly _CheatType_map = new Map<D.CheatType, D.Defines.ICheatInfo>([
    cheat_info_pair(D.CheatType.LF2_NET),
    cheat_info_pair(D.CheatType.HERO_FT),
    cheat_info_pair(D.CheatType.GIM_INK),
  ]);
  private readonly _CheatType_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat(name: string | D.CheatType) {
    return !!this._CheatType_enable_map.get("" + name);
  }
  toggle_cheat_enabled(cheat_name: string | D.CheatType) {
    const cheat_info = this._CheatType_map.get(cheat_name as D.CheatType);
    if (!cheat_info) return;
    const { sound: s } = cheat_info;
    const sound_id = this._cheat_sound_id_map.get(cheat_name);
    if (sound_id) this.sounds.stop(sound_id);
    this.sounds
      .play_with_load(s)
      .then((v) => this._cheat_sound_id_map.set(cheat_name, v));
    const enabled = !this._CheatType_enable_map.get(cheat_name);
    this._CheatType_enable_map.set(cheat_name, enabled);
    this.callbacks.emit("on_cheat_changed")(cheat_name, enabled);
    this._curr_key_list = "";
  }
  cmds: (CMD | D.CheatType | string)[] = [];
  events: UI.LF2KeyEvent[] = [];
  broadcasts: string[] = [];
  on_key_down(e: I.IKeyEvent) {
    this.debug('on_key_down', e)
    const key_code = e.key.toLowerCase();
    if (key_code in CMD_NAMES) {
      this.cmds.push(key_code as CMD);
      e.interrupt();
    }

    this._curr_key_list += key_code;
    let match = false;
    for (const [cheat_name, { keys: k }] of this._CheatType_map) {
      if (k.startsWith(this._curr_key_list)) match = true;
      if (k !== this._curr_key_list) continue;
      this.cmds.push(cheat_name)
    }

    if (!match) this._curr_key_list = "";
    if (e.times === 0) {
      for (const key_name of KEY_NAME_LIST) {
        for (const [pid, player] of this.players) {
          if (!player.local) continue;
          if (player.keys[key_name] !== key_code) continue
          this.events.push(new UI.LF2KeyEvent(pid, true, key_name, key_code));
        }
      }
    }
  }

  on_key_up(e: I.IKeyEvent) {
    const key_code = e.key?.toLowerCase() ?? "";
    for (const key_name of KEY_NAME_LIST) {
      for (const [pid, player] of this.players) {
        if (!player.local) continue;
        if (player.keys[key_name] !== key_code) continue
        this.events.push(new UI.LF2KeyEvent(pid, false, key_name, key_code))
      }
    }
  }

  private on_loading_file(url: string, progress: number, full_size: number) {
    const txt = `${url}(${get_short_file_size_txt(full_size)})`;
    this.on_loading_content(txt, progress);
  }

  protected async load_zip_from_info_url(info_url: string): Promise<[I.IZip, string]> {
    this._dispose_check('load_zip_from_info_url')
    this.on_loading_content(`${info_url}`, 0);
    const [{ url, md5 }] = await I.Ditto.Importer.import_as_json([info_url]);
    const zip_url = full_zip_url(info_url, url)
    this._dispose_check('load_zip_from_info_url')
    const exists = await I.Ditto.Cache.get(md5);
    this._dispose_check('load_zip_from_info_url')
    let ret: I.IZip | null = null;
    if (exists) {
      ret = await I.Ditto.Zip.read_buf(exists.name, exists.data);
      this._dispose_check('load_zip_from_info_url')
    } else {
      ret = await I.Ditto.Zip.download(zip_url, (progress, full_size) =>
        this.on_loading_file(zip_url, progress, full_size),
      );
      this._dispose_check('load_zip_from_info_url')
      await I.Ditto.Cache.del(info_url, "");
      this._dispose_check('load_zip_from_info_url')
      await I.Ditto.Cache.put({
        name: md5,
        version: LF2.DATA_VERSION,
        type: LF2.DATA_TYPE,
        data: ret.buf,
      });
    }
    this.on_loading_content(`${url}`, 100);
    return [ret, md5];
  }

  async load(...arg1: (I.IZip | string)[]): Promise<void> {
    const is_first = this.zips.length === 0;
    this._dispose_check('load')
    this._loading = true;
    this.callbacks.emit("on_loading_start")();
    this.set_ui("loading");
    if (is_first) {
      const [obj] = await this.import_json("builtin_data/launch/strings.json5")
      this._i18n.add(obj)
    }
    this._dispose_check('load')
    try {
      for (const a of arg1) {
        const [zip, md5] = is_str(a) ? await this.load_zip_from_info_url(a) : [a, 'unknown'];
        await this.load_data(zip, md5);
        await this.load_ui(zip);
      }
      if (is_first) {
        this.set_ui(this.uiinfos[0]!)
        this.callbacks.emit("on_prel_loaded")(this);
      }
      this._playable = true;
      this.callbacks.emit("on_loading_end")();
    } catch (e) {
      this.callbacks.emit("on_loading_failed")(e);
      return await Promise.reject(e);
    } finally {
      this._loading = false;
    }
  }
  static IgnoreDisposed = (e: any) => {
    console.warn(e)
    if (e.is_disposed_error === true) return;
    throw e;
  }
  private _dispose_check = (fn: string) => {
    if (!this._disposed) return;
    const error = Object.assign(
      new Error(`[${LF2.TAG}::${fn}] instance disposed.`),
      { is_disposed_error: true }
    )
    throw error;
  }
  private async load_data(zip: I.IZip, md5: string) {
    this._dispose_check('load_data')

    await zip.file("strings.json")?.json().then(r => this._i18n.add(r))
    this._dispose_check('load_data')
    await zip.file("strings.json5")?.json().then(r => this._i18n.add(r))
    this._dispose_check('load_data')
    this.zips.unshift(zip);
    this.md5s.unshift(md5);
    this.callbacks.emit("on_zips_changed")(this.zips);

    const index_files = zip.file(/\.index\.json5$/g).map(v => v.name)
    await this.datas.load(index_files);

    this._dispose_check('load_data')
    for (const d of this.datas.fighters) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.characters as any)[`add_${name}`] = (num = 1, team = void 0) =>
        this.characters.add(d, num, team);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.characters.add(d, num, team_1);
    }
    for (const d of this.datas.weapons) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.weapons as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.weapons.add(d, num, team_1);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.weapons.add(d, num, team_1);
    }
    for (const d of this.datas.balls) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.entities.add(d, num, team_1);
    }
    for (const d of this.datas.entity) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.entities.add(d, num, team_1);
    }
    if (zip) {
      const bgms = zip.file(/bgm\/.*?/)
      for (const bgm of bgms) {
        this.bgms.some(v => v === bgm.name) ||
          this.bgms.push(bgm.name)
      }
    }
  }
  dispose() {
    this.debug('dispose')
    this._disposed = true;
    this.callbacks.emit("on_dispose")();
    this.callbacks.clear()
    this.world.dispose();
    this.datas.dispose();
    this.sounds.dispose();
    this.keyboard.dispose();
    this.pointings.dispose();
    this._ui_stacks.forEach(u => u.dispose())
    this._ui_stacks.length = 0;
    const i = LF2.instances.indexOf(this);
    if (i >= 0) LF2.instances.splice(i, 1);
  }
  add_puppet(player_id: string, oid: string, team?: string): Entity | undefined {
    const player_info = this.players.get(player_id);
    if (!player_info) { debugger; return; }
    const data = this.datas.fighters.find((v) => v.id === oid);
    if (!data) { debugger; return; }
    let fighter = this.world.puppets.get(player_id);
    if (!fighter) {
      fighter = Factory.inst.create_entity(data.type, this.world, data)
      if (!fighter) return void 0;
      fighter.name = player_info.name;
      fighter.team = team || new_team();
      fighter.ctrl = new LocalController(player_id, fighter);
      fighter.attach();
      this.random_entity_info(fighter);
    } else {
      if (team) fighter.team = team
      fighter.transform(data)
    }
    return fighter;
  }
  del_puppet(player_id: string) {
    this.cmds.push(CMD.DEL_PUPPET, player_id)
  }
  change_bg(bg_info: D.IBgData): void;
  change_bg(bg_id: string): void;
  change_bg(arg: D.IBgData | string | undefined) {
    if (!arg) return;
    if (arg === D.Defines.RANDOM_BG || arg === D.Defines.RANDOM_BG.id || arg === '?')
      arg = this.mt.pick(this.datas.backgrounds.filter(v => v.base.group.some(a => a === D.BackgroundGroup.Regular)))
    if (is_str(arg)) arg = this.datas.find_background(arg);
    if (!arg) return;
    this.world.stage.change_bg(arg);
  }
  remove_bg = () => this.remove_stage();

  change_stage(stage_info: D.IStageInfo): void;
  change_stage(stage_id: string): void;
  change_stage(arg: D.IStageInfo | string | undefined): void {
    if (arg === this.world.stage.data) return;
    if (is_str(arg)) arg = this.stages?.find((v) => v.id === arg);
    if (!arg) return;
    this.world.stage = new Stage(this.world, arg);
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, D.Defines.VOID_STAGE);
  }

  goto_next_stage() {
    const next = this.world.stage.data.next;
    if (!next) return;
    if (next === 'end') {
      this.set_ui("ending_page")
      return;
    }
    const next_stage = this.stages?.find((v) => v.id === next);
    if (!next_stage) {
      this.world.stage.stop_bgm();
      this.sounds.play_with_load(D.Defines.Sounds.StagePass);
      this.callbacks.emit("on_stage_pass")();
    }
    this.change_stage(next_stage || D.Defines.VOID_STAGE);
    this.callbacks.emit("on_enter_next_stage")();
  }

  private _uiinfos_loaded = false;
  private _uiinfos: Readonly<UI.ICookedUIInfo>[] = [];
  get uiinfos(): readonly UI.ICookedUIInfo[] {
    return this._uiinfos;
  }
  get uiinfos_loaded() {
    return this._uiinfos_loaded;
  }

  protected _uiinfo_map = new Map<string, UI.IUIInfo>();
  protected _i18n = new I18N();
  protected _strings = new Map<string, { [x in string]?: string }>()
  protected _strings_list = new Map<string, { [x in string]?: string[] }>();
  string(name: string): string { return this._i18n.string(name) }
  strings(name: string): string[] { return this._i18n.strings(name) }

  protected async load_builtin_ui(): Promise<UI.ICookedUIInfo[]> {
    this._dispose_check('load_builtin_ui')
    const [paths] = await this.import_json<string[]>("builtin_data/launch/_index.json5")
    const ret: UI.ICookedUIInfo[] = []
    for (const path of paths) {
      const cooked_ui_info = await UI.cook_ui_info(this, path);
      this._dispose_check('load_builtin_ui')
      ret.unshift(cooked_ui_info);
    }
    return ret
  }

  async load_ui(zip: I.IZip): Promise<UI.ICookedUIInfo[]> {
    this._dispose_check('load_ui')
    if (this._uiinfos.length) return this._uiinfos;

    this._uiinfos_loaded = false;
    const files = zip.file(/^ui\/.*?\.ui\.json5?$/)
    const ret: UI.ICookedUIInfo[] = []
    if (!this._uiinfos.length) {
      ret.unshift(...await this.load_builtin_ui())
      this._dispose_check('load_ui')
    }
    for (const file of files) {
      const json = await file.json().catch(() => null);
      this._dispose_check('load_ui')
      if (!json || Array.isArray(json)) continue;
      const cooked_ui_info = await UI.cook_ui_info(this, json);
      this._dispose_check('load_ui')
      ret.push(cooked_ui_info);
    }
    if (this._disposed) {
      this._uiinfos.length = 0;
      return this._uiinfos = [];
    } else {
      this._uiinfos_loaded = true;
      this._uiinfos.push(...ret)
      this.callbacks.emit("on_ui_loaded")(ret);
      return ret;
    }
  }

  ui_val_getter = (item: UI.UINode, word: string) => {
    if (word === "mouse_on_me") return '' + item.pointer_over;
    if (word === "pointer_on_me") return '' + item.pointer_over;
    if (word === "paused") return this.world.paused ? 1 : 0;
    return word;
  };

  set_ui(arg: string | UI.ICookedUIInfo | undefined, index: number = 0): void {
    if (index < 0) return;
    if (index >= this._ui_stacks.length)
      index = this._ui_stacks.length
    if (!this._ui_stacks[index])
      this._ui_stacks[index] = new UI.UIStack(this, index)
    this._ui_stacks[index].set(arg)
  }

  pop_ui(inclusive?: boolean, until?: (ui: UI.UINode, index: number, stack: UI.UINode[]) => boolean): void {
    this._ui_stacks[0].pop(inclusive, until)
  }

  pop_ui_safe() {
    const stack_index = this._ui_stacks.length - 1
    const stack = this._ui_stacks[stack_index];
    if (!stack) return;
    if (stack.uis.length > 1 || stack_index > 0)
      stack.pop()
    if (!stack.ui && stack_index > 0)
      this._ui_stacks.splice(stack_index, 1)

  }

  push_ui(arg: string | UI.ICookedUIInfo | undefined, index: number = 0): void {
    if (index < 0) return;
    if (index >= this._ui_stacks.length)
      index = this._ui_stacks.length
    if (!this._ui_stacks[index])
      this._ui_stacks[index] = new UI.UIStack(this, index)
    this._ui_stacks[index].push(arg)
  }

  on_loading_content(content: string, progress: number) {
    this.callbacks.emit("on_loading_content")(content, progress);
  }
  broadcast(message: string): void {
    this.broadcasts.push(message);
    this.callbacks.emit("on_broadcast")(message, this);
  }
  on_component_broadcast(component: UI.UIComponent, message: string) {
    this.callbacks.emit("on_component_broadcast")(component, message);
  }
  switch_difficulty(): void {
    const { difficulty } = this.world;
    const max = this.is_cheat(D.CheatType.LF2_NET) ? 4 : 3;
    this.cmds.push(CMD.SET_DIFFICULTY, '' + (difficulty % max) + 1)
  }
  private update_zip_names() {
    const DATA_LIST = [
      ...LF2._PREL_ZIPS.filter(v => v != 'prel.zip.json').map(v => typeof v === 'string' ? v : v.name),
      ...LF2._DATA_ZIPS.filter(v => v != 'data.zip.json').map(v => typeof v === 'string' ? v : v.name)
    ]
    this._i18n.add({ '': { DATA_LIST } })
    this.callbacks.emit('on_zips_changed')(this)
  }
}

/**
 * 
 * @param {string} info_url 
 * @param {string} url 
 * @returns 
 */
function full_zip_url(info_url: string, zip_url: string) {
  if (
    zip_url.startsWith('http://') ||
    zip_url.startsWith('https://')
  ) return zip_url
  if (
    !info_url.startsWith('http://') &&
    !info_url.startsWith('https://')
  ) return zip_url;
  const s_idx = info_url.indexOf('?');
  const h_idx = info_url.indexOf('#');
  const end = (s_idx > 0 && h_idx > 0) ? Math.min(s_idx, h_idx) : s_idx > 0 ? s_idx : h_idx

  const part_a = end > 0 ? info_url.substring(0, end) : info_url;
  if (!part_a.endsWith('.zip.json')) return zip_url;
  const part_b = end > 0 ? info_url.substring(end) : '';
  const ttt = part_a.lastIndexOf('/')
  return part_a.substring(0, ttt) + '/' + zip_url + part_b;
}

