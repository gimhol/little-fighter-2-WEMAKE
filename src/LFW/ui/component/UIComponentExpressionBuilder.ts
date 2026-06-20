export class UIComponentExpressionBuilder {
  readonly parts: [string, string, string, string] = ['', '', '', ''];
  constructor(cls: { TAG: string; }, ...args: any[]) {
    this.parts[2] = cls.TAG;
    this.parts[3] = `(${args})`;
  }
  set_enabled(v: boolean): this {
    this.parts[1] = v ? '' : '!';
    return this;
  }
  set_id(id: string): this {
    this.parts[0] = id.trim() ? `<${id.trim()}>` : '';
    return this;
  }
  toString(): string {
    return this.done();
  }
  done(): string {
    return this.parts.join('');
  }
}
