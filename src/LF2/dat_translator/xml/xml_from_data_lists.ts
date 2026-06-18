import type { IDataLists } from "../../defines/IDataLists";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_dat_index } from "./xml_from_dat_index";

/**
 * 序列化整个数据索引列表为 XML
 *
 * <data>
 *    
 *   // 读取多个obj，IDataLists.objects
 *   <obj .../>
 *   <obj .../>
 *   <obj .../>
 *   <obj .../>
 * 
 * 
 *   // 读取多个background，成为IDataLists.backgrounds
 *   <background .../>
 *   <background .../>
 *   <background .../>
 *   <background .../>
 *   <background .../>
 * 
 *   // 读取多个stages，成为IDataLists.stages
 *   <stages .../>
 *   <stages .../>
 *   <stages .../>
 *   <stages .../>
 *   <stages .../>
 * 
 *   // 读取多个bots，成为IDataLists.bots
 *   <bot .../>
 *   <bot .../>
 * </data>
 */
export function xml_from_data_lists(xml: IXMLFactory, lists: IDataLists): IXMLElement {
  const root = xml.create("data");

  const groups: [string, IDataLists[keyof IDataLists]][] = [
    ["obj", lists.objects],
    ["background", lists.backgrounds],
    ["stages", lists.stages],
    ["bot", lists.bots],
  ];

  for (const [tag, items] of groups) {
    if (!items?.length) continue;
    for (const item of items) {
      root.insert(xml_from_dat_index(xml, item, tag));
    }
  }

  return root;
}
