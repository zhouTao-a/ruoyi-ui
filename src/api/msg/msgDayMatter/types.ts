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
   * 事件目标时间（含时分）
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
   * 是否重复提醒（T/F）
   */
  repeatFlag: string;

  /**
   * 通知状态（pending, notified, expired, disabled）
   */
  notifyStatus: string;

  /**
   * 下次通知时间
   */
  nextNotifyTime: string;

  /**
   * 所属分组ID
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
   * 事件目标时间（含时分）
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
   * 是否重复提醒（T/F）
   */
  repeatFlag?: string;

  /**
   * 通知状态（pending, notified, expired, disabled）
   */
  notifyStatus?: string;

  /**
   * 下次通知时间
   */
  nextNotifyTime?: string;

  /**
   * 所属用户ID
   */
  userId?: string | number;

  /**
   * 所属分组ID
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
   * 所属分组ID
   */
  groupId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

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
