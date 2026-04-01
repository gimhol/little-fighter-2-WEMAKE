import { UIComponent, UINode } from "../ui";

export interface IClazz<C = unknown, A extends any[] = any[]> {
  new(...args: A): C
}
export interface ISchema<T = any> {
  path?: string;
  key?: string;
  description?: string;
  type: 'array' | 'boolean' | 'null' | 'number' | 'integer' | 'object' | 'string' | IClazz<UIComponent | UINode>,
  properties?: Record<keyof T, ISchema>
  items?: ISchema;
  string?: {
    not_empty?: boolean;
    not_blank?: boolean;
  }
  nullable?: boolean;
  number?: {
    int?: boolean;
    nagetive?: boolean;
    positive?: boolean;
    nan?: boolean;
  },
  dont_validate?: boolean;
  oneof?: (string | number | boolean)[];
}

