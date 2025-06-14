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

  /**
   * 默认参考用户代码
   */
  defaultTargetUserCode: string;
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

  /**
   * 默认参考用户代码
   */
  defaultTargetUserCode: string;

  /**
   * 默认参考用户名称
   */
  defaultTargetUserName: string;
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
