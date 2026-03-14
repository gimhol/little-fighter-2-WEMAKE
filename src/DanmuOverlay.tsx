import { useEffect, useRef, useState } from "react";
import { get_team_text_color } from "./LF2/base/get_team_text_color";
import { ILf2Callback } from "./LF2/ILf2Callback";
import { LF2 } from "./LF2/LF2";
import { DanmuGameLogic } from "./LF2/ui/component/DanmuGameLogic";
import { IFighterSumInfo } from "./LF2/ui/component/IFighterSumInfo";
import { UIComponent } from "./LF2/ui/component/UIComponent";
import { Times } from "./LF2/utils/Times";
import { floor } from "./LF2/utils";
import { TeamEnum } from "./LF2";
const n = (nn: number) => nn.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')

const t = (name: string, color: string = 'white') => {
  return `<span style="display:inline-block;width:100px;color:${color};">${name}</span>:`
}
export class DanmuOverlayLogic implements ILf2Callback {
  lf2: LF2;
  component: DanmuGameLogic | undefined;
  timer: ReturnType<typeof setInterval> | null = null;
  ele: HTMLDivElement | null = null;
  times = new Times(0, Number.MAX_SAFE_INTEGER);
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.lf2.callbacks.add(this)
  }
  release() {
    this.lf2.callbacks.del(this)
  }
  on_component_broadcast(component: UIComponent, msg: string) {
    if (msg === DanmuGameLogic.BROADCAST_ON_START) {
      this.component = component as DanmuGameLogic
      this.open?.();
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => this.update(), 1000)
      this.update()
    } else if (msg === DanmuGameLogic.BROADCAST_ON_STOP) {
      this.component = component as DanmuGameLogic
      this.close?.();
      if (this.timer) clearInterval(this.timer)
      this.timer = null
    }
  }
  update(): void {
    const { ele, component } = this;
    if (!ele || !component) return;
    ele.innerHTML = ''

    const team_sum = Array.from(component.teams.values()).sort((b, a) => {
      const w = a.wins - b.wins;
      if (w) return w
      const k = a.kills - b.kills;
      if (k) return k
      const d = b.deads - a.deads;
      if (d) return d;
      const s = a.spawns - b.spawns;
      if (s) return s;
      return a.damages - b.damages;
    })

    ele.innerHTML += `Bot "AI"测试中(数据不保留)\n`
    ele.innerHTML += `🎖️=击败数 ☠️=战败数 🐣=出场数 💥=伤害值 ⚔️=KD值\n`
    ele.innerHTML += `🏆=胜局数 😵=败局数\n`
    if (team_sum.length) {
      ele.innerHTML += '------------------------------【队伍】------------------------------\n'
      for (const sum of team_sum) {
        if (
          sum.team !== TeamEnum.Team_1 &&
          sum.team !== TeamEnum.Team_2 &&
          sum.team !== TeamEnum.Team_3 &&
          sum.team !== TeamEnum.Team_4
        ) continue;
        if (!sum.spawns) continue;
        ele.innerHTML += `${t('Team ' + sum.team, get_team_text_color(sum.team))} 🏆|😵|🎖️|☠️|🐣|💥 = ${sum.wins} | ${sum.loses} | ${sum.kills} | ${sum.deads} | ${sum.spawns} | ${sum.damages}\n`
      }
    }

    this.times.add();
    const anchor = floor(this.times.value / 16)
    const remain_times = ((anchor + 1) * 16 - this.times.value - 1)
    switch (anchor % 3) {
      case 0: {
        const fighter_sum = Array.from(component.fighters.values()).sort(sort_by_kd)
        let i = 0
        ele.innerHTML += `------------------------------【角色-KD排名】${remain_times}秒------------------------------\n`
        for (const sum of fighter_sum) {
          const { spawns, kills, deads, damages } = sum;
          if (!spawns) continue;
          const { name } = sum.data.base;
          if (deads) ele.innerHTML += `${t(`${++i}.${name}`)} ⚔️|🐣|💥 = ${n(kills / deads)} | ${spawns} | ${damages}\n`
          else if (kills) ele.innerHTML += `${t(`${++i}.${name}`)} 🎖️|🐣|💥 = ${n(kills)} | ${spawns} | ${damages}\n`
          else ele.innerHTML += `${t(`${++i}.${name}`)} 🐣|💥 = ${spawns} | ${damages}\n`
        }
        break;
      }
      case 1: {
        const fighter_sum = Array.from(component.fighters.values()).sort(sort_by_kills_per_spawn)
        ele.innerHTML += `------------------------------【角色-场均击败排名】${remain_times}秒------------------------------\n`
        let i = 0
        for (const sum of fighter_sum) {
          const { spawns, kills } = sum;
          if (!spawns || !kills) continue;
          const { name } = sum.data.base;
          ele.innerHTML += `${t(`${++i}.${name}`)} 🎖️|🐣 = ${n(kills / spawns)} | ${spawns}\n`
        }
        break;
      }
      case 2: {
        const fighter_sum = Array.from(component.fighters.values()).sort(sort_by_damages_per_spawn)
        ele.innerHTML += `------------------------------【角色-场均伤害排名】${remain_times}秒------------------------------\n`
        let i = 0
        for (const sum of fighter_sum) {
          const { spawns, damages } = sum;
          if (!spawns || !damages) continue;
          const { name } = sum.data.base;
          ele.innerHTML += `${t(`${++i}.${name}`)} 💥|🐣 = ${n(damages / spawns)} | ${spawns}\n`
        }
        break;
      }
    }


  }
  close?(): void;
  open?(): void;
}
function sort_by_kd(a: IFighterSumInfo, b: IFighterSumInfo): number {
  if (a.spawns && !b.spawns) return -1;
  if (!a.spawns && b.spawns) return 1;
  if (a.deads && b.deads) {
    const akd = a.kills / a.deads;
    const bkd = b.kills / b.deads;
    const kd = bkd - akd;
    if (kd) return kd;
  }
  const k = b.kills - a.kills;
  if (k) return k;
  const d = a.deads - b.deads;
  if (d) return d;
  const s = a.spawns - b.spawns;
  if (s) return s;
  return b.damages - a.damages;
}
function sort_by_damages_per_spawn(a: IFighterSumInfo, b: IFighterSumInfo): number {
  if (a.spawns && !b.spawns) return -1;
  if (!a.spawns && b.spawns) return 1;
  return b.damages / b.spawns - a.damages / a.spawns;
}
function sort_by_kills_per_spawn(a: IFighterSumInfo, b: IFighterSumInfo): number {
  if (a.spawns && !b.spawns) return -1;
  if (!a.spawns && b.spawns) return 1;
  return b.kills / b.spawns - a.kills / a.spawns;
}

export function DanmuOverlay(props: { lf2: LF2 | undefined }) {
  const { lf2 } = props;
  const ref_div = useRef<HTMLDivElement | null>(null);
  const [open, set_open] = useState(false);

  useEffect(() => {
    if (!lf2) return;
    const ele = ref_div.current;
    if (!ele) return;
    const logic = new DanmuOverlayLogic(lf2)
    logic.ele = ele;
    logic.open = () => set_open(true);
    logic.close = () => set_open(false);
    return () => logic.release()
  }, [lf2, ref_div])

  return (
    <div ref={ref_div} style={{
      position: 'fixed',
      color: 'white',
      pointerEvents: 'none',
      display: open ? 'block' : 'none',
      whiteSpace: 'pre-wrap',
      left: 30,
      top: 50,
      fontSize: 20,
      opacity: 0.7,
      fontFamily: 'Arial',
      textShadow: `-1px 1px 0 #000, 1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000`
    }} />
  )
}