export type Voidable<T> = T | undefined | null | void;
export interface IXMLElement {
  get tagName(): string;
  get children(): IXMLElement[];
  get attrs(): { name: string; value: string; }[];
  get text(): string;

  attr(name: string): string | undefined;
  del_attr(name: string): void;

  str_attr(name: string): string | undefined;
  num_attr(name: string): number | undefined;
  bool_attr(name: string): boolean | undefined;
  strs_attr(name: string, sep?: string): string[] | undefined;
  nums_attr(name: string, sep?: string): number[] | undefined;


  set_attr(name: string, value: Voidable<string>): void;
  set_str_attr(name: string, value: Voidable<string>): void;
  set_num_attr(name: string, value: Voidable<number>): void;
  set_bool_attr(name: string, value: Voidable<boolean>): void;
  set_strs_attr(name: string, value: Voidable<string[]>, sep?: string): void;
  set_nums_attr(name: string, value: Voidable<number[]>, sep?: string): void;


  value(): any;
  values(): Record<string, any>;
  action_str(): string;
}
