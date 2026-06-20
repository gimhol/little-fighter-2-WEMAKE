
export interface IUIEvent {
  get stopped(): number;
  stop_propagation(): void;
  stop_immediate_propagation(): void;
}

