import type { IMetas, IMetaInfo } from "../../defines";
import { validate_value_with_meta } from "./validate_value_with_meta";

export function validate_object_with_metas<T>(value: T, metas: IMetas<T>, errors: string[] = []): string[] {
  if (typeof value !== 'object') {
    errors.push(`must be an object, but got ${value}`);
    return errors;
  }
  for (const k in metas) {
    const meta: IMetaInfo = metas[k];
    validate_value_with_meta((value as any)[k], meta, errors);
  }
  return errors;
}
