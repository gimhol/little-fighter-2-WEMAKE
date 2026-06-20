import type { IDatIndex } from "./IDatIndex";
import type { IEntityData } from "./IEntityData";
import type { IEntityInfo } from "./IEntityInfo";
import type { IFrameInfo } from "./IFrameInfo";

export interface IDatContext {
  index: IDatIndex;
  base: IEntityInfo;
  text: string;
  frames: Record<string, IFrameInfo>;
  data: IEntityData | undefined;
}
