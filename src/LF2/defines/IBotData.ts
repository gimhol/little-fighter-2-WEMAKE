import type { IBotAction } from "./IBotAction";
import { IBotDataSet } from "./IBotDataSet";
import type { IFrameInfo } from "./IFrameInfo";
import { StateEnum } from "./StateEnum";

/**
 * BOT数据
 *
 * @export
 * @interface IBotData
 */
export interface IBotData {
  /**
   * 
   */
  id: string;

  /**
   * 角色ID
   */
  oid: string;

  /**
   * BOT动作表
   *
   * @type {{ [x in string]?: IBotAction }}
   * @memberof IBotData
   */
  actions: { [x in string]?: IBotAction }

  /**
   * BOT“帧状态”-“动作列表”表
   * 
   * 当bot的帧状态符合时，将对“动作列表”中的动作进行判定与触发
   *
   * @see IFrameInfo 帧信息
   * @see StateEnum 帧状态枚举
   * @type {{ [x in IFrameInfo['state'] | StateEnum]?: string[] }}
   * @memberof IBotData
   */
  states?: { [x in IFrameInfo['state'] | StateEnum | string]?: string[] };

  /**
   * BOT“帧ID”-“动作列表”表
   * 
   * 当bot的帧ID符合时，将对“动作列表”中的动作进行判定与触发
   *
   * @see IFrameInfo 帧信息
   * @type {{ [x in IFrameInfo['id']|string]?: string[] }}
   * @memberof IBotData
   */
  frames?: { [x in IFrameInfo['id'] | string]?: string[] };

  dataset?: IBotDataSet;
}

