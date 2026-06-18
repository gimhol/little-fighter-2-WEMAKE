import { type IXMLElement } from "../../../src/LF2/ditto/xml/IXMLElement";
import { ToolXMLElement } from "./ToolXMLElement";

/**
 * 轻量 XML 工厂，用于 LF2 工具
 *
 * 实现 IXML 接口，不依赖浏览器 DOM 或外部库
 */
interface IToolXML {
  parse(text: string): IXMLElement;
  create(tag: string): IXMLElement;
}

export class ToolXML implements IToolXML {
  /**
   * 解析 XML 文本为元素树
   */
  parse(text: string): ToolXMLElement {
    const cleaned = this._stripComments(text);
    const root = this._parseElement(cleaned.trim(), 0);
    if (!root) throw new Error(`No root element found in XML`);
    return root.el;
  }

  /**
   * 创建一个新的空元素
   */
  create(tag: string): ToolXMLElement {
    return new ToolXMLElement(tag);
  }

  // ─── 解析 ──────────────────────────────────────────

  private _stripComments(xml: string): string {
    return xml.replace(/<!--[\s\S]*?-->/g, '');
  }

  /**
   * 从 pos 开始尝试解析一个 XML 元素，返回元素和结束位置。
   * 遇到闭合标签或文本节点返回 null。
   */
  private _parseElement(
    xml: string,
    pos: number,
  ): { el: ToolXMLElement; end: number } | null {
    // 跳过空白
    pos = this._skipWs(xml, pos);
    if (pos >= xml.length) return null;

    // 检查是否为闭合标签
    if (xml[pos] === '<') {
      // 跳过 <
      if (pos + 1 < xml.length && xml[pos + 1] === '/') return null;
    } else {
      // 文本节点
      return null;
    }

    // 解析标签名
    pos++; // 跳过 <
    const tagNameEnd = this._findTagNameEnd(xml, pos);
    if (tagNameEnd <= pos) return null;
    const tagName = xml.slice(pos, tagNameEnd);
    pos = tagNameEnd;

    // 解析属性
    const el = new ToolXMLElement(tagName);

    while (pos < xml.length) {
      pos = this._skipWs(xml, pos);
      if (pos >= xml.length) break;

      const ch = xml[pos];

      // 自闭合标签
      if (ch === '/' && pos + 1 < xml.length && xml[pos + 1] === '>') {
        pos += 2;
        return { el, end: pos };
      }

      // 标签结束
      if (ch === '>') {
        pos++; // 跳过 >
        break;
      }

      // 属性
      const attr = this._parseAttr(xml, pos);
      if (!attr) break;
      el.set_attr(attr.name, attr.value);
      pos = attr.end;
    }

    // 解析子元素
    while (pos < xml.length) {
      pos = this._skipWs(xml, pos);
      if (pos >= xml.length) break;

      if (xml[pos] === '<') {
        // 闭合标签 </tag>
        if (pos + 1 < xml.length && xml[pos + 1] === '/') {
          const closeEnd = this._parseCloseTag(xml, pos, tagName);
          if (closeEnd) {
            pos = closeEnd;
            return { el, end: pos };
          }
          // 标签名不匹配 — 跳过
          const gt = xml.indexOf('>', pos);
          if (gt < 0) break;
          pos = gt + 1;
          continue;
        }

        // 子元素
        const child = this._parseElement(xml, pos);
        if (child) {
          el._addChild(child.el);
          pos = child.end;
          continue;
        } else {
          // 无法解析，跳过
          const gt = xml.indexOf('>', pos);
          if (gt < 0) break;
          pos = gt + 1;
          continue;
        }
      } else {
        // 文本
        const textEnd = xml.indexOf('<', pos);
        if (textEnd < 0) break;
        const text = xml.slice(pos, textEnd).trim();
        if (text) {
          el._appendText(this._unescape(text));
        }
        pos = textEnd;
      }
    }

    return { el, end: pos };
  }

  private _parseAttr(
    xml: string,
    pos: number,
  ): { name: string; value: string; end: number } | null {
    pos = this._skipWs(xml, pos);
    if (pos >= xml.length) return null;

    // 属性名
    const nameEnd = this._findAttrNameEnd(xml, pos);
    if (nameEnd <= pos) return null;
    const name = xml.slice(pos, nameEnd);
    pos = nameEnd;

    // =
    pos = this._skipWs(xml, pos);
    if (pos >= xml.length || xml[pos] !== '=') return null;
    pos++; // 跳过 =
    pos = this._skipWs(xml, pos);
    if (pos >= xml.length) return null;

    // 引号值
    const quote = xml[pos];
    if (quote !== '"' && quote !== "'") return null;
    pos++; // 跳过引号
    const valEnd = xml.indexOf(quote, pos);
    if (valEnd < 0) return null;
    const value = this._unescape(xml.slice(pos, valEnd));
    pos = valEnd + 1; // 跳过结束引号

    return { name, value, end: pos };
  }

  private _parseCloseTag(xml: string, pos: number, expectedTag: string): number | null {
    // pos 在 < 上
    if (xml[pos] !== '<') return null;
    if (pos + 1 >= xml.length || xml[pos + 1] !== '/') return null;
    pos += 2; // 跳过 </
    pos = this._skipWs(xml, pos);
    const tagEnd = this._findTagNameEnd(xml, pos);
    if (tagEnd <= pos) return null;
    const tagName = xml.slice(pos, tagEnd);
    if (tagName !== expectedTag) return null;
    pos = tagEnd;
    pos = this._skipWs(xml, pos);
    if (pos >= xml.length || xml[pos] !== '>') return null;
    return pos + 1; // 跳过 >
  }

  private _findTagNameEnd(xml: string, pos: number): number {
    let i = pos;
    while (i < xml.length && /[a-zA-Z0-9_:.-]/.test(xml[i])) i++;
    return i;
  }

  private _findAttrNameEnd(xml: string, pos: number): number {
    let i = pos;
    while (i < xml.length && /[a-zA-Z0-9_:.-]/.test(xml[i])) i++;
    return i;
  }

  private _skipWs(xml: string, pos: number): number {
    while (pos < xml.length && /\s/.test(xml[pos])) pos++;
    return pos;
  }

  private _unescape(s: string): string {
    return s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }
}

export const XML = new ToolXML();
