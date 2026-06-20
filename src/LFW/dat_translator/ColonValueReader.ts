enum ValueType {
  Str,
  Int,
  Int_Int,
}
/**
 * 从逗号分隔的字符串读取数据
 *
 * @export
 */
export class ColonValueReader<Output = any> {
  private _cells: [keyof Output, ValueType][] = [];
  str(name: keyof Output): this {
    this._cells.push([name, ValueType.Str]);
    return this;
  }
  int(name: keyof Output): this {
    this._cells.push([name, ValueType.Int]);
    return this;
  }
  int_2(name: keyof Output): this {
    this._cells.push([name, ValueType.Int_Int]);
    return this;
  }

  read(text: string, output: Output): [Output | null, string] {
    let rem_txt = text;
    for (const [n, t] of this._cells) {
      switch (t) {
        case ValueType.Str: {
          const reg_str = `${n.toString()}\\s*:\\s*(\\S+)[\\s|\\n]*`;
          const reg_res = new RegExp(reg_str).exec(rem_txt);
          if (!reg_res) break;
          (output as any)[n] = reg_res[1];
          rem_txt =
            rem_txt.slice(0, reg_res.index) + rem_txt.slice(reg_res[0].length);
          break;
        }
        case ValueType.Int: {
          const reg_str = `${n.toString()}\\s*:\\s*(\\d+)[\\s|\\n]*`;
          const reg_res = new RegExp(reg_str).exec(rem_txt);
          if (!reg_res) break;
          (output as any)[n] = Number(reg_res[1]);
          rem_txt =
            rem_txt.slice(0, reg_res.index) + rem_txt.slice(reg_res[0].length);
          break;
        }
        case ValueType.Int_Int: {
          const reg_str = `${n.toString()}\\s*:\\s*(\\d+)\\s*(\\d+)[\\s|\\n]*`;
          const reg_res = new RegExp(reg_str).exec(rem_txt);
          if (!reg_res) break;
          (output as any)[n] = [Number(reg_res[1]), Number(reg_res[2])];
          rem_txt =
            rem_txt.slice(0, reg_res.index) + rem_txt.slice(reg_res[0].length);
          break;
        }
      }
    }
    return [output, rem_txt];
  }
}
