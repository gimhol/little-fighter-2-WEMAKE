import { useEffect, useMemo, useState } from "react";
import type { LF2 } from "../LF2/LF2";
import { EntityGroup } from "../LF2/defines";
import { type IEntityData } from "../LF2/defines/IEntityData";
import { is_str } from "../LF2/utils/type_check";
import Select, { ISelectProps } from "./Select";

export interface CharacterSelectProps
  extends Omit<ISelectProps<IEntityData | "", string>, 'parse'> {
  lf2: LF2;
  show_all?: boolean;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lf2, disabled, show_all = false, placeholder, ..._p } = props;
  const [characters, set_characters] = useState<IEntityData[]>(
    lf2.datas.fighters,
  );

  useEffect(() => {
    set_characters(lf2.datas.fighters);
    return lf2.callbacks.add({
      on_loading_end: () => set_characters(lf2.datas.fighters),
    });
  }, [lf2]);

  const items = useMemo(
    () =>
      show_all
        ? characters
        : characters.filter((v) => {
          const r = v.base.group?.indexOf(EntityGroup.Hidden);
          return r === void 0 || r === -1;
        }),
    [characters, show_all],
  );

  return (
    <Select
      items={["", ...items]}
      disabled={!characters?.length || disabled}
      parse={(i) => is_str(i) ? ["", "Random"] : [i.id, i.base.name]}
      placeholder={items.length ? placeholder : "未加载"}
      {..._p}
    />
  );
}
