import type { IClazz, ISchema } from "../../defines/ISchema";

interface InstanceGetter<T> {
  (raw_value: any, clazz: IClazz<T>, schema: ISchema): T | undefined | null;
}
interface InstanceSetter<T> {
  (value: T | undefined | null, raw_value: any, clazz: IClazz<T>, schema: ISchema): void;
}
export class SchemaValidator {
  protected _get_instance?: InstanceGetter<any>;
  protected _set_instance?: InstanceSetter<any>;

  instance_getter<T>(func: InstanceGetter<T>) {
    this._get_instance = func;
    return this
  }
  instance_setter<T>(func: InstanceSetter<T>) {
    this._set_instance = func;
    return this
  }
  validate<T>(value: any, schema: ISchema<T>, errors: string[] = []): value is T {
    const { type } = schema;
    const r = () => _wrong(value, schema, errors)
    if (value == null || value == void 0) {
      const ret = schema.nullable || schema.type == 'null';
      if (!ret) return r()
      return ret;
    }
    switch (type) {
      case Boolean: case "boolean":
        if (typeof value !== 'boolean') return r();
        break;
      case String: case "string":
        if (typeof value !== 'string') return r();
        if (schema.string?.not_blank && !value.trim()) return r();
        if (schema.string?.not_empty && !value) return r();
        break;
      case Number: case "number": case "integer":
        if (typeof value !== 'number') return r();
        if (!schema.number?.nan && Number.isNaN(value)) return r();
        if (schema.number?.int && !Number.isInteger(value)) return r();
        if (schema.number?.nagetive && value >= 0) return r();
        if (schema.number?.positive && value <= 0) return r();
        if (schema.number?.nagetive == !1 && value < 0) return r();
        if (schema.number?.positive == !1 && value > 0) return r();
        break;
      case "array":
        if (!Array.isArray(value)) return r();
        if (schema.items) {
          for (let i = 0; i < value.length; i++) {
            const prop_value = value[i];
            const prop_schema = schema.items;
            const prop_type = prop_schema?.type
            if (
              typeof prop_type === 'function' &&
              prop_type !== Boolean &&
              prop_type !== String &&
              prop_type !== Number
            ) {
              Object.defineProperty(value, i, {
                configurable: true,
                get: () => this._get_instance?.(prop_value, prop_type, prop_schema),
                set: (v) => this._set_instance?.(v, prop_value, prop_type, prop_schema),
              })
              return true;
            }

            if (Array.isArray(prop_value)) value[i] = [...prop_value];
            else if (prop_value && typeof prop_type === 'object') value[i] = { ...prop_value };
            if (!this.validate(prop_value, schema.items, errors)) {
              return false;
            }
          }
        }
        break;
      case "object":
        if (typeof value !== 'object') return r();
        for (const k in schema.properties) {
          const prop_schema: ISchema<any> = schema.properties[k];
          const prop_value = value[k];
          const prop_type = prop_schema.type
          if (
            typeof prop_type === 'function' &&
            prop_type !== Boolean &&
            prop_type !== String &&
            prop_type !== Number
          ) {
            delete value[k]
            Object.defineProperty(value, k, {
              configurable: true,
              get: () => this._get_instance?.(prop_value, prop_type, prop_schema),
              set: (v) => this._set_instance?.(v, prop_value, prop_type, prop_schema),
            })
            continue;
          }
          if (Array.isArray(prop_value)) {
            value[k] = [...prop_value];
          } else if (prop_value && typeof prop_type === 'object') {
            value[k] = { ...prop_value };
          }
          if (!this.validate(prop_value, prop_schema, errors)) {
            return false
          }
        }
        break;
      default: {
        if (typeof schema.type === 'function') {
          if (typeof value !== 'string') {
            errors.push(`'${schema.path}' must be a string, but got ${value}`);
            return false;
          }
        }
      }
    }
    if (schema.oneof?.some(v => v === value) === false)
      errors.push(`'${schema.path}' should be one of the options: ${JSON.stringify(schema.oneof)}, but got ${value}`);
    return !!errors.length;
  }
}
export function validate_schema<T>(value: unknown, schema: ISchema<T>, errors: string[] = []): value is T {
  const { type } = schema;
  const r = () => _wrong(value, schema, errors)
  if (value == null || value == void 0) {
    const ret = schema.nullable || schema.type == 'null';
    if (!ret) return r()
    return ret;
  }
  switch (type) {
    case Boolean: case "boolean":
      if (typeof value !== 'boolean') return r();
      break;
    case String: case "string":
      if (typeof value !== 'string') return r();
      if (schema.string?.not_blank && !value.trim()) return r();
      if (schema.string?.not_empty && !value) return r();
      break;
    case Number: case "number": case "integer":
      if (typeof value !== 'number') return r();
      if (!schema.number?.nan && Number.isNaN(value)) return r();
      if (schema.number?.int && !Number.isInteger(value)) return r();
      if (schema.number?.nagetive && value >= 0) return r();
      if (schema.number?.positive && value <= 0) return r();
      if (schema.number?.nagetive == !1 && value < 0) return r();
      if (schema.number?.positive == !1 && value > 0) return r();
      break;
    case Array: case "array":
      if (!Array.isArray(value)) return r();
      if (schema.items) {
        for (const item of value) {
          validate_schema(item, schema.items, errors);
        }
      }
      break;

    case "object":
      if (typeof value !== 'object') return false;
      for (const k in schema.properties) {
        const prop_schema: ISchema<any> = schema.properties[k as keyof T];
        const prop_value = (value as T)[k]
        if (!validate_schema(prop_value, prop_schema, errors))
          return false
      }
      return true;
    default: {
      if (typeof schema.type === 'function') {
        if (typeof value !== 'string') {
          errors.push(`'${schema.path}' must be a id, but got ${value}`);
          return false;
        }
      }
    }
  }
  if (schema.oneof?.some(v => v === value) === false)
    errors.push(`'${schema.path}' should be one of the options: ${JSON.stringify(schema.oneof)}, but got ${value}`);
  return !!errors.length;
}

function _wrong<T>(v: unknown, s: ISchema<T>, e: string[]) {
  const _abc = (type: string) => {
    e.push(`type of '${s.path}' must be ${type}, but got ${v}`);
    return false
  }
  switch (s.type) {
    case 'string':
      if (s.string?.not_blank) return _abc('non-blank string')
      if (s.string?.not_empty) return _abc('non-empty string')
      return _abc('string')
    case 'number':
      const type = s.number?.int ? 'integer' : 'number';
      if (s.number?.nagetive) return _abc(`nagetive ${type}`);
      if (s.number?.positive) return _abc(`positive ${type}`);
      if (s.number?.positive == !1) return _abc(`non-positive ${type}`);
      if (s.number?.nagetive == !1) return _abc(`non-nagetive ${type}`);
      return _abc(type)
    default:
      e.push(`type of '${s.path}' must be ${s.type}, but got ${v}`);
  }
  return false
}