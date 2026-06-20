import { useEffect, useMemo, useState } from "react";
import type { LFW } from "../LFW";
import { EntityGroup } from "../LFW/defines";
import type { IEntityData } from "../LFW/defines/IEntityData";
import { is_str } from "../LFW/utils/type_check";
import Select, { type ISelectProps } from "./Select";

export interface CharacterSelectProps
  extends Omit<ISelectProps<IEntityData | "", string>, 'parse'> {
  lf2: LFW;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lf2, disabled, placeholder, ..._p } = props;
  const [characters, set_characters] = useState<IEntityData[]>(
    lf2.datas.fighters,
  );

  useEffect(() => {
    set_characters(lf2.datas.fighters);
    return lf2.callbacks.add({
      on_loading_end: () => set_characters(lf2.datas.fighters),
    });
  }, [lf2]);

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
