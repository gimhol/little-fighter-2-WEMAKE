import { IBdyInfo, bdy_kind_full_name } from "../defines";

export function set_bdy_kind(bdy: Partial<IBdyInfo>, kind: number): Partial<IBdyInfo> & Pick<IBdyInfo, 'kind' | 'kind_name'> {
  const ret = Object.assign(bdy, {
    kind,
    kind_name: bdy_kind_full_name(kind)
  })
  return ret;
}
