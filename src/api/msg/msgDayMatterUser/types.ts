export interface MsgDayMatterUserVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 事件ID
   */
  dayMatterId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;
}

export interface MsgDayMatterUserForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 事件ID
   */
  dayMatterId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;
}

export interface MsgDayMatterUserQuery extends PageQuery {
  /**
   * 事件ID
   */
  dayMatterId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
