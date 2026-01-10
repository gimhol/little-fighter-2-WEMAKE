import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { Button } from "./Component/Buttons/Button";
import CharacterSelect from "./Component/CharacterSelect";
import Combine from "./Component/Combine";
import { Cross } from "./Component/Icons/Cross";
import { InputRef } from "./Component/Input";
import { InputNumber } from "./Component/Input";
import Select from "./Component/Select";
import Show from "./Component/Show";
import TeamSelect from "./Component/TeamSelect";
import Titled from "./Component/Titled";
import { IWorldDataset } from "./LF2/IWorldDataset";
import { LF2 } from "./LF2/LF2";
import { BotController } from "./LF2/bot/BotController";
import { BaseController } from "./LF2/controller/BaseController";
import { InvalidController } from "./LF2/controller/InvalidController";
import { Defines, Difficulty, IStageInfo, IStagePhaseInfo } from "./LF2/defines";
import { Entity } from "./LF2/entity/Entity";
import { Stage } from "./LF2/stage/Stage";
import { list_writable_properties, TProperty } from "./LF2/utils/list_writable_properties";
import { is_num } from "./LF2/utils/type_check";
import { useLocalNumber, useLocalString } from "./useLocalStorage";
const bot_controllers: { [x in string]?: (e: Entity) => BaseController } = {
  OFF: (e: Entity) => new InvalidController("", e),
  "enemy chaser": (e: Entity) => new BotController("", e),
};

export interface ISettingsRowsProps {
  lf2?: LF2;
  visible?: boolean;
  show_stage_settings?: boolean;
  show_bg_settings?: boolean;
  show_weapon_settings?: boolean;
  show_bot_settings?: boolean;
  show_world_tuning?: boolean;
}

export default function SettingsRows(props: ISettingsRowsProps) {
  const { lf2, visible = true } = props;
  const _stage = lf2?.world.stage;
  const _stage_data = _stage?.data;

  const [stage_list, set_stage_list] = useState<IStageInfo[]>();
  const [bg_id, set_bg_id] = useState(Defines.VOID_BG.id);
  const [stage_id, set_stage_id] = useState(Defines.VOID_STAGE.id);

  const [bgm, set_bgm] = useState<string>(lf2?.sounds.bgm() ?? "");
  const [stage_phase_list, set_stage_phases] = useState<IStagePhaseInfo[]>(
    _stage_data?.phases ?? [],
  );
  const [stage_phase_idx, set_stage_phase_idx] = useState<number>(
    _stage?.phase_idx ?? -1,
  );
  const [difficulty, set_difficulty] = useState<Difficulty>(
    lf2?.world.difficulty ?? Difficulty.Difficult,
  );
  const [world_properties, set_world_properties] = useState<TProperty[]>();
  useEffect(() => {
    set_bgm(lf2?.sounds.bgm() ?? "");
    set_difficulty(lf2?.world.difficulty ?? Difficulty.Difficult);
    set_stage_list(lf2?.stages);
    const on_stage_change = (stage: Stage | undefined) => {
      set_stage_id(stage?.data.id ?? Defines.VOID_STAGE.id);
      set_bg_id(stage?.bg.data.id ?? Defines.VOID_BG.id);
      set_stage_phases(stage?.data.phases ?? []);
      set_stage_phase_idx(stage?.phase_idx ?? -1);
      stage?.callbacks.add({
        on_phase_changed(stage, curr) {
          set_stage_phase_idx(curr ? stage.data.phases.indexOf(curr) : -1);
        },
      });
    };
    on_stage_change(lf2?.world.stage);

    if (!lf2) return;
    const a = [
      lf2.callbacks.add({
        on_loading_end: () => set_stage_list(lf2.stages),
      }),
      lf2.world.callbacks.add({
        on_stage_change,
        on_dataset_change: (k, v) => {
          if (k === 'difficulty') set_difficulty(v as Difficulty)
        }
      }),
    ];

    const ppp = list_writable_properties(lf2.world)
    set_world_properties(ppp);
    return () => a.forEach((b) => b());
  }, [lf2]);

  useEffect(() => {
    if (!lf2) return;
    if (!bgm) lf2.sounds.stop_bgm();
    else lf2.sounds.play_bgm(bgm);
  }, [bgm, lf2]);

  const min_rwn = 1;
  const max_rwn = 100;
  const [rwn, set_rwn] = useLocalNumber<number>("debug_rwn", 10);

  const min_rcn = 1;
  const max_rcn = 100;
  const [rcn, set_rcn] = useLocalNumber<number>("debug_rcn", 10);

  const [weapon_id, set_weapon_id] = useState<string>("");
  const [c_id, set_character_id] = useState<string>("");
  const [team, set_team] = useLocalString<string>("debug_bot_team", "");
  const [bot_ctrl, set_bot_ctrl] = useLocalString<string>("debug_bot_ctrl", "");

  if (!lf2 || visible === false) return <></>;

  const on_click_add_weapon = () => {
    weapon_id ? lf2.weapons.add(weapon_id, rwn) : lf2.weapons.add_random(rwn);
  };
  const on_click_del_weapon = () => {
    lf2.weapons.list().forEach(v => v.hp = v.hp_r = 0)
  };
  const on_click_add_bot = () => {
    (c_id
      ? lf2.characters.add(c_id, rcn, team)
      : lf2.characters.add_random(rcn, team)
    ).forEach((e) => {
      e.name = "bot";
      const controller_creator = bot_controllers[bot_ctrl];
      if (controller_creator) e.ctrl = controller_creator(e);
    });
  };
  const phase_desc = stage_phase_list[stage_phase_idx]?.desc;

  return (
    <>
      <Show.Div
        className={styles.settings_row}
        show={props.show_stage_settings !== false}
      >
        <Titled float_label="关卡">
          <Combine>
            <Select
              value={stage_id}
              onChange={v => lf2.change_stage(v!)}
              items={stage_list}
              parse={(i) => [i.id, i.name]}
            />
            {!stage_phase_list.length ? null : (
              <Select
                title={phase_desc}
                onChange={v => set_stage_phase_idx(v!)}
                value={stage_phase_idx}
                items={stage_phase_list}
                parse={(i, idx) => [
                  idx,
                  [`No.${1 + idx}, bound: ${i.bound}`].filter(Boolean).join(" "),
                ]}
              />
            )}
          </Combine>
        </Titled>
        <Combine>
          <Button onClick={() => lf2.world.stage.kill_all_enemies()}>
            杀死全部敌人
          </Button>
          <Button onClick={() => lf2.world.stage.kill_boss()}>杀死Boss</Button>
          <Button onClick={() => lf2.world.stage.kill_soliders()}>
            杀死士兵
          </Button>
          <Button onClick={() => lf2.world.stage.kill_others()}>杀死其他</Button>
        </Combine>
      </Show.Div>

      <Show.Div className={styles.settings_row} show={props.show_bg_settings !== false}>
        <Titled float_label="背景">
          <Select
            value={bg_id}
            onChange={v => lf2.change_bg(v!)}
            items={lf2.datas.backgrounds}
            parse={(i) => [i.id, i.base.name]}
          />
        </Titled>
        <Titled float_label="难度">
          <Select
            value={difficulty}
            onChange={v => set_difficulty(v!)}
            items={[
              Difficulty.Easy,
              Difficulty.Normal,
              Difficulty.Difficult,
              Difficulty.Crazy,
            ]}
            parse={(i) => [i, Defines.DifficultyLabels[i]]}
          />
        </Titled>
        <Button onClick={(v) => lf2.entities.del_all()}>清场</Button>
      </Show.Div>

      <Show.Div
        className={styles.settings_row}
        show={props.show_weapon_settings !== false}
      >

        <Titled float_label="添加武器">
          <Combine>
            <InputNumber
              placeholder="数量"
              prefix="数量"
              min={min_rwn}
              max={max_rwn}
              step={1}
              value={rwn}
              onChange={(e) => set_rwn(o => e ?? o)}
              onBlur={() =>
                set_rwn((v) =>
                  Math.min(Math.max(Math.floor(v), min_rwn), max_rwn),
                )
              }
            />
            <Select
              value={weapon_id}
              onChange={v => set_weapon_id(v!)}
              items={[0, ...lf2.datas.weapons]}
              parse={i => is_num(i) ? ["", "Random"] : [i.id, i.base.name]} >
            </Select>
            <Button onClick={on_click_add_weapon}>
              添加
            </Button>
            <Button onClick={on_click_del_weapon}>
              移除
            </Button>
          </Combine>
        </Titled>
      </Show.Div>

      <Show.Div
        className={styles.settings_row}
        show={props.show_bot_settings !== false}
      >
        <Titled float_label="添加BOT">
          <Combine>
            <InputNumber
              prefix="数量"
              min={min_rcn}
              max={max_rcn}
              step={1}
              value={rcn}
              onChange={v => set_rcn(o => v ?? o)}
              onBlur={() =>
                set_rcn((v) =>
                  Math.min(Math.max(Math.floor(v), min_rcn), max_rcn),
                )
              }
            />
            <CharacterSelect
              lf2={lf2} value={c_id} onChange={v => set_character_id(v!)} />
            <TeamSelect value={team} onChange={v => set_team(v!)} />
            <Select
              value={bot_ctrl}
              onChange={v => set_bot_ctrl(v!)}
              items={Object.keys(bot_controllers)}
              parse={(i) => [i, i]}
            />
            <Button onClick={on_click_add_bot}>添加</Button>
          </Combine>
        </Titled>
      </Show.Div >

      <Show.Div
        className={styles.settings_row}
        show={props.show_world_tuning !== false}
      >
        {world_properties?.map((v, idx) => {
          const r = world_field_map[v.name as keyof IWorldDataset]
          if (!r) return null
          const { title, desc = title, type } = r
          if (!type) return null;
          let ref: InputRef | null = null;
          return (
            <Titled
              float_label={title}
              title={desc}
              key={v.name + "_" + idx}>
              <Combine>
                <InputNumber
                  precision={type === 'float' ? 2 : 0}
                  ref={(r) => { ref = r }}
                  placeholder={v.name}
                  step={type === 'float' ? 0.01 : type === 'int' ? 1 : 0.01}
                  defaultValue={(lf2.world as any)[v.name]}
                  onChange={(e) =>
                    ((lf2.world as any)[v.name] = e)
                  } />
                <Button
                  title="重置"
                  onClick={(_) => {
                    (lf2.world as any)[v.name] = Number(v.default_value);
                    ref!.value = "" + v.default_value;
                  }}>
                  <Cross />
                </Button>
              </Combine>
            </Titled>
          );
        })}
      </Show.Div>
    </>
  );
}

interface IFieldInfo {
  title: string;
  type: '' | 'int' | 'float' | 'boolean';
  desc?: string;
}
const world_field_map: Record<keyof IWorldDataset, IFieldInfo> = {
  gravity: { title: "重力", desc: "重力", type: 'float' },
  begin_blink_time: { title: "入场闪烁时长", desc: "入场闪烁时长", type: 'int' },
  gone_blink_time: { title: "消失闪烁时长", desc: "消失闪烁时长", type: 'int' },
  lying_blink_time: { title: "起身闪烁时长", desc: "起身闪烁时长", type: 'int' },
  double_click_interval: { title: "双击判定时长", desc: "双击判定时长", type: 'int' },
  key_hit_duration: { title: "按键判定时长", desc: "按键判定时长", type: 'int' },
  itr_shaking: { title: "受伤摇晃时长", desc: "受伤摇晃时长", type: 'int' },
  itr_motionless: { title: "命中停顿时长", desc: "命中停顿时长", type: 'int' },
  hp_healing_ticks: { title: "治疗回血周期", desc: "治疗效果下，每几帧回血一次", type: 'int' },
  hp_healing_value: { title: "治疗回血量", desc: "治疗效果下，每次回血多少", type: 'int' },
  fvx_f: { title: "dvx缩放系数", desc: "fvx_f", type: 'float' },
  fvy_f: { title: "dvy缩放系数", desc: "fvy_f", type: 'float' },
  fvz_f: { title: "dvz缩放系数", desc: "fvz_f", type: 'float' },
  ivy_f: { title: "ivy_f", desc: "ivy_f", type: 'float' },
  ivz_f: { title: "ivz_f", desc: "ivz_f", type: 'float' },
  ivx_f: { title: "ivx_f", desc: "ivx_f", type: 'float' },
  ivy_d: { title: "ivy_d", desc: "默认的攻击Y轴速度", type: 'float' },
  ivx_d: { title: "ivx_d", desc: "默认的攻击X轴速度", type: 'float' },
  cvy_d: { title: "cvy_d", desc: "cvy_d", type: 'float' },
  cvx_d: { title: "cvx_d", desc: "cvx_d", type: 'float' },
  tvx_f: { title: "X轴丢人初速度系数", desc: "tvx_f", type: 'float' },
  tvy_f: { title: "Y轴丢人初速度系数", desc: "tvy_f", type: 'float' },
  tvz_f: { title: "Z轴丢人初速度系数", desc: "tvz_f", type: 'float' },
  vrest_offset: { title: "vrest_offset", desc: "vrest_offset", type: 'int' },
  arest_offset: { title: "arest_offset", desc: "arest_offset", type: 'int' },
  arest_offset_2: { title: "arest_offset_2", desc: "arest_offset_2", type: 'int' },
  frame_wait_offset: { title: "frame_wait_offset", desc: "frame_wait_offset", type: 'int' },
  cha_bc_spd: { title: "cha_bc_spd", desc: "cha_bc_spd", type: 'float' },
  cha_bc_tst_spd_x: { title: "cha_bc_tst_spd_x", desc: "cha_bc_tst_spd_x", type: 'float' },
  cha_bc_tst_spd_y: { title: "cha_bc_tst_spd_y", desc: "cha_bc_tst_spd_y", type: 'float' },
  hp_recoverability: { title: "可回血比例", desc: "可回血比例", type: 'float' },
  hp_r_ticks: { title: "自动回血周期", desc: "每几帧回血一次", type: 'int' },
  hp_r_value: { title: "自动回血量", desc: "每次回血多少", type: 'int' },
  mp_r_ticks: { title: "自动回蓝周期", desc: "每几帧回蓝一次", type: 'int' },
  mp_r_ratio: { title: "mp_r_ratio", desc: "mp_r_ratio", type: 'int' },
  friction_factor: { title: "地速衰减系数", desc: "在地面的物体，速度将每帧乘以此值", type: 'float' },
  friction_x: { title: "地面摩擦X", desc: "在地面的物体，每帧X速度将±=此值,向0靠近", type: 'float' },
  friction_z: { title: "地面摩擦Z", desc: "在地面的物体，每帧Z速度将±=此值,向0靠近", type: 'float' },
  screen_w: { title: "screen_w", desc: "screen_w", type: '' },
  screen_h: { title: "screen_h", desc: "screen_h", type: '' },
  sync_render: { title: "sync_render", desc: "sync_render", type: '' },
  difficulty: { title: "difficulty", desc: "difficulty", type: '' },
  infinity_mp: { title: "infinity_mp", desc: "infinity_mp", type: 'boolean' },
  fall_r_ticks: { title: "fall_r_ticks", desc: "fall_r_ticks", type: 'int' },
  fall_r_value: { title: "fall_r_value", desc: "fall_r_value", type: 'int' },
  defend_r_ticks: { title: "defend_r_ticks", desc: "defend_r_ticks", type: 'int' },
  defend_r_value: { title: "defend_r_value", desc: "defend_r_value", type: 'int' }
}