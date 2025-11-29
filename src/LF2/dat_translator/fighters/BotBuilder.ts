import { IBotData, IEntityData, StateEnum } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { IBotDataSet } from "../../defines/IBotDataSet";
import { find } from "../../utils/container_help/find";
import { traversal } from "../../utils/container_help/traversal";

export class BotBuilder {
  static builders: BotBuilder[] = []
  static make(data: IEntityData) {
    const ret = new BotBuilder(data)
    this.builders.push(ret);
    return ret;
  }
  static check_all(): void {
    this.builders.forEach(b => b.check())
  }

  readonly entity: IEntityData;
  get bot(): IBotData {
    let ret = this.entity.base.bot
    if (!ret) ret = this.entity.base.bot = { id: this.entity.id, actions: {} }
    return ret;
  }
  get frames(): Exclude<IBotData['frames'], undefined> {
    const { bot } = this;
    let frames = bot.frames
    if (!frames) frames = bot.frames = {};
    return frames;
  }
  get states(): Exclude<IBotData['states'], undefined> {
    const { bot } = this;
    let states = bot.states
    if (!states) states = bot.states = {};
    return states;
  }
  protected constructor(entity: IEntityData) {
    this.entity = entity;
  }
  set_actions(...actions: (IBotAction | (() => IBotAction))[]): this {
    const { bot } = this
    for (const action of actions) {
      const a = typeof action === 'function' ? action() : action
      bot.actions[a.action_id] = a;
    }
    return this;
  }
  set_frames(frame_ids: (string | number)[], action_ids: string[]): this {
    const { frames } = this
    frames['' + frame_ids] = action_ids;
    return this;
  }
  set_states(state_ids: (string | number | StateEnum)[], action_ids: string[]): this {
    const { states } = this
    states['' + state_ids] = action_ids;
    return this;
  }
  check() {
    const { states, frames, bot: { actions }, entity } = this;
    const exists_action_ids = new Set<string>(Object.keys(actions));

    traversal(states, (states, action_ids) => {
      const state_ids = ('' + states).split(',')
      for (const state_id of state_ids) {
        const exists = !!find(entity.frames, ([_, frame]) => state_id == '' + frame.state);
        if (!exists) console.warn(`[BotBuilder::check] state "${state_id}" is not used in any frames in entity: "${entity.id}(${entity.base.name})" .`)
      }
      if (!action_ids?.length) {
        console.warn(`[BotBuilder::check] actions of states "${states}" should not be empty, but got ${action_ids}, entity: "${entity.id}(${entity.base.name})".`)
      } else for (const action_id of action_ids) {
        const exists = !!find(actions, ([aid]) => aid == '' + action_id);
        if (!exists) console.warn(`[BotBuilder::check] action "${action_id}" of states "${states}" is not exists in entity: "${entity.id}(${entity.base.name})".`)
      }
      if (exists_action_ids.size > 0) action_ids?.forEach(v => exists_action_ids.delete(v))
    })

    traversal(frames, (frames, action_ids) => {
      const frame_ids = ('' + frames).split(',')

      for (const frame_id of frame_ids) {
        const exists = Object.keys(entity.frames).some(v => v === frame_id);
        if (!exists) console.warn(`[BotBuilder::check] frame "${frame_id}" is not exists in entity: "${entity.id}(${entity.base.name})".`)
      }
      if (!action_ids?.length) {
        console.warn(`[BotBuilder::check] actions of frame "${frames}" should not be empty, but got ${action_ids}, entity: "${entity.id}(${entity.base.name})" .`)
      } else for (const action_id of action_ids) {
        const exists = !!find(actions, ([aid]) => aid == '' + action_id);
        if (!exists) console.warn(`[BotBuilder::check] action "${action_id}" of "${frames}" is not exists in entity: "${entity.id}(${entity.base.name})".`)
      }
      if (exists_action_ids.size > 0) action_ids?.forEach(v => exists_action_ids.delete(v))
    })

    if (exists_action_ids.size > 0) {
      console.warn(`[BotBuilder::check] actions "${Array.from(exists_action_ids)}" is not used in entity: "${entity.id}(${entity.base.name})"`)
    }
  }
  set_dataset(dataset: IBotDataSet): this {
    this.bot.dataset = { ...this.bot.dataset, ...dataset }
    return this;
  }
}
