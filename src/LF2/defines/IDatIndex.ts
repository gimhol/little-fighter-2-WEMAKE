
export interface IDatIndex {
  id: string;
  type: string;
  file: string;
  hash?: string;
  alias?: string;
  groups?: string[];
}

export interface ITempDatIndex extends IDatIndex {
  src: string
}
