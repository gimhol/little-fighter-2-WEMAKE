
export interface IReadable {
  readonly name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}
