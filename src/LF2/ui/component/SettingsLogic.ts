import { SliderHandle, UIComponent } from "@/LF2";

export class SettingsLogic extends UIComponent {
  static override readonly TAGS: string[] = ["SettingsLogic"];
  bgm_toggle: SliderHandle | undefined;
  bgm_volume: SliderHandle | undefined;
  sfx_toggle: SliderHandle | undefined;
  sfx_volume: SliderHandle | undefined;
  team_outline: SliderHandle | undefined;
  render_rate: SliderHandle | undefined;
  main_volume: SliderHandle | undefined;
  override on_start(): void {

    this.main_volume = this.node.search_child("main_volume_row")?.search_component(SliderHandle)
    if (this.main_volume) this.main_volume.factor = this.lf2.sounds.volume()
    this.main_volume?.callbacks.add({
      on_value_changed: (v) => {
        this.lf2.sounds.set_volume(v)
      }
    })


    this.bgm_toggle = this.node.search_child("bgm_toggle_row")?.search_component(SliderHandle)
    if (this.bgm_toggle) this.bgm_toggle.value = this.lf2.sounds.bgm_muted() ? 0 : 1
    this.bgm_toggle?.callbacks.add({
      on_value_changed: (v) => {
        this.lf2.sounds.set_bgm_muted(!v)
      }
    })

    this.bgm_volume = this.node.search_child("bgm_volume_row")?.search_component(SliderHandle)
    if (this.bgm_volume) this.bgm_volume.factor = this.lf2.sounds.bgm_volume()
    this.bgm_volume?.callbacks.add({
      on_value_changed: (_, s) => {
        this.lf2.sounds.set_bgm_volume(s.factor)
      }
    })

    this.sfx_toggle = this.node.search_child("sfx_toggle_row")?.search_component(SliderHandle)
    this.sfx_toggle?.set_value(this.lf2.sounds.sound_muted() ? 0 : 1)
    this.sfx_toggle?.callbacks.add({
      on_value_changed: (v) => {
        this.lf2.sounds.set_sound_muted(!v)
      }
    })

    this.sfx_volume = this.node.search_child("sfx_volume_row")?.search_component(SliderHandle)
    if (this.sfx_volume) this.sfx_volume.factor = this.lf2.sounds.sound_volume()
    this.sfx_volume?.callbacks.add({
      on_value_changed: (_, s) => {
        this.lf2.sounds.set_sound_volume(s.factor)
      }
    })

    this.team_outline = this.node.search_child("team_outline_row")?.search_component(SliderHandle)
    if (this.team_outline) this.team_outline.factor = this.world.teamoutline_enabled

    this.render_rate = this.node.search_child("render_rate_row")?.search_component(SliderHandle)
    if (this.render_rate) this.render_rate.value = 2 - this.world.sync_render;
  }
}