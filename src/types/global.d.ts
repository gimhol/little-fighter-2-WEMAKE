interface Window {
  runtime?: {
    WindowMinimise?(): void;
    WindowToggleMaximise?(): void;
    Quit?(): void;
  }
}