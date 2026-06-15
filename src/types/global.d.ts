interface Window {
  runtime?: {
    WindowMinimise?(): void;
    WindowIsMaximised?(): Promise<boolean>;
    WindowToggleMaximise?(): void;
    Quit?(): void;
    WindowFullscreen?(): void;
    WindowUnfullscreen?(): void;
    WindowIsFullscreen?(): Promise<boolean>;
  }
}
declare const VERSION_NAME: string;
declare const BUILD_TIME: string;
declare type FieldKeysRow<T extends object> = (keyof T | (keyof T)[]);
