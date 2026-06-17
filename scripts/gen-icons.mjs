/**
 * 从 favicon.ico 生成 Chrome 扩展所需的 PNG 图标
 * 用法: node scripts/gen-icons.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXT_DIR = join(ROOT, 'extension');

// 读取 favicon.ico 的原始字节
const icoPath = join(ROOT, 'public', 'favicon.ico');
const icoBuf = readFileSync(icoPath);

// ICO 文件结构: 前6字节是头部，然后是各图像条目
// 头部: 2B reserved(0) + 2B type(1=ICO) + 2B count
const count = icoBuf.readUInt16LE(4);
console.log(`[icons] favicon.ico contains ${count} image(s)`);

// 找到最大的 BMP/PNG 条目
let bestOffset = 0, bestSize = 0;
for (let i = 0; i < count; i++) {
  const off = 6 + i * 16; // 每个条目16字节
  const w = icoBuf[off] || 256;
  const h = icoBuf[off + 1] || 256;
  const size = icoBuf.readUInt32LE(off + 8);
  const offset = icoBuf.readUInt32LE(off + 12);
  console.log(`[icons]   entry ${i}: ${w}x${h}, ${size} bytes`);
  if (w * h > bestSize) {
    bestSize = w * h;
    bestOffset = offset;
  }
}

// 提取最大图像数据
// 如果 ICO 内嵌 PNG（大小检查），直接提取；否则是 BMP，需要转换
const imgData = icoBuf.subarray(bestOffset);

// 检查是否为 PNG (PNG 魔数: 89 50 4E 47)
if (imgData[0] === 0x89 && imgData[1] === 0x50 && imgData[2] === 0x4E && imgData[3] === 0x47) {
  // 内嵌 PNG，直接保存
  writeFileSync(join(EXT_DIR, 'icon128.png'), imgData);
  console.log(`[icons] ✅ Saved icon128.png (embedded PNG)`);
  
  // 复制为其他尺寸（Chrome 接受不同尺寸引用同一文件）
  writeFileSync(join(EXT_DIR, 'icon48.png'), imgData);
  writeFileSync(join(EXT_DIR, 'icon16.png'), imgData);
  console.log(`[icons] ✅ Saved icon48.png, icon16.png`);
} else {
  console.log(`[icons] ⚠️ ICO uses BMP format — cannot auto-convert.`);
  console.log(`[icons] → Please manually save a 128x128 PNG to extension/icon128.png`);
  console.log(`[icons] → Online converter: https://www.icoconverter.com/`);
}
