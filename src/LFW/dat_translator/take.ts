
/**
 * 从object中，取出指定名称的数据，并将其从object中移除;
 *
 * @export
 * @template {{}} [O=any]
 * @template {keyof O} [K=keyof O] object的某个键
 * @param {O} any 某object
 * @param {K} key object的某个键
 * @returns {O[K]} object[key]
 */
export function take<O extends {} = any, K extends keyof O = keyof O>(
  any: O,
  key: K,
): O[K];

/**
 * 从object中，取出指定名称的数据，并将其从object中移除;
 *
 * @export
 * @param {*} any object
 * @param {(string | number | symbol)} key object的某个键
 * @returns {*} object[key]
 */
export function take(any: any, key: string | number | symbol): any;

/**
 * 从object中，取出指定名称的数据，并将其从object中移除;
 *
 * @export
 * @param {*} any object
 * @param {(string | number | symbol)} key object的某个键
 * @returns {*} object[key]
 */
export function take(any: any, key: string | number | symbol): any {
  if (!any) return;
  const ret = any[key];
  delete any[key];
  return ret;
}

export function take_str(
  any: any,
  key: string | number | symbol,
): string | undefined {
  if (typeof any[key] === "string") {
    const ret = any[key];
    delete any[key];
    return ret;
  }
  return void 0;
}