import { ISoundsCallback, IWorldCallbacks, round_float, SliderHandle, UIComponent } from "@/LF2";
import { SyncRenderEnum } from "@/LF2/defines/SyncRenderEnum";
export class MiscSettingsLogic extends UIComponent {
  static override readonly TAGS: string[] = ["MiscSettingsLogic"];
  bgm_toggle: SliderHandle | undefined;
  bgm_volume: SliderHandle | undefined;
  sfx_toggle: SliderHandle | undefined;
  sfx_volume: SliderHandle | undefined;
  team_outline: SliderHandle | undefined;
  render_rate: SliderHandle | undefined;
  main_volume: SliderHandle | undefined;
  ups: SliderHandle | undefined;
  cbs: ISoundsCallback = {
    on_volume_changed: (volume) => this.main_volume?.set_factor(volume),
    on_bgm_volume_changed: (volume) => this.bgm_volume?.set_factor(volume),
    on_sound_volume_changed: (volume) => this.sfx_volume?.set_factor(volume),
    on_bgm_muted_changed: (muted) => this.bgm_toggle?.set_value(muted ? 0 : 1),
    on_sound_muted_changed: (muted) => this.sfx_toggle?.set_value(muted ? 0 : 1),
  }
  cbs2: IWorldCallbacks = {
    on_dataset_change: (key, value, prev, zworld) => {
      if (key === 'sync_render') this.render_rate?.set_value(2 - value)
    },
  }
  override on_start(): void {
    this.lf2.sounds.callbacks.add(this.cbs)
    this.lf2.world.callbacks.add(this.cbs2)
    this.main_volume = this.node.search_node("main_volume_row")?.search_component(SliderHandle)
    if (this.main_volume) this.main_volume.factor = this.lf2.sounds.volume()
    this.main_volume?.callbacks.add({
      on_value_changed: (_, s) => {
        this.lf2.sounds.set_volume(s.factor)
        this.lf2.sounds.play_preset('cancel')
      }
    })

    this.bgm_toggle = this.node.search_node("bgm_toggle_row")?.search_component(SliderHandle)
    if (this.bgm_toggle) this.bgm_toggle.value = this.lf2.sounds.bgm_muted() ? 0 : 1
    this.bgm_toggle?.callbacks.add({
      on_value_changed: (v) => {
        this.lf2.sounds.set_bgm_muted(!v)
        this.lf2.sounds.play_preset(!v ? 'cancel' : 'ok')
      }
    })

    this.bgm_volume = this.node.search_node("bgm_volume_row")?.search_component(SliderHandle)
    if (this.bgm_volume) this.bgm_volume.factor = this.lf2.sounds.bgm_volume()
    this.bgm_volume?.callbacks.add({
      on_value_changed: (_, s) => {
        this.lf2.sounds.set_bgm_volume(s.factor)
        this.lf2.sounds.play_preset('cancel')
      }
    })

    this.sfx_toggle = this.node.search_node("sfx_toggle_row")?.search_component(SliderHandle)
    this.sfx_toggle?.set_value(this.lf2.sounds.sound_muted() ? 0 : 1)
    this.sfx_toggle?.callbacks.add({
      on_value_changed: (v) => {
        this.lf2.sounds.set_sound_muted(!v)
        this.lf2.sounds.play_preset(!v ? 'cancel' : 'ok')
      }
    })

    this.sfx_volume = this.node.search_node("sfx_volume_row")?.search_component(SliderHandle)
    if (this.sfx_volume) this.sfx_volume.factor = this.lf2.sounds.sound_volume()
    this.sfx_volume?.callbacks.add({
      on_value_changed: (_, s) => {
        this.lf2.sounds.set_sound_volume(s.factor)
        this.lf2.sounds.play_preset('cancel')
      }
    })

    this.team_outline = this.node.search_node("team_outline_row")?.search_component(SliderHandle)
    if (this.team_outline) this.team_outline.factor = this.world.teamoutline_enabled
    this.team_outline?.callbacks.add({
      on_value_changed: (v) => {
        this.world.teamoutline_enabled = v;
        this.lf2.sounds.play_preset(v ? 'ok' : 'cancel')
      }
    })

    const rr = [
      SyncRenderEnum.Half,
      SyncRenderEnum.Sync,
      SyncRenderEnum.FPS_60,
      SyncRenderEnum.FPS_120,
      SyncRenderEnum.Unlimited
    ]
    this.render_rate = this.node.search_node("render_rate_row")?.search_component(SliderHandle)
    this.render_rate?.set_value(rr.indexOf(this.world.sync_render));
    this.render_rate?.callbacks.add({
      on_value_changed: (v) => {
        this.world.sync_render = rr[v];
        this.lf2.sounds.play_preset('ok')
      }
    })

    this.ups = this.node.search_node("ups_row")?.search_component(SliderHandle)
    const ups_arr = [30, 60, 90, 120]
    const atom_time_arr = ups_arr.map(v => round_float(60 / v))
    const double_click_interval_arr = ups_arr.map(v => 30 * v / 60)
    const key_hit_duration_arr = ups_arr.map(v => 10 * v / 60)
    const fvy_f_arr = [-0.5, -0.5, -0.5324, -0.678];
    const wait_offset_arr = [-1, 0, 0, 0.5]
    this.ups?.set_value(ups_arr.indexOf(this.world.UPS));
    this.ups?.callbacks.add({
      on_value_changed: (v) => {
        this.world.UPS = ups_arr[v];
        this.world.atom_time = atom_time_arr[v];
        this.world.wait_offset = wait_offset_arr[v];
        this.world.fvy_f = fvy_f_arr[v];
        this.world.double_click_interval = double_click_interval_arr[v];
        this.world.key_hit_duration = key_hit_duration_arr[v];
        this.lf2.sounds.play_preset('ok')
      }
    })
  }
  override on_stop(): void {
    this.lf2.sounds.callbacks.del(this.cbs)
    this.lf2.world.callbacks.del(this.cbs2)
  }
}
