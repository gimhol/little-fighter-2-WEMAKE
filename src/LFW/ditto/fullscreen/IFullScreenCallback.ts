export interface IFullScreenCallback<T extends any = any> {
  onChange?(target: T | null): void;
}
