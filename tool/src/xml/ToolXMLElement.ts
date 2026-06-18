import { type Voidable, type IXMLElement } from "../../../src/LF2/ditto/xml/IXMLElement";

const VALUE_TAGS = new Set(['number', 'boolean', 'object', 'array', 'string', 'value']);

/** XML 属性值转义 */
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** XML 文本内容转义 */
function escText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function is_value_child(el: IXMLElement): boolean {
  return VALUE_TAGS.has(el.tagName);
}

/**
 * LF2 工具使用的 XML 元素实现
 *
 * 纯 TypeScript 实现，不依赖浏览器 DOM API
 */
export class ToolXMLElement implements IXMLElement {
  readonly tagName: string;
  private _attrs: { name: string; value: string }[] = [];
  private _children: ToolXMLElement[] = [];
  private _parent: ToolXMLElement | null = null;
  private _text: string = '';

  constructor(tag: string) {
    this.tagName = tag;
  }

  get text(): string { return this._text; }
  get children(): IXMLElement[] { return this._children; }

  get attrs(): { name: string; value: string }[] {
    return this._attrs;
  }

  get parent(): ToolXMLElement | undefined {
    return this._parent ?? undefined;
  }

  attr(name: string): string | undefined {
    return this._attrs.find(a => a.name === name)?.value;
  }

  del_attr(name: string): void {
    const i = this._attrs.findIndex(a => a.name === name);
    if (i >= 0) this._attrs.splice(i, 1);
  }

  str_attr(name: string): string | undefined {
    return this.attr(name);
  }

  num_attr(name: string): number | undefined {
    const v = this.attr(name);
    return v != null ? Number(v) : undefined;
  }

  bool_attr(name: string): boolean | undefined {
    const v = this.attr(name);
    return v != null ? v === 'true' || v === '1' : undefined;
  }

  strs_attr(name: string, sep: string = ','): string[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim());
  }

  nums_attr(name: string, sep: string = ','): number[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => Number(s.trim()));
  }

  strs_attr_soft(name: string, sep: string = ','): Voidable<string>[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim() || void 0);
  }

  nums_attr_soft(name: string, sep: string = ','): Voidable<number>[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim() === '' ? void 0 : Number(s.trim()));
  }

  set_attr(name: string, value: Voidable<string>): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    const existing = this._attrs.find(a => a.name === name);
    if (existing) {
      existing.value = value;
    } else {
      this._attrs.push({ name, value });
    }
  }

  set_str_attr(name: string, value: Voidable<string>): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, String(value));
  }

  set_num_attr(name: string, value: Voidable<number>): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, value.toString());
  }

  set_bool_attr(name: string, value: Voidable<boolean>): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, value ? 'true' : 'false');
  }

  set_strs_attr(name: string, value: Voidable<string | string[]>, sep: string = ','): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).join(sep));
  }

  set_nums_attr(name: string, value: Voidable<number | number[]>, sep: string = ','): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).join(sep));
  }

  set_strs_attr_soft(name: string, value: Voidable<Voidable<string> | Voidable<string>[]>, sep: string = ','): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).map(s => s ?? '').join(sep));
  }

  set_nums_attr_soft(name: string, value: Voidable<Voidable<number> | Voidable<number>[]>, sep: string = ','): void {
    if (value === void 0 || value === null) return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).map(n => n === void 0 ? '' : String(n)).join(sep));
  }

  value(): any {
    const type = this.attr('type') || this.tagName;
    switch (type) {
      case 'number':
        return Number(this._text);
      case 'boolean':
        return this._text === 'true';
      case 'object': {
        const obj: Record<string, any> = {};
        for (const child of this._children) {
          if (is_value_child(child)) {
            const k = child.attr('name');
            if (k) obj[k] = child.value();
          }
        }
        return Object.keys(obj).length ? obj : JSON.parse(this._text);
      }
      case 'array': {
        const arr: any[] = [];
        for (const child of this._children) {
          if (is_value_child(child)) {
            arr.push(child.value());
          }
        }
        return arr;
      }
      default:
        return this._text;
    }
  }

  values(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const attr of this._attrs) {
      obj[attr.name] = attr.value;
    }
    for (const child of this._children) {
      if (!is_value_child(child)) continue;
      const key = child.attr('name');
      if (key) obj[key] = child.value();
    }
    return obj;
  }

  action_str(): string {
    const name = this.attr('action') || this.attr('name');
    if (name) {
      const args = this.attr('args');
      return args ? `${name}(${args})` : `${name}()`;
    }
    return this._text;
  }

  stringify(): string {
    const attrStr = this._attrs
      .map(a => ` ${a.name}="${escAttr(a.value)}"`)
      .join('');
    if (!this._children.length && !this._text) {
      return `<${this.tagName}${attrStr} />`;
    }
    const childrenStr = this._text
      ? escText(this._text)
      : this._children.map(c => c.stringify()).join('');
    return `<${this.tagName}${attrStr}>${childrenStr}</${this.tagName}>`;
  }

  insert(child: ToolXMLElement, index?: number): void {
    child._parent = this;
    if (index === void 0 || index >= this._children.length) {
      this._children.push(child);
    } else {
      this._children.splice(index, 0, child);
    }
  }

  remove(child: ToolXMLElement): boolean {
    const i = this._children.indexOf(child);
    if (i < 0) return false;
    this._children.splice(i, 1);
    child._parent = null;
    return true;
  }

  remove_self(): boolean {
    if (!this._parent) return false;
    return this._parent.remove(this);
  }

  remove_all(): void {
    for (const c of this._children) c._parent = null;
    this._children.length = 0;
  }

  has_attr(name: string): boolean {
    return this._attrs.some(a => a.name === name);
  }

  set_text(text: string): void {
    this._text = text;
  }

  children_by_tag(tag: string): ToolXMLElement[] {
    return this._children.filter(c => c.tagName === tag);
  }

  first_by_tag(tag: string): ToolXMLElement | undefined {
    return this._children.find(c => c.tagName === tag);
  }

  // --- 内部方法供 XML 解析器使用 ---
  _addChild(child: ToolXMLElement): void {
    child._parent = this;
    this._children.push(child);
  }

  _setText(text: string): void {
    this._text = text;
  }

  _appendText(text: string): void {
    this._text += text;
  }
}
