import { ISchema } from "@/LF2/defines";

export function validate_schema<T>(value: any, schema: ISchema<T>, errors: string[] = []): value is T {
  if ((value === void 0 || value === null) && schema.nullable) {
    errors.push(`'${schema.path}' got ${value}`);
    return false;
  }
  switch (schema.type!) {
    case "string":
      if (typeof value !== 'string') {
        errors.push(`'${schema.path}' must be a string, but got ${value}`);
        return false;
      } else if (schema.string) {
        if (schema.string.not_blank && !value.trim()) {
          errors.push(`'${schema.path}' must be a non-blank string, but got ${value}`);
        } if (schema.string.not_empty && !value) {
          errors.push(`'${schema.path}' must be a non-empty string, but got ${value}`);
        }
      }
      break;
    case "number":
    case "integer":
      if (typeof value !== 'number') {
        errors.push(`'${schema.path}' must be a number, but got ${value}`);
        return false;
      }
      if (schema.number) {
        if (schema.number.nan && Number.isNaN(value)) {
          return false;
        }
        if (schema.number.int && !Number.isInteger(value)) errors.push(`'${schema.path}' must be a integer, but got ${value}`);
        if (schema.number.nagetive === true && value >= 0) errors.push(`'${schema.path}' must be a nagetive number, but got ${value}`);
        if (schema.number.positive === true && value <= 0) errors.push(`'${schema.path}' must be a positive number, but got ${value}`);
        if (schema.number.nagetive === false && value < 0) errors.push(`'${schema.path}' must be a non-nagetive number, but got ${value}`);
        if (schema.number.positive === false && value > 0) errors.push(`'${schema.path}' must be a non-positive number, but got ${value}`);
      } else if (Number.isNaN(value)) {
        errors.push(`'${schema.path}' must be a number, but got ${value}`);
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        errors.push(`'${schema.path}' must be a array, but got ${value}`);
        return false;
      } else if (schema.items) {
        for (const item_value of value) {
          validate_schema(item_value, schema.items, errors);
        }
      }
      break;
    case "null":
    case "boolean":
    case "object":
  }
  if (schema.oneof?.some(v => v === value) === false)
    errors.push(`'${schema.path}' should be one of the options: ${JSON.stringify(schema.oneof)}, but got ${value}`);
  return !!errors.length;
}
