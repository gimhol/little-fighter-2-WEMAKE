import { UIComponent } from './UIComponent';
export interface IFocusBehaviorProps {
  behavior?: string;
}
export class FocusBehavior extends UIComponent<IFocusBehaviorProps> {
  static override readonly TAGS: string[] = ["FocusBehavior"];
  static override readonly PROPS: IPropsMeta<IFocusBehaviorProps> = {
    behavior: String
  }
  static BehaviorMap = new Map<string, [(owner: FocusBehavior) => void, (owner: FocusBehavior) => void]>([
    ['default', [
      (owner: FocusBehavior) => {
        owner.node.color = '#FFFFFF11';
      },
      (owner: FocusBehavior) => {
        owner.node.color = '#FFFFFF00';
      },
    ]]
  ])
  get behavior(): string { return this.props.behavior?.trim().toLowerCase() || 'default' }
  override on_foucs(): void {
    FocusBehavior.BehaviorMap.get(this.behavior)?.[0](this)
  }
  override on_blur(): void {
    FocusBehavior.BehaviorMap.get(this.behavior)?.[1](this)
  }
}
