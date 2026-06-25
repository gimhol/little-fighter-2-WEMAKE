export interface IBaseData<I = any> {
  id: string;
  type: string | number;
  alias_id?: string;
  base: I;
}
