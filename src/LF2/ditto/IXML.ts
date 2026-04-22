export interface IXMLNode {
  tag: string;
  children(name?: string): IXMLNode[]
  attr(key: string): string | undefined;
  set_attr(key: string, value: string | undefined): this;
}
export interface IXML {
  parse(text: string): IXMLNode
}