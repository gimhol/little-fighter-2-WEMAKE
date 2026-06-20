/**
 * 纯 ES 环境下的 Web API 类型补充声明
 * 不使用 DOM lib，仅声明代码中实际用到的接口
 */

/** 最小化 Blob 声明 — 仅包含项目实际使用的成员 */
interface Blob {
  /** 返回 Blob 数据的 ArrayBuffer 副本 */
  arrayBuffer(): Promise<ArrayBuffer>;
}
