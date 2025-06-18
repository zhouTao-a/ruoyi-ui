export interface MsgMatterGroupVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 事件ID
   */
  matterId: string | number;

  /**
   * 分组ID
   */
  groupId: string | number;
}

export interface MsgMatterGroupForm extends BaseEntity {
  /**
   * 事件ID
   */
  matterId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;
}

export interface MsgMatterGroupQuery extends PageQuery {
  /**
   * 事件ID
   */
  matterId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
