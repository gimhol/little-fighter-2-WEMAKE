export interface NumberProperty extends PropertyDescriptor {
  type: 'number';
  name: string;
  default_value: number;
}
export interface StringProperty extends PropertyDescriptor {
  type: 'string';
  name: string;
  default_value: string;
}
export interface BooleanProperty extends PropertyDescriptor {
  type: 'boolean';
  name: string;
  default_value: boolean;
}
export type TProperty = NumberProperty | StringProperty | BooleanProperty;
export function list_writable_properties(prototype: any, ret: TProperty[] = []) {
  const obj = Object.getOwnPropertyDescriptors(prototype);
  for (const name in obj) {
    if (name.startsWith("_")) continue;
    try {
      const desc = obj[name];
      const { value, writable, enumerable, set, get } = desc;
      let default_value: any;
      if (set && get)
        default_value = get.call(prototype)
      else if (writable && enumerable)
        default_value = value;
      if (typeof default_value === 'number')
        ret.push({ name, type: 'number', default_value, ...desc });
      if (typeof default_value === 'string')
        ret.push({ name, type: 'string', default_value, ...desc });
      if (typeof default_value === 'boolean')
        ret.push({ name, type: 'boolean', default_value, ...desc });
    } catch (e) {
      // ?
    }
  }
  prototype = Object.getPrototypeOf(prototype);
  if (prototype.constructor.name !== "Object") {
    list_writable_properties(prototype, ret);
  }
  return ret;
}