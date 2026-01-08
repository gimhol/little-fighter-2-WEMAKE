import { Defines, Difficulty, IEntityData, IStageObjectInfo } from "../defines";
import { TeamEnum } from "../defines/TeamEnum";
import { Entity } from "../entity/Entity";
import { Factory } from "../entity/Factory";
import IEntityCallbacks from "../entity/IEntityCallbacks";
import { is_fighter, is_weapon } from "../entity/type_check";
import { Randoming } from "../helper/Randoming";
import { floor } from "../utils";
import { is_num, is_str } from "../utils/type_check";
import { Stage } from "./Stage";

export default class Item {
  times: number | undefined;
  data?: IEntityData | undefined;
  randoming?: Randoming<Randoming<IEntityData>>;

  get lf2() {
    return this.stage.lf2;
  }
  get world() {
    return this.stage.world;
  }
  readonly info: Readonly<IStageObjectInfo>;
  readonly fighters = new Set<Entity>();
  readonly stage: Stage;
  readonly entity_cb: IEntityCallbacks = {
    on_team_changed: (e) => {
      this.fighters.delete(e); // 被移除
      if (e.team !== this.stage.team) {
        this.entity_cb.on_disposed?.(e)
      }
    },
    on_disposed: (e: Entity): void => {
      e.callbacks.del(this.entity_cb);
      if (this.info.is_soldier) {
        if (this.stage.all_boss_dead()) {
          this.dispose();
        } else if (this.times === void 0 || this.times >= 1) {
          this.spawn();
        } else {
          this.dispose();
        }
      } else if (this.times && this.times >= 1) {
        this.spawn();
      } else {
        this.dispose();
      }

      if (this.stage.all_enemies_dead())
        this.stage.enter_phase(this.stage.phase_idx + 1);

    },
  };
  constructor(stage: Stage, info: IStageObjectInfo) {
    this.stage = stage;
    this.info = info;
    this.times = info.times ? floor(info.times) : void 0;
    const data_list: IEntityData[] = [];
    const randoming_list: Randoming<IEntityData>[] = []
    for (const oid of this.info.id) {
      const data = this.lf2.datas.find(oid);
      if (data) {
        data_list.push(data);
        continue;
      }
      const randoming = this.lf2.datas.get_randoming_by_group(oid)
      if (randoming.src.length) randoming_list.push(randoming);
    }
    if (data_list.length === 1 && !randoming_list.length) {
      this.data = data_list[0]
    } else if (data_list.length && !randoming_list.length) {
      randoming_list.push(new Randoming(data_list, this.lf2))
    } else if (!data_list.length && randoming_list.length) {
      this.randoming = new Randoming(randoming_list, stage.lf2)
    } else if (data_list.length && randoming_list.length) {
      randoming_list.push(new Randoming(data_list, this.lf2))
      this.randoming = new Randoming(randoming_list, stage.lf2)
    } else {
      debugger;
    }
  }

  spawn(
    range_x: number = 100,
    range_y: number = 0,
    range_z: number = 0,
  ): boolean {
    const data = this.data || this.randoming?.take().take();
    if (!data) { debugger; return false; }
    const e = Factory.inst.create_entity(data.type, this.world, data);
    if (!e) { debugger; return false; }
    let { hp, act, facing, x, y, z, reserve, hp_map, mp, mp_map } = this.info;
    if (this.times) this.times--;
    e.ctrl = Factory.inst.create_ctrl(e.data.id, "", e);
    e.dead_gone = true;
    e.reserve = reserve ?? 0;
    e.position.x = this.lf2.random_in(x, x + range_x);
    e.position.z = is_num(z)
      ? this.lf2.random_in(z - range_z, z + range_z)
      : this.lf2.random_in(this.stage.near, this.stage.far);
    if (this.info.join)
      e.dead_join = {
        hp: this.info.join,
        team: this.info.join_team ?? TeamEnum.Team_1
      }

    let _hp = hp_map?.[this.world.difficulty]
    if (!is_num(_hp) && is_num(hp)) {
      switch (this.world.difficulty) {
        case Difficulty.Easy: _hp = floor(hp * 3 / 4); break;
        case Difficulty.Crazy: _hp = floor(hp * 3 / 2); break;
        default: _hp = hp;
      }
    }
    if (is_num(_hp)) e.hp = e.hp_r = e.hp_max = _hp;

    let _mp = mp_map?.[this.world.difficulty]
    if (is_num(mp) && !is_num(_mp)) _mp = mp;
    if (is_num(_mp)) e.mp = e.mp_max = _mp;

    if (is_num(y)) e.position.y = y;

    if (is_fighter(e)) {
      e.name = e.data.base.name;
    } else if (is_weapon(e) && !is_num(y)) {
      e.position.y = 450;
    }
    e.team = this.stage.team;
    e.attach();
    e.callbacks.add(this.entity_cb);
    if (facing) e.facing = facing;
    if (is_str(act)) e.enter_frame({ id: act });
    else if (is_fighter(e)) e.enter_frame({ id: "running_0" })
    else e.enter_frame(Defines.NEXT_FRAME_AUTO);

    if (is_fighter(e)) this.fighters.add(e);
    return true;
  }

  dispose(): void {
    this.stage.items.delete(this);
    for (const e of this.fighters) {
      e.callbacks.del(this.entity_cb);
    }
  }
}
