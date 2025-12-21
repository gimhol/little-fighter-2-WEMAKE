export interface IKeyEvent {
  readonly times: number;
  readonly key: string;
  readonly native: any | undefined;
  readonly pressed: boolean;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  preventDefault(): void;
  interrupt(): void;
}
