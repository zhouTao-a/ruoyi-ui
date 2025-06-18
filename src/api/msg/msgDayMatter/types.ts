export interface MsgDayMatterVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 事件名称
   */
  dayName: string;

  /**
   * 事件时间（含时分）
   */
  dayTarget: string;

  /**
   * 事件类型（life, work, anniversary, birthday）
   */
  dayType: string;

  /**
   * 提醒周期（minutely, hourly, daily, weekly, monthly, yearly）
   */
  remindType: string;

  /**
   * 重复提醒（T/F）
   */
  repeatFlag: string;

  /**
   * 通知状态（pending, notified, expired, disabled）
   */
  notifyStatus: string;

  /**
   * 通知时间
   */
  nextNotifyTime: string;

  /**
   * 分组信息
   */
  groupId: string | number;

  /**
   * 分组名称
   */
  groupName: string;

  /**
   * 分组代码
   */
  groupCode: string;

  /**
   * 分组信息
   */
  userId: string | number;

  /**
   * 用户名称
   */
  userName: string;

  /**
   * 用户代码
   */
  userCode: string;
}

export interface MsgDayMatterForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 事件名称
   */
  dayName?: string;

  /**
   * 事件时间（含时分）
   */
  dayTarget?: string;

  /**
   * 事件类型（life, work, anniversary, birthday）
   */
  dayType?: string;

  /**
   * 提醒周期（minutely, hourly, daily, weekly, monthly, yearly）
   */
  remindType?: string;

  /**
   * 重复提醒（T/F）
   */
  repeatFlag?: string;

  /**
   * 通知状态（pending, notified, expired, disabled）
   */
  notifyStatus?: string;

  /**
   * 通知时间
   */
  nextNotifyTime?: string;

  /**
   * 用户
   */
  userId?: string | number;

  /**
   * 用户名称
   */
  userName: string;

  /**
   * 用户代码
   */
  userCode: string;

  /**
   * 分组信息
   */
  groupId?: string | number;

  /**
   * 分组名称
   */
  groupName: string;

  /**
   * 分组代码
   */
  groupCode: string;
}

export interface MsgDayMatterQuery extends PageQuery {
  /**
   * 事件名称
   */
  dayName?: string;

  /**
   * 事件类型（life, work, anniversary, birthday）
   */
  dayType?: string;

  /**
   * 用户
   */
  userId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
