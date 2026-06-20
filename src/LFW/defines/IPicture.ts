export interface IPicture<T = any> {
  id: string;
  w: number;
  h: number;
  texture: T;
}