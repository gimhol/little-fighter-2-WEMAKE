import type { IXMLElement } from "../../../src/LFW/ditto/xml/IXMLElement";
import { ToolXMLElement } from "./ToolXMLElement";
import { XMLParser } from "fast-xml-parser";

export class ToolXML {
  private _parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    ignoreDeclaration: true,
    removeNSPrefix: true,
    allowBooleanAttributes: true,
    parseTagValue: false,
    trimValues: false,
  });

  parse(text: string): ToolXMLElement {
    const cleaned = text.replace(/<!--[\s\S]*?-->/g, '');
    const data = this._parser.parse(cleaned);
    const rootKey = Object.keys(data)[0];
    if (!rootKey) throw new Error('No root element found in XML');
    return this._convert(data[rootKey], rootKey);
  }

  create(tag: string): ToolXMLElement {
    return new ToolXMLElement(tag);
  }

  from_string(str: string, tag: string = 'string'): ToolXMLElement {
    const el = new ToolXMLElement(tag);
    el.set_attr('type', 'string');
    el.set_attr('value', str);
    return el;
  }

  from_number(num: number, tag: string = 'number'): ToolXMLElement {
    const el = new ToolXMLElement(tag);
    el.set_attr('type', 'number');
    el._setText(String(num));
    return el;
  }

  from_boolean(bool: boolean, tag: string = 'boolean'): ToolXMLElement {
    const el = new ToolXMLElement(tag);
    el.set_attr('type', 'boolean');
    el._setText(bool ? 'true' : 'false');
    return el;
  }

  from_array(arr: any[], tag: string = 'array'): ToolXMLElement {
    const el = new ToolXMLElement(tag);
    el.set_attr('type', 'array');
    for (const item of arr) {
      el._addChild(this._from_value(item));
    }
    return el;
  }

  from_object(obj: any, tag: string = 'object'): ToolXMLElement {
    const el = new ToolXMLElement(tag);
    el.set_attr('type', 'object');
    for (const [key, value] of Object.entries(obj)) {
      const child = this._from_value(value);
      child.set_attr('name', key);
      el._addChild(child);
    }
    return el;
  }

  private _from_value(value: any): ToolXMLElement {
    if (value === null || value === undefined) {
      const el = new ToolXMLElement('string');
      el.set_attr('type', 'string');
      return el;
    }
    if (typeof value === 'string') return this.from_string(value);
    if (typeof value === 'number') return this.from_number(value);
    if (typeof value === 'boolean') return this.from_boolean(value);
    if (Array.isArray(value)) return this.from_array(value);
    return this.from_object(value);
  }

  private _convert(node: any, tag: string): ToolXMLElement {
    const el = new ToolXMLElement(tag);

    if (typeof node === 'string' || typeof node === 'number') {
      el._setText(String(node));
      return el;
    }

    if (node === undefined || node === null) return el;

    // 属性
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@_')) {
        el.set_attr(key.slice(2), String(value));
      }
    }

    // 文本
    if (typeof node['#text'] === 'string') {
      el._setText(node['#text']);
    }

    // 子元素
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@_') || key === '#text') continue;
      const children = Array.isArray(value) ? value : [value];
      for (const child of children) {
        el._addChild(this._convert(child, key));
      }
    }

    return el;
  }
}

export const XML = new ToolXML();
