import type { IExpression } from "./IExpression";

export interface IDialogInfo {
  /** 
   * 对话框类型 
   */
  type?: 'left' | 'right'

  /** 
   * 说话的角色ID
   */
  fighter?: string;

  /** 
   * 是否暂停游戏 
   */
  pause?: boolean;

  /**
   * 对话文本
   */
  i18n: string;

  /** 
   * 如果关闭当前对话 
   * 
   * 默认: 'press_a'
   */
  close_by?: string;


  /** 
   * 隐藏状态栏 
   */
  hide_stats?: number;

  /** 
   * 结束判定 
   * 
   * @type {?string}
   */
  end_test?: string;

  /**
   * 结束测试器
   * 读取数据时，通过end_test生成
   * 
   * 当end_test不存在，end_tester也不存在
   * 
   * 无结束测试器时, 对话框完毕，且敌人被清空视为结束
   */
  end_tester?: IExpression<any>;
}

export enum DialogCloseBy {
  PRESS_A = 'press_a'
}