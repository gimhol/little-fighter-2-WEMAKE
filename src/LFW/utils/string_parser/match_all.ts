
/**
 * 匹配字符串中符合正则表达式的段落，返回匹配结果
 *
 * @export
 * @param {string} text 
 * @param {RegExp} regexp 
 * @returns {RegExpExecArray[]} 
 */
export function match_all(text: string, regexp: RegExp): RegExpExecArray[];

/**
 * 匹配字符串中符合正则表达式的段落，并一一处理
 *
 * @export
 * @param {string} text 
 * @param {RegExp} regexp 
 * @param {(result: RegExpExecArray) => void} func 处理回调，每条符合
 */
export function match_all(
  text: string,
  regexp: RegExp,
  func: (result: RegExpExecArray) => void,
): void;
export function match_all(
  text: string,
  regexp: RegExp,
  func?: (result: RegExpExecArray) => void,
): RegExpExecArray[] | void {
  regexp = new RegExp(regexp, "g");
  let result: RegExpExecArray | null = regexp.exec(text);
  const results: RegExpExecArray[] = [];
  while (result) {
    func ? func(result) : results.push(result);
    result = regexp.exec(text);
  }
  if (!func) return results;
}
