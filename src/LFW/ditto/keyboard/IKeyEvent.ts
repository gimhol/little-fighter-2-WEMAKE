export interface IKeyEvent {
  readonly times: number;
  readonly key: string;
  readonly native: any | undefined;
  readonly pressed: boolean;
  readonly device_type: 'keyboard' | 'controller' | 'touch';
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  preventDefault(): void;
  interrupt(): void;
}
