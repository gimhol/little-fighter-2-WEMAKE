import json5 from "json5";
import { Callbacks } from "./base";
import type { TKeys } from "./controller/BaseController";
import { Defines, GameKey } from "./defines";
import { CtrlDevice } from "./defines/CtrlDevice";
import { IPurePlayerInfo } from "./defines/IPurePlayerInfo";
import { Ditto } from "./ditto";
import { IPlayerInfoCallback } from "./IPlayerInfoCallback";
import { is_str, Unsafe } from "./utils/type_check";
import { Entity } from "./entity";

export class PlayerInfo {
  static readonly TAG = "PlayerInfo";
  static readonly DATA_TYPE: string = 'PlayerInfo';
  static readonly DATA_VERSION: number = 1;
  readonly callbacks = new Callbacks<IPlayerInfoCallback>();
  readonly local: boolean = true;
  protected _info: IPurePlayerInfo;
  protected _is_com: boolean = false;
  private _fighter: Unsafe<Entity>;
  get id(): string { return this._info.id; }
  get storage_key() { return "player_info_" + this.id; }
  get name(): string { return this._info.name; }
  set name(v: string) { this._info.name = v; }
  get keys(): TKeys { return this._info.keys; }
  get is_com(): boolean { return this._is_com; }
  set is_com(v: boolean) { this._is_com = v; }
  get ctrl(): CtrlDevice { return this._info.ctrl; }
  set ctrl(v: CtrlDevice) { this._info.ctrl = v; }
  get fighter(): Unsafe<Entity> { return this._fighter; }
  set fighter(v: Unsafe<Entity>) { this._fighter = v; }

  constructor(id: string, name: string = id, local: boolean = true) {
    this.local = local
    this._info = { id, name, keys: Defines.get_default_keys(id), version: 0, ctrl: CtrlDevice.Keyboard };
    this.load();
  }
  save(): void {
    if (!this.local) return;
    Ditto.Cache.del(this.storage_key).then(() => {
      Ditto.Cache.put({
        name: this.storage_key,
        type: PlayerInfo.DATA_TYPE,
        version: PlayerInfo.DATA_VERSION,
        data: new TextEncoder().encode(JSON.stringify(this._info)),
      })
    })
  }
  load() {
    if (!this.local) return;
    Ditto.Cache.get(this.storage_key).then((r) => {
      if (!r) return
      const { data } = r
      try {
        const raw_text = new TextDecoder().decode(data);
        const raw_info = json5.parse<Partial<IPurePlayerInfo>>(raw_text);
        const { name, keys, ctrl = this.ctrl, version } = raw_info;
        if (version !== this._info.version) {
          Ditto.warn("[PlayerInfo::load]", "version changed");
          return false;
        }
        if (is_str(name)) this.set_name(name, true)
        if (keys) for (const k in keys) this.set_key(k, keys[k as keyof typeof keys], true)
        if (ctrl !== this.ctrl) this.set_ctrl(ctrl, true)
        return true;
      } catch (e) {
        Ditto.warn("[PlayerInfo::load]", "load failed, ", e);
        return false;
      }
    });
  }
  set_ctrl(ctrl: CtrlDevice, emit: boolean): this {
    const prev = this._info.ctrl;
    if (prev === ctrl) return this;
    this.ctrl = ctrl;
    if (emit) this.callbacks.emit("on_ctrl_changed")(ctrl, prev);
    return this;
  }
  set_name(name: string, emit: boolean): this {
    const prev = this._info.name;
    if (prev === name) return this;
    this.name = name;
    if (emit) this.callbacks.emit("on_name_changed")(name, prev);
    return this;
  }
  set_is_com(is_com: boolean, emit: boolean): this {
    if (this._is_com === is_com) return this;
    this.is_com = is_com;
    if (emit) this.callbacks.emit("on_is_com_changed")(is_com);
    return this;
  }
  set_key(name: string, key: string, emit: boolean): this;
  set_key(name: GameKey, key: string, emit: boolean): this;
  set_key(name: GameKey, key: string, emit: boolean): this {
    if (this._info.keys[name] === key) return this;
    const prev = this._info.keys[name];
    this._info.keys[name] = key.toLowerCase();
    if (emit) this.callbacks.emit("on_key_changed")(name, key.toLowerCase(), prev);
    return this;
  }

  get_key(name: string): string | undefined;
  get_key(name: GameKey): string;
  get_key(name: GameKey): string {
    return this._info.keys[name];
  }
}