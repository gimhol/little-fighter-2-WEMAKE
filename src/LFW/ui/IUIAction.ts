import type { UIActionEnum } from "./UIActionEnum";

export interface IUIAction {
  name: UIActionEnum;
  args?: any[];
}
