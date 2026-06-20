export interface IComponentInfo {
  id?: string;
  args?: any[];
  name?: string;
  cls: string;
  enabled?: boolean;
  properties?: { [x in string]?: any };
  props?: { [x in string]?: any };
  weight?: number;
}
