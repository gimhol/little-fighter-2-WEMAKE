import { IXML } from "@/LF2"
import { XMLElement } from "./XMLElement"

class _XML implements IXML {
  parse(text: string): XMLElement {
    const i = new DOMParser().parseFromString(text, 'text/xml').documentElement
    return new XMLElement(i)
  }
  create(tag: string): XMLElement {
    return new XMLElement(document.createElement(tag))
  }
}
export const XML = new _XML() 