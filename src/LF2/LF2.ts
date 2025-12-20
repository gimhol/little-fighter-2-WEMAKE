import { Callbacks, get_short_file_size_txt, new_id, new_team, PIO } from "./base";
import { KEY_NAME_LIST, LocalController } from "./controller";
import * as D from "./defines";
import * as I from "./ditto";
import { Entity } from "./entity";
import { IDebugging, make_debugging } from "./entity/make_debugging";
import * as Helper from "./helper";
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
    "" + n,
    {
      keys: D.Defines.CheatKeys[n],
      sound: D.Defines.CheatTypeSounds[n],
    },
  ] as const;

export class LF2 implements I.IKeyboardCallback, IDebugging {
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;
  static readonly TAG = "LF2";
  static readonly instances: LF2[] = []
  lang: string = '';
  dev: boolean = false;
  static readonly DATA_VERSION: number = D.Defines.DATA_VERSION;
  static readonly DATA_TYPE: string = 'DataZip';
  static get instance() { return LF2.instances[0] }
  static get ui() { return LF2.instances[0].ui }
  static get ditto() { return I.Ditto }
  private _disposed: boolean = false;
  readonly callbacks = new Callbacks<ILf2Callback>();
  private _ui_stacks: UI.UIStack[] = [];
  private _loading: boolean = false;
  private _playable: boolean = false;
  private _mt = new MersenneTwister(Date.now())
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

  get slot_fighters() {
    return this.world.slot_fighters;
  }
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

  get_player_character(which: string) {
    return this.slot_fighters.get(which)
  }

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

    const ui_stack = new UI.UIStack(this);
    ui_stack.callback.add({
      on_set: (curr, prev) => this.callbacks.emit("on_ui_changed")(curr, prev),
      on_push: (curr, prev) => this.callbacks.emit("on_ui_changed")(curr, prev),
      on_pop: (curr, poppeds) => this.callbacks.emit("on_ui_changed")(curr, poppeds[0]),
    })
    this.ui_stacks.push(ui_stack)
  }

  random_entity_info(e: Entity) {
    const { left: l, right: r, near: n, far: f } = this.world;
    e.id = new_id();
    e.facing = this.random_in(0, 100) % 2 ? -1 : 1;
    e.position.x = this.random_in(l, r);
    e.position.z = this.random_in(f, n);
    e.position.y = 550;
    return e;
  }

  private _curr_key_list: string = "";
  private readonly _CheatType_map = new Map<string, D.Defines.ICheatInfo>([
    cheat_info_pair(D.CheatType.LF2_NET),
    cheat_info_pair(D.CheatType.HERO_FT),
    cheat_info_pair(D.CheatType.GIM_INK),
  ]);
  private readonly _CheatType_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat_enabled(name: string | D.CheatType) {
    return !!this._CheatType_enable_map.get("" + name);
  }
  toggle_cheat_enabled(cheat_name: string | D.CheatType) {
    const cheat_info = this._CheatType_map.get(cheat_name);
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
  cmds = new Set<string>();
  keydowns = new Set<UI.LF2UIKeyEvent>();
  keyups = new Set<UI.LF2UIKeyEvent>();

  on_key_down(e: I.IKeyEvent) {
    this.debug('on_key_down', e)
    const key_code = e.key.toLowerCase();
    const ctrl_down = this.keyboard.is_key_down('control')
    if (ctrl_down) {

    } else {
      switch (e.key) {
        case 'f1': case 'f2': case 'f3': case 'f4': case 'f5':
        case 'f6': case 'f7': case 'f8': case 'f9': case 'f10':
          e.interrupt()
          this.cmds.add(e.key)
          break;
      }
    }

    this._curr_key_list += key_code;
    let match = false;
    for (const [cheat_name, { keys: k }] of this._CheatType_map) {
      if (k.startsWith(this._curr_key_list)) match = true;
      if (k !== this._curr_key_list) continue;
      this.toggle_cheat_enabled(cheat_name);
    }
    if (!match) this._curr_key_list = "";
    if (e.times === 0) {
      for (const key_name of KEY_NAME_LIST) {
        for (const [player_id, player_info] of this.players) {
          if (player_info.keys[key_name] === key_code) {
            this.keydowns.add(new UI.LF2UIKeyEvent(player_id, key_name, key_code));
          }
        }
      }
    }
  }

  on_key_up(e: I.IKeyEvent) {
    const key_code = e.key?.toLowerCase() ?? "";
    for (const key_name of KEY_NAME_LIST) {
      for (const [player_id, player_info] of this.players) {
        if (player_info.keys[key_name] === key_code) {
          this.keyups.add(new UI.LF2UIKeyEvent(player_id, key_name, key_code))
        }
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
    this._dispose_check('load_zip_from_info_url')
    const exists = await I.Ditto.Cache.get(md5);
    this._dispose_check('load_zip_from_info_url')
    let ret: I.IZip | null = null;
    if (exists) {
      ret = await I.Ditto.Zip.read_buf(exists.name, exists.data);
      this._dispose_check('load_zip_from_info_url')
    } else {
      ret = await I.Ditto.Zip.download(url, (progress, full_size) =>
        this.on_loading_file(url, progress, full_size),
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

  async load(arg1: I.IZip | string): Promise<void> {
    const is_first = this.zips.length === 0;
    this._dispose_check('load')
    this._loading = true;
    this.callbacks.emit("on_loading_start")();
    this.set_ui("loading");

    if (is_first) {
      const [obj] = await this.import_json("builtin_data/launch/strings.json5")
      this.load_strings(obj)
    }

    this._dispose_check('load')
    try {
      const [zip, md5] = is_str(arg1) ? await this.load_zip_from_info_url(arg1) : [arg1, 'unknown'];
      await this.load_data(zip, md5);
      await this.load_ui(zip);
      if (is_first) {
        this.set_ui(this.uiinfos[0]!)
        this.callbacks.emit("on_prel_loaded")();
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

    await zip.file("strings.json")?.json().then(r => this.load_strings(r))
    this._dispose_check('load_data')
    await zip.file("strings.json5")?.json().then(r => this.load_strings(r))
    this._dispose_check('load_data')
    this.zips.unshift(zip);
    this.md5s.unshift(md5);
    this.callbacks.emit("on_zips_changed")(this.zips);

    const index_files = zip.file(/\.index\.json5$/g).map(v => v.name)
    await this.datas.load(index_files);

    this._dispose_check('load_data')
    for (const d of this.datas.characters) {
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
  add_player_character(player_id: string, character_id: string) {
    const player_info = this.players.get(player_id);
    if (!player_info) { debugger; return; }

    const data = this.datas.characters.find((v) => v.id === character_id);
    if (!data) { debugger; return; }
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let old_facing: D.TFace = 1;
    let old_frame_id: string = D.Builtin_FrameId.Auto;
    const old = this.slot_fighters.get(player_id);
    if (old) {
      x = old.position.x;
      y = old.position.y;
      z = old.position.z;
      vx = old.velocity_0.x;
      vy = old.velocity_0.y;
      vz = old.velocity_0.z;
      old_facing = old.facing;
      old_frame_id = old.frame.id;
      this.world.del_entity(old);
    }

    const character = new Entity(this.world, data);
    character.id = old?.id ?? new_id();
    character.position.x = x;
    character.position.y = y;
    character.position.z = z;
    character.velocity_0.x = vx;
    character.velocity_0.y = vy;
    character.velocity_0.z = vz;
    character.facing = old_facing;
    character.name = player_info.name;
    character.team = player_info.team ?? new_team();
    character.enter_frame({ id: old_frame_id });
    if (!old) {
      this.random_entity_info(character);
    }
    character.ctrl = new LocalController(
      player_id,
      character,
      player_info?.keys,
    );
    character.attach();
    return character;
  }
  del_player_character(player_id: string) {
    const old = this.slot_fighters.get(player_id);
    if (old) this.world.del_entity(old);
  }
  change_bg(bg_info: D.IBgData): void;
  change_bg(bg_id: string): void;
  change_bg(arg: D.IBgData | string | undefined) {
    if (!arg) return;
    if (arg === D.Defines.RANDOM_BG || arg === D.Defines.RANDOM_BG.id || arg === '?')
      arg = this.random_get(this.datas.backgrounds.filter(v => v.base.group.some(a => a === D.BackgroundGroup.Regular)))
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
  protected _strings = new Map<string, { [x in string]?: string }>()
  string(name: string): string {
    return (
      this._strings.get(this.lang)?.[name] ??
      this._strings.get("")?.[name] ?? name
    )
  }
  load_strings(strings: any) {
    const collection_pointers: [string, string][] = []
    for (const key in strings) {
      const collection = strings[key];
      if (typeof collection === 'string' && collection !== key)
        collection_pointers.push([key, collection]);
      else if (typeof collection === 'object') {
        for (const key in collection) {
          const v = collection[key]
          if (Array.isArray(v))
            collection[key] = v.join('\n')
        }
        const prev = this._strings.get(key)
        if (prev) this._strings.set(key, { ...collection, ...prev });
        else this._strings.set(key, collection)
      }
    }
    for (let i = 0; i < collection_pointers.length; i++) {
      const [a, b] = collection_pointers[i];
      const collection = this._strings.get(b)
      if (!collection) continue;
      this._strings.set(a, { ...collection });
      collection_pointers.splice(i, 1);
      --i
    }
  }

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

  set_ui(arg: string | UI.ICookedUIInfo | undefined): void {
    this._ui_stacks[0].set(arg)
  }

  pop_ui(inclusive?: boolean, until?: (ui: UI.UINode, index: number, stack: UI.UINode[]) => boolean): void {
    this._ui_stacks[0].pop(inclusive, until)
  }

  pop_ui_safe() {
    const stack = this._ui_stacks[0];
    if (!stack || stack.uis.length < 2) return;
    stack.pop()
  }

  push_ui(arg: string | UI.ICookedUIInfo | undefined): void {
    this._ui_stacks[0].push(arg)
  }

  on_loading_content(content: string, progress: number) {
    this.callbacks.emit("on_loading_content")(content, progress);
  }

  broadcast(message: string): void {
    this.callbacks.emit("on_broadcast")(message);
  }
  on_component_broadcast(component: UI.UIComponent, message: string) {
    this.callbacks.emit("on_component_broadcast")(component, message);
  }
  switch_difficulty(): void {
    const { difficulty } = this.world;
    const max = this.is_cheat_enabled(D.CheatType.LF2_NET) ? 4 : 3;
    const next = (difficulty % max) + 1;
    this.world.difficulty = next;
  }

  random_get<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a[this.random_in(0, a.length)]
  }
  random_take<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a.splice(this.random_in(0, a.length), 1)[0]
  }
  random_in(l: number, r: number) {
    return this._mt.in_range(l, r);
  }
  random_int() {
    return this._mt.int();
  }
}