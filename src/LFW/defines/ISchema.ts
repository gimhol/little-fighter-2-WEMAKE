
export interface IClazz<C = unknown, A extends any[] = any[]> {
  new(...args: A): C
}
export type ISchemaPropertyTypes =
  'array' | 'boolean' | 'null' | 'number' |
  'integer' | 'object' | 'string' |
  IClazz |
  ArrayConstructor |
  BooleanConstructor |
  StringConstructor |
  NumberConstructor |
  ObjectConstructor;

export type IPropsMeta<T = any> = Record<keyof T, ISchemaMeta | ISchemaPropertyTypes>

export interface ISchemaMeta<T = any> {
  key?: string;
  description?: string;
  type?: ISchema<T>['type'];
  properties?: IPropsMeta<T>;
  items?: ISchemaMeta | ISchemaPropertyTypes;
  path?: string;
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
export interface ISchema<T = any> extends ISchemaMeta<T> {
  type: ISchemaPropertyTypes,
  properties?: Record<keyof T, ISchema>
  items?: ISchema;
}

