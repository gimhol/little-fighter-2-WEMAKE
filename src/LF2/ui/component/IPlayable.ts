export interface IPlayable {
  readonly __is_playable__: true;
  start(): void;
  stop(): void;
  replay(): void;
}
export function is_playable(v: any): v is IPlayable {
  if (!v) return false;
  const o = v as Partial<IPlayable>;
  return (
    !!o.__is_playable__ &&
    typeof o.start === 'function' &&
    typeof o.stop === 'function' &&
    typeof o.replay === 'function'
  )
}