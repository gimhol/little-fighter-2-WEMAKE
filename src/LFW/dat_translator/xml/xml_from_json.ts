/**
 * 通用 JSON → XML 转换工具
 * 将 JSON 对象序列化为属性为主的扁平 XML 格式
 */

const ESC: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
const esc = (s: unknown) => String(s).replace(/[<>&"]/g, (c) => ESC[c]);

function attrs(obj: Record<string, unknown>): string {
  let out = "";
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      out += ` ${key}="${esc(v.join(","))}"`;
    } else {
      out += ` ${key}="${esc(String(v))}"`;
    }
  }
  return out;
}

/**
 * 通用 JSON → XML 转换
 * 
 * - 首层 key 作为根标签名
 * - 数组元素根据 tagName 或 key 生成重复标签
 * - 基本类型值作为属性输出
 * 
 * @param data 要转换的 JSON 数据
 * @param tagName 根标签名
 * @param keyOrder 属性顺序（可选）
 */
export function xml_from_json(
  data: Record<string, unknown>,
  tagName: string,
  keyOrder?: string[],
): string {
  let xml = `<${tagName}${attrsOf(data, keyOrder)}>\n`;
  xml += childrenXml(data, "");
  xml += `</${tagName}>\n`;
  return xml;
}

function attrsOf(obj: Record<string, unknown>, keyOrder?: string[]): string {
  const keys = keyOrder ?? Object.keys(obj);
  const attrObj: Record<string, unknown> = {};
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined || v === null || typeof v === "object") continue;
    if (Array.isArray(v) && v.some(x => typeof x === "object")) continue;
    attrObj[k] = v;
  }
  return attrs(attrObj);
}

function childrenXml(obj: Record<string, unknown>, indent: string): string {
  let xml = "";
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === undefined || v === null) continue;

    if (Array.isArray(v)) {
      // 检查是不是纯值数组（逗号分隔输出到属性）
      const allPrimitive = v.every(x => typeof x !== "object");
      if (allPrimitive) continue; // 已经在 attrsOf 中处理

      // 对象数组 → 重复子标签
      for (const item of v) {
        if (typeof item === "object" && item !== null) {
          const childTag = (item as any).tagName ?? key;
          xml += `${indent}  <${childTag}${attrsOf(item as Record<string, unknown>)}`;
          const hasChildren = Object.values(item as Record<string, unknown>).some(
            x => x !== null && x !== undefined && typeof x === "object",
          );
          if (hasChildren) {
            xml += `>\n`;
            xml += childrenXml(item as Record<string, unknown>, indent + "  ");
            xml += `${indent}  </${childTag}>\n`;
          } else {
            xml += ` />\n`;
          }
        } else {
          xml += `${indent}  <${key}>${esc(item)}</${key}>\n`;
        }
      }
    } else if (typeof v === "object" && v !== null) {
      // 嵌套对象 → 子标签
      const childTag = key;
      xml += `${indent}  <${childTag}${attrsOf(v as Record<string, unknown>)}`;
      const hasChildren = Object.values(v as Record<string, unknown>).some(
        x => x !== null && x !== undefined && typeof x === "object",
      );
      if (hasChildren) {
        xml += `>\n`;
        xml += childrenXml(v as Record<string, unknown>, indent + "  ");
        xml += `${indent}  </${childTag}>\n`;
      } else {
        xml += ` />\n`;
      }
    }
  }
  return xml;
}
