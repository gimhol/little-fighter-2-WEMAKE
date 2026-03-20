import { bdy_kind_name } from "../defines";
import { hit_flag_name } from "../defines/HitFlag";
import { IBdyInfo } from "../defines/IBdyInfo";
const { parse, stringify } = JSON
export class EditBdy<T extends Partial<IBdyInfo>> {
  readonly raw: T;
  static edit<T extends Partial<IBdyInfo>>(bdy: T, fields: Partial<IBdyInfo> = {}): EditBdy<T> {
    return new EditBdy(bdy).edit(fields);
  }
  static clone<T extends Partial<IBdyInfo>>(bdy: T, fields: Partial<IBdyInfo> = {}): EditBdy<T> {
    return new EditBdy(parse(stringify(bdy))).edit(fields);
  }
  constructor(bdy: T) {
    this.raw = bdy;
    this.deco();
  }
  deco(): this {
    if (this.raw.hit_flag !== void 0) {
      this.raw.hit_flag_name = hit_flag_name(this.raw.hit_flag)
    } else {
      delete this.raw.hit_flag;
      delete this.raw.hit_flag_name;
    }
    if (this.raw.kind !== void 0) {
      this.raw.kind_name = bdy_kind_name(this.raw.kind)
    } else {
      delete this.raw.kind;
      delete this.raw.kind_name;
    }
    return this
  }
  edit(fields: Partial<IBdyInfo>) {
    Object.assign(this.raw, fields)
    return this.deco();
  }
  confirm(): T {
    this.deco()
    return this.raw;
  }
}
