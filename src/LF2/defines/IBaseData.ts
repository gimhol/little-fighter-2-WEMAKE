export interface IBaseData<I = any> {
  alias_id?: string;
  id: string;
  /**
   * @see {IDataMap}
   */
  type: string | number;
  base: I;
}
