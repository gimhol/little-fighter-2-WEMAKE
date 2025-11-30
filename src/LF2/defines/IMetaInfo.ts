export interface IMetaInfo {
  name?: string;
  desc?: string;
  type: 'string' | 'number' | 'boolean' | 'array',
  items?: IMetaInfo;
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
export type IMetas<T> = Readonly<Record<keyof T, Readonly<IMetaInfo>>>