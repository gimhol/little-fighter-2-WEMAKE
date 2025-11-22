/** BlobUrl */
export type BlobUrl = string;
/** 
 * 命中URL 
 * 能加载成功的数据的URL称为命中URL
 */
export type HitUrl = string;
export interface IImporter {
  /**
   * 从url数组中加载json数据 
   * 
   * 应当按顺序读取url，直到成功加载出json数据，能加载成功的数据的URL称为命中URL
   *
   * @template T 
   * @param {string[]} urls 
   * @return {Promise<[T, HitUrl]>} [Json数据，命中URL]
   * @memberof IImporter
   */
  import_as_json<T = any>(urls: string[]): Promise<[T, HitUrl]>;
  import_as_blob(urls: string[]): Promise<[Blob, HitUrl]>;
  import_as_blob_url(urls: string[]): Promise<[BlobUrl, HitUrl]>;
  import_as_array_buffer(urls: string[]): Promise<[ArrayBuffer, HitUrl]>;
}
