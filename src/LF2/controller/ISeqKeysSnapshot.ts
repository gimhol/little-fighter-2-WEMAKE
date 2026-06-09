export interface ISeqKeysSnapshot<D> {
  idx: number;
  hit: number;
  keys: string;
  data: D;
}
