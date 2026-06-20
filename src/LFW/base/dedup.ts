const _pending = new Map<string, Promise<any>>();

/**
 * 异步调用去重：相同 key 的并发调用只执行一次，其余等待同一结果。
 *
 * 替代已移除的 @PIO 装饰器，纯函数实现，无外部依赖，跨平台兼容。
 * key 由调用方外部拼接（如 `className.methodName.argsMD5`）。
 *
 * @param key  去重键（调用方负责保证唯一性）
 * @param body 实际执行的异步逻辑
 */
export async function deduped<T>(key: string, body: () => Promise<T>): Promise<T> {
  const existing = _pending.get(key);
  if (existing) return existing;

  const promise = body().finally(() => {
    _pending.delete(key);
  });
  _pending.set(key, promise);
  return promise;
}
