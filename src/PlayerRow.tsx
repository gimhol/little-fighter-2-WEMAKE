import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { Button } from "./Component/Buttons/Button";
import { ToggleButton } from "./Component/Buttons/ToggleButton";
import CharacterSelect from "./Component/CharacterSelect";
import Combine from "./Component/Combine";
import { Input } from "./Component/Input";
import Select from "./Component/Select";
import TeamSelect from "./Component/TeamSelect";
import Titled from "./Component/Titled";
import { BaseController, Entity, new_team } from "./LF2";
import { DummyEnum } from "./LF2/bot/DummyEnum";
import LocalController from "./LF2/controller/LocalController";
import { GameKey } from "./LF2/defines/GameKey";
import { Factory } from "./LF2/entity/Factory";
import { is_bot_ctrl } from "./LF2/entity/type_check";
import { LF2 } from "./LF2/LF2";
import { PlayerInfo } from "./LF2/PlayerInfo";
import { random_get } from "./LF2/utils/math/random";
import { useCallbacks } from "./pages/network_test/useCallbacks";
const key_names: Record<GameKey, string> = {
  U: "上",
  D: "下",
  L: "左",
  R: "右",
  a: "攻",
  j: "跳",
  d: "防",
};
const key_name_arr = Object.keys(key_names) as GameKey[];
interface Props {
  lf2: LF2;
  visible?: boolean;
  info: PlayerInfo;
  touch_pad_on?: boolean;
  on_click_toggle_touch_pad?(): void;
}
export function PlayerRow(props: Props) {
  const {
    lf2, info, visible = true, touch_pad_on, on_click_toggle_touch_pad,
  } = props;

  const [keys, set_keys] = useState<Record<GameKey, string>>(info.keys);
  const [name, set_name] = useState<string>(info.name);
  const [editing_key, set_editing_key] = useState<GameKey | undefined>();
  const [team, set_team] = useState<string>();
  const [oid, set_oid] = useState<string>();
  const [puppet, set_puppet] = useState<Entity>()
  const [ctrl, set_ctrl] = useState<BaseController>()
  const [key_settings_show, set_key_settings_show] = useState(false);
  const [dummy, set_dummy] = useState<DummyEnum | undefined | "">("")

  useCallbacks(lf2.world.callbacks, {
    on_puppet_add: (pid) => {
      if (pid != info.id) return;
      const p = lf2.world.puppets.get(info.id)
      set_puppet(p)
      set_ctrl(p?.ctrl)
      set_team(p?.team ?? '')
    },
    on_puppet_del: (pid) => {
      if (pid != info.id) return;
      set_puppet(void 0)
      set_ctrl(void 0)
    },
  }, [info])

  useCallbacks(puppet?.callbacks, {
    on_team_changed: (_, value) => set_team(value ?? ''),
    on_ctrl_changed: (value) => set_ctrl(value),
  })
  useEffect(() => {
    const p = lf2.world.puppets.get(info.id)
    set_puppet(p)
    set_team(p?.team ?? '')
    set_ctrl(p?.ctrl)
  }, [lf2, info])
  useEffect(() => {
    if (!puppet) return;
    const ctrl = puppet?.ctrl;
    if (!is_bot_ctrl(ctrl)) return;
    ctrl.dummy = dummy ? dummy : void 0;
  }, [dummy, puppet])

  useCallbacks(info.callbacks, {
    on_key_changed: (name, key) => set_keys((v) => ({ ...v, [name]: key })),
    on_name_changed: (name) => set_name(name)
  })

  useEffect(() => {
    set_keys(info.keys);
    set_name(info.name);
  }, [info, lf2]);

  useEffect(() => {
    if (!editing_key) return;
    const on_keydown = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      const key = e.key?.toLocaleLowerCase();
      if (key && key !== "escape") {
        info.set_key(editing_key, e.key.toLowerCase(), true).save();
      }
      set_editing_key(void 0);
    };
    window.addEventListener("keydown", on_keydown, true);
    return () => window.removeEventListener("keydown", on_keydown, true);
  }, [editing_key, info]);

  if (!lf2 || visible === false) return null;

  const on_click_toggle = () => {
    if (puppet) { lf2.del_puppet(info.id) }
    const oid = random_get(lf2.datas.fighters)?.id;
    if (!oid) { debugger; return; }
    lf2.add_puppet(info.id, oid, team);
  }
  return (
    <div className={styles.settings_row}>
      <Titled float_label={"玩家" + info.id}>
        <Combine>
          <Input
            prefix="名称"
            clearable
            maxLength={50}
            title="enter player name"
            value={name}
            onChange={(e) => info.set_name(e, true)}
            onBlur={(e) => {
              const name = e.target.value.trim() || info.id;
              info.set_name(name, true).save()
              if (puppet) puppet.name = name
            }}
          />
          <CharacterSelect
            lf2={lf2}
            value={oid}
            placeholder="角色"
            onChange={(v) => {
              set_oid(v)
              if (!puppet) return;
              let _oid = oid || random_get(lf2.datas.fighters)?.id
              if (!_oid) return;
              const data = lf2.datas.find_fighter(_oid)
              if (!data) return;
              puppet.transform(data);
            }}
          />
          <TeamSelect
            placeholder="队伍"
            value={team}
            onChange={(v) => {
              set_team(v)
              if (!puppet) return;
              puppet.team = team || new_team();
            }}
          />
          <Button onClick={on_click_toggle}>{!!puppet ? "移除" : "加入"}</Button>
          <ToggleButton value={touch_pad_on} onClick={on_click_toggle_touch_pad}>
            <>触摸板</>
            <>触摸板✓</>
          </ToggleButton>
        </Combine>
      </Titled>
      <Combine>
        <Button onClick={() => set_key_settings_show((v) => !v)}>键位</Button>
        {!key_settings_show
          ? null
          : key_name_arr.map((k) => {
            const on_click = () =>
              set_editing_key((v) => (v === k ? void 0 : k));
            const name = key_names[k];
            const value = editing_key === k ? "编辑中..." : keys[k];
            return (
              <Button key={k} onClick={on_click}>
                {name}:{" "}
                {{
                  ARROWUP: "↑",
                  ARROWDOWN: "↓",
                  ARROWLEFT: "←",
                  ARROWRIGHT: "→",
                  DELETE: "DEL",
                  PAGEDOWN: "P↓",
                  PAGEUP: "P↑",
                }[value.toUpperCase()] || value.toUpperCase()}
              </Button>
            );
          })}
      </Combine>
      {
        !puppet ? null :
          <Combine>
            <Button
              onClick={() => {
                if (is_bot_ctrl(ctrl)) puppet.ctrl = new LocalController(info.id, puppet);
                else puppet.ctrl = Factory.inst.create_ctrl(puppet.data.id, info.id, puppet);
              }}>
              {is_bot_ctrl(ctrl) ? <>Bot√</> : <>Bot</>}
            </Button>
            <Select
              items={["", ...Object.keys(DummyEnum)]}
              parse={(k) => k ? [(DummyEnum as any)[k], k] : ["", "not dummy"]}
              value={dummy}
              onChange={set_dummy}
            />
          </Combine>
      }
    </div>
  );


}
