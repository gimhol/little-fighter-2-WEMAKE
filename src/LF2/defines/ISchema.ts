export interface ISchema<T = any> {
  path?: string;
  key?: string;
  description?: string;
  type: 'array' | 'boolean' | 'null' | 'number' | 'integer' | 'object' | 'string',
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

