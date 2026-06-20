/**
 * 纯 ES 实现的 UTF-8 编解码，不依赖 Web API（TextEncoder/TextDecoder）。
 */

/** 将 JS 字符串（UTF-16）编码为 UTF-8 字节数组 */
export function encodeUTF8(str: string): Uint8Array {
  const len = str.length;
  // 先计算所需字节数，避免动态扩容
  let byteLen = 0;
  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) byteLen += 1;
    else if (c < 0x800) byteLen += 2;
    else if (c >= 0xd800 && c < 0xdc00) { byteLen += 4; i++; } // 高位代理
    else byteLen += 3;
  }

  const bytes = new Uint8Array(byteLen);
  let pos = 0;
  for (let i = 0; i < len; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes[pos++] = c;
    } else if (c < 0x800) {
      bytes[pos++] = 0xc0 | (c >>> 6);
      bytes[pos++] = 0x80 | (c & 0x3f);
    } else if (c >= 0xd800 && c < 0xdc00) {
      // 代理对（surrogate pair）
      const hi = c;
      const lo = str.charCodeAt(++i);
      c = 0x10000 + ((hi & 0x3ff) << 10) | (lo & 0x3ff);
      bytes[pos++] = 0xf0 | (c >>> 18);
      bytes[pos++] = 0x80 | ((c >>> 12) & 0x3f);
      bytes[pos++] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[pos++] = 0x80 | (c & 0x3f);
    } else {
      bytes[pos++] = 0xe0 | (c >>> 12);
      bytes[pos++] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[pos++] = 0x80 | (c & 0x3f);
    }
  }
  return bytes;
}

/** 将 UTF-8 字节数组解码为 JS 字符串 */
export function decodeUTF8(buf: Uint8Array): string {
  const len = buf.length;
  const chunks: string[] = [];
  let i = 0;

  while (i < len) {
    const b0 = buf[i++];
    if (b0 < 0x80) {
      // 1 字节: 0xxxxxxx
      chunks.push(String.fromCharCode(b0));
    } else if ((b0 & 0xe0) === 0xc0) {
      // 2 字节: 110xxxxx 10xxxxxx
      const b1 = buf[i++];
      chunks.push(String.fromCharCode(((b0 & 0x1f) << 6) | (b1 & 0x3f)));
    } else if ((b0 & 0xf0) === 0xe0) {
      // 3 字节: 1110xxxx 10xxxxxx 10xxxxxx
      const b1 = buf[i++];
      const b2 = buf[i++];
      chunks.push(String.fromCharCode(
        ((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f)
      ));
    } else if ((b0 & 0xf8) === 0xf0) {
      // 4 字节: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx → 代理对
      const b1 = buf[i++];
      const b2 = buf[i++];
      const b3 = buf[i++];
      const cp = ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
      const hi = 0xd800 + ((cp - 0x10000) >>> 10);
      const lo = 0xdc00 + ((cp - 0x10000) & 0x3ff);
      chunks.push(String.fromCharCode(hi, lo));
    }
    // 非法字节跳过（生产环境可加错误处理）
  }
  return chunks.join("");
}
