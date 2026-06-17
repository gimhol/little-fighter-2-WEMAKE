export interface IZipObject {
  name: string;

  /**
   * 读取为文本
   *
   * @returns {Promise<string>} 
   */
  text(): Promise<string>;


  /**
   * 读取为json
   *
   * @template [T=any] 
   * @returns {Promise<T>} 
   */
  json<T = any>(): Promise<T>;


  /**
   * 读取为二进制数据
   *
   * @returns {Promise<Uint8Array>} 
   */
  blob(): Promise<Uint8Array>;


  /**
   * 读取为blob_url
   *
   * @returns {Promise<string>} 
   */
  blob_url(): Promise<string>;
  array_buffer(): Promise<ArrayBuffer>
  uint8_array(): Promise<Uint8Array>
}
