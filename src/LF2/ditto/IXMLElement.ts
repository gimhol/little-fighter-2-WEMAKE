export interface IXMLElement {
  get tagName(): string;
  get children(): IXMLElement[];
  get attrs(): { name: string; value: string; }[];
  attr(name: string): string | null;
}
