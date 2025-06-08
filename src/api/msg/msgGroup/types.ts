export interface MsgGroupVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 分组名称
   */
  groupName: string;

  /**
   * 分组编码
   */
  groupCode: string;

  /**
   * 默认参考用户ID
   */
  defaultTargetUserId: string | number;

}

export interface MsgGroupForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 分组编码
   */
  groupCode?: string;

  /**
   * 默认参考用户ID
   */
  defaultTargetUserId?: string | number;

}

export interface MsgGroupQuery extends PageQuery {

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 分组编码
   */
  groupCode?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



