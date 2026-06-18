export type Voidable<T> = T | undefined | null | void;

/**
 * XML 元素接口，抽象平台无关的 XML 操作
 *
 * @export
 * @interface IXMLElement
 */
export interface IXMLElement {
  /** 标签名 */
  get tagName(): string;
  /** 子元素列表 */
  get children(): IXMLElement[];
  /** 属性列表 */
  get attrs(): { name: string; value: string; }[];
  /** 文本内容 */
  get text(): string;

  /**
   * 获取属性原始字符串值
   * @param {string} name - 属性名
   * @return {string | undefined}
   */
  attr(name: string): string | undefined;

  /**
   * 删除属性
   * @param {string} name - 属性名
   */
  del_attr(name: string): void;

  /**
   * 获取字符串属性
   * @param {string} name - 属性名
   * @return {string | undefined}
   */
  str_attr(name: string): string | undefined;

  /**
   * 获取数值属性
   * @param {string} name - 属性名
   * @return {number | undefined}
   */
  num_attr(name: string): number | undefined;

  /**
   * 获取布尔属性（"true" / "1" 为 true）
   * @param {string} name - 属性名
   * @return {boolean | undefined}
   */
  bool_attr(name: string): boolean | undefined;

  /**
   * 获取字符串数组属性，按分隔符拆分为数组
   * @param {string}  name - 属性名
   * @param {string} [sep=","] - 分隔符
   * @return {string[] | undefined}
   */
  strs_attr(name: string, sep?: string): string[] | undefined;

  /**
   * 获取数值数组属性，按分隔符拆分并转为数字
   * @param {string}  name - 属性名
   * @param {string} [sep=","] - 分隔符
   * @return {number[] | undefined}
   */
  nums_attr(name: string, sep?: string): number[] | undefined;

  /**
   * 设置属性原始值，value 为 Voidable 时删除属性
   * @param {string}          name  - 属性名
   * @param {Voidable<string>} value - 值
   */
  set_attr(name: string, value: Voidable<string>): void;

  /**
   * 设置字符串属性，value 为 Voidable 时删除属性
   * @param {string}          name  - 属性名
   * @param {Voidable<string>} value - 值
   */
  set_str_attr(name: string, value: Voidable<string>): void;

  /**
   * 设置数值属性，value 为 Voidable 时删除属性
   * @param {string}          name  - 属性名
   * @param {Voidable<number>} value - 值
   */
  set_num_attr(name: string, value: Voidable<number>): void;

  /**
   * 设置布尔属性（输出 "true" / "false"），value 为 Voidable 时删除属性
   * @param {string}           name  - 属性名
   * @param {Voidable<boolean>} value - 值
   */
  set_bool_attr(name: string, value: Voidable<boolean>): void;

  /**
   * 设置字符串数组属性，按分隔符合并为字符串，value 为 Voidable 时删除属性
   * @param {string}            name  - 属性名
   * @param {Voidable<string[]>} value - 值
   * @param {string}           [sep=","] - 分隔符
   */
  set_strs_attr(name: string, value: Voidable<string[]>, sep?: string): void;

  /**
   * 设置数值数组属性，按分隔符合并为字符串，value 为 Voidable 时删除属性
   * @param {string}            name  - 属性名
   * @param {Voidable<number[]>} value - 值
   * @param {string}           [sep=","] - 分隔符
   */
  set_nums_attr(name: string, value: Voidable<number[]>, sep?: string): void;

  /**
   * 解析元素为类型化值（根据 type 属性或 tagName 自动推断类型）
   */
  value(): any;

  /**
   * 获取所有属性和子元素值的扁平对象
   */
  values(): Record<string, any>;

  /**
   * 解析为动作字符串（"action(args)" 格式）
   */
  action_str(): string;

  /**
   * 序列化为 XML 字符串
   * @return {string}
   */
  stringify(): string;

  /**
   * 插入子元素到指定位置
   * @param {this}  child - 子元素
   * @param {number} [index] - 插入位置，默认末尾
   */
  insert(child: this, index?: number): void;

  /**
   * 移除指定子元素
   * @param {this} child - 子元素
   * @return {boolean} 是否成功移除
   */
  remove(child: this): boolean;

  /**
   * 从父元素中移除自身
   * @return {boolean} 是否成功移除
   */
  remove_self(): boolean;

  /**
   * 移除所有子元素
   */
  remove_all(): void;

  /** 父元素 */
  get parent(): IXMLElement | undefined;

  /**
   * 是否存在指定属性
   * @param {string} name - 属性名
   * @return {boolean}
   */
  has_attr(name: string): boolean;

  /**
   * 设置文本内容
   * @param {string} text - 文本
   */
  set_text(text: string): void;

  /**
   * 按标签名查找子元素列表
   * @param {string} tag - 标签名
   * @return {IXMLElement[]}
   */
  children_by_tag(tag: string): IXMLElement[];

  /**
   * 按标签名查找第一个子元素
   * @param {string} tag - 标签名
   * @return {IXMLElement | undefined}
   */
  first_by_tag(tag: string): IXMLElement | undefined;
}