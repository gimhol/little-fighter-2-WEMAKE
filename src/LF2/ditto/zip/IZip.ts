import { type IZipObject } from "./IZipObject";

export interface IZip {
  readonly buf: Uint8Array;
  readonly files: { [key in string]?: IZipObject }
  readonly name: string
  file(path: string): IZipObject | null;
  file(path: RegExp): IZipObject[];
  file(path: string | RegExp): IZipObject | null | IZipObject[];
  set(path: string, data: string | Uint8Array | ArrayBuffer | Blob): void;
  blob(): Promise<Blob>;
}
