export interface IBaseData<I = any> {
  id: string;
  /**
   * @see {IDataMap}
   */
  type: string | number;
  alias_id?: string;
  base: I;
}
