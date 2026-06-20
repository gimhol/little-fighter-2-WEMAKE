import { useEffect, useMemo, useState } from "react";
import type { LFW } from "../LFW";
import { EntityGroup } from "../LFW/defines";
import type { IEntityData } from "../LFW/defines/IEntityData";
import { is_str } from "../LFW/utils/type_check";
import Select, { type ISelectProps } from "./Select";

export interface CharacterSelectProps
  extends Omit<ISelectProps<IEntityData | "", string>, 'parse'> {
  lfw: LFW;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lfw, disabled, placeholder, ..._p } = props;
  const [characters, set_characters] = useState<IEntityData[]>(
    lfw.datas.fighters,
  );

  useEffect(() => {
    set_characters(lfw.datas.fighters);
    return lfw.callbacks.add({
      on_loading_end: () => set_characters(lfw.datas.fighters),
    });
  }, [lfw]);

  return (
    <Select
      options={["", ...characters]}
      disabled={!characters?.length || disabled}
      parse={(i) => is_str(i) ? ["", "Random"] : [i.id, i.base.name]}
      placeholder={characters.length ? placeholder : "未加载"}
      {..._p}
    />
  );
}
