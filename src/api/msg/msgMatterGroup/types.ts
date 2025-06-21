export interface MsgMatterGroupVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 事件ID
   */
  dayMatterId: string | number;

  /**
   * 分组ID
   */
  groupId: string | number;

  /**
   * 事件名
   */
  dayName?: string;

  /**
   * 分组名
   */
  groupName?: string;

  /**
   * 分组编码
   */
  groupCode?: string;
}

export interface MsgMatterGroupForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 事件ID
   */
  dayMatterId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 分组List
   */
  groupIdList?: (string | number)[];

  /**
   * 事件List
   */
  dayMatterIdList?: (string | number)[];
}

export interface MsgMatterGroupQuery extends PageQuery {
  /**
   * 事件ID
   */
  dayMatterId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
