export interface IComponentInfo {
  id?: string;
  args?: any[];
  name: string;
  enabled?: boolean;
  properties?: { [x in string]?: any };
}
