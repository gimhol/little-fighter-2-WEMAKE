import { IPropsMeta, IUICallback, LabelButton, UIComponent, UINode } from "@/LF2";
export interface ISettingsLogicProps {
  btn_misc_settings: UINode,
  btn_ctrl_settings: UINode,
  misc_settings_node: UINode,
  ctrl_settings_node: UINode,
}
export class SettingsLogic extends UIComponent<ISettingsLogicProps> {
  static override readonly TAGS: string[] = ["SettingsLogic"];
  static override PROPS: IPropsMeta<ISettingsLogicProps> = {
    btn_misc_settings: { type: UINode, nullable: false },
    btn_ctrl_settings: { type: UINode, nullable: false },
    misc_settings_node: { type: UINode, nullable: false },
    ctrl_settings_node: { type: UINode, nullable: false },
  };
  private a: IUICallback = {
    on_click: () => {
      this.props.btn_misc_settings.search_component(LabelButton)!.checked = true
      this.props.btn_ctrl_settings.search_component(LabelButton)!.checked = false
      this.props.misc_settings_node?.set_visible(true)
      this.props.ctrl_settings_node?.set_visible(false)
    }
  }
  private b: IUICallback = {
    on_click: () => {
      this.props.btn_misc_settings.search_component(LabelButton)!.checked = false
      this.props.btn_ctrl_settings.search_component(LabelButton)!.checked = true
      this.props.misc_settings_node?.set_visible(false)
      this.props.ctrl_settings_node?.set_visible(true)
    }
  }
  override on_start(): void {
    this.props.btn_misc_settings.search_component(LabelButton)!.checked = true
    this.props.btn_ctrl_settings.search_component(LabelButton)!.checked = false
    this.props.btn_misc_settings?.callbacks.add(this.a)
    this.props.btn_ctrl_settings?.callbacks.add(this.b)
  }
  override on_stop(): void {
    this.props.btn_misc_settings?.callbacks.del(this.a)
    this.props.btn_ctrl_settings?.callbacks.del(this.b)
  }
}
