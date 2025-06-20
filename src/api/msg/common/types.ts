/**
 * 分组信息
 */
export interface GroupVo {
  /**
   * 分组ID
   */
  id: string | number;

  /**
   * 分组名称
   */
  groupName: string;

  /**
   * 分组代码
   */
  groupCode: string;
}

/**
 * 用户信息
 */
export interface UserVo {
  /**
   * 用户ID
   */
  id: string | number;

  /**
   * 用户名称
   */
  userName: string;

  /**
   * 用户代码
   */
  userCode: string;
}

/**
 * 事件信息
 */
export interface DayNameVo {
  /**
   * 事件ID
   */
  id: string | number;

  /**
   * 事件名称
   */
  dayName: string;
}
