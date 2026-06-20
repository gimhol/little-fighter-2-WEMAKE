export interface IDoubleClickSnapshot<D> {
  data: [D | undefined, D | undefined];
  time: number;
  used: boolean;
  fired: boolean;
  name: string;
}
