import type { IMetaInfo } from "../../defines";

export function validate_value_with_meta(value: any, m: Readonly<IMetaInfo>, errors: string[] = []): string[] {
  if (value === null && m.nullable) return errors;
  if (value === void 0 && m.undefable) return errors;
  if (m.type === 'number') {
    if (typeof value !== 'number') { errors.push(`'${m.name}' must be a number, but got ${value}`); return errors; }
    if (m.number) {
      if (m.number.nan && Number.isNaN(value)) return errors;
      if (m.number.int && !Number.isInteger(value)) errors.push(`'${m.name}' must be a integer, but got ${value}`);
      if (m.number.nagetive === true && value >= 0) errors.push(`'${m.name}' must be a nagetive number, but got ${value}`);
      if (m.number.positive === true && value <= 0) errors.push(`'${m.name}' must be a positive number, but got ${value}`);
      if (m.number.nagetive === false && value < 0) errors.push(`'${m.name}' must be a non-nagetive number, but got ${value}`);
      if (m.number.positive === false && value > 0) errors.push(`'${m.name}' must be a non-positive number, but got ${value}`);
    } else if (Number.isNaN(value)) errors.push(`'${m.name}' must be a number, but got ${value}`);
  } else if (m.type === 'string') {
    if (typeof value !== 'string') { errors.push(`'${m.name}' must be a string, but got ${value}`); return errors; };
    if (m.string) {
      if (m.string.not_blank && !value.trim()) errors.push(`'${m.name}' must be a non-blank string, but got ${value}`);
      if (m.string.not_empty && !value) errors.push(`'${m.name}' must be a non-empty string, but got ${value}`);
    }
  }
  if (m.oneof?.some(v => v === value) === false) errors.push(`'${m.name}' should be one of the options: ${JSON.stringify(m.oneof)}, but got ${value}`);
  return errors;
}
