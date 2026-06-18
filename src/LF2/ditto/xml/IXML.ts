import { IXMLElement } from "@/LF2";

export interface IXML {
  parse(text: string): IXMLElement;
  create(tag: string): IXMLElement;
}
