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
}

export enum DialogCloseBy {
  PRESS_A = 'press_a'
}