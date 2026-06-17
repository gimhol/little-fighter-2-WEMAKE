export interface IXMLElement {
  get tagName(): string;
  get children(): IXMLElement[];
  get attrs(): { name: string; value: string; }[];
  get text(): string;
  attr(name: string): string | undefined;

  value(): any;
  values(): Record<string, any>;
  nums_attr(name: string): number[] | undefined;
  action_str(): string;
}
