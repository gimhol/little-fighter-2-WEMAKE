import type { IDrinkInfo } from "../defines/IDrinkInfo";
import type { IXMLElement } from "../ditto/xml/IXMLElement";

export function xml_to_drink_info(el: IXMLElement): IDrinkInfo {
  const h = (name: string) => {
    const nums = el.nums_attr_soft(name);
    if (!nums) return {} as { total?: number; value?: number; ticks?: number };
    return { total: nums[0] as number | undefined, value: nums[1] as number | undefined, ticks: nums[2] as number | undefined };
  };
  const hp_h = h("hp_h");
  const hp_r = h("hp_r");
  const mp_h = h("mp_h");
  return {
    hp_h_total: el.num_attr("hp_h_total") ?? hp_h.total,
    hp_h_value: el.num_attr("hp_h_value") ?? hp_h.value,
    hp_h_ticks: el.num_attr("hp_h_ticks") ?? hp_h.ticks,
    hp_r_total: el.num_attr("hp_r_total") ?? hp_r.total,
    hp_r_value: el.num_attr("hp_r_value") ?? hp_r.value,
    hp_r_ticks: el.num_attr("hp_r_ticks") ?? hp_r.ticks,
    mp_h_total: el.num_attr("mp_h_total") ?? mp_h.total,
    mp_h_value: el.num_attr("mp_h_value") ?? mp_h.value,
    mp_h_ticks: el.num_attr("mp_h_ticks") ?? mp_h.ticks,
  };
}
