export interface MsgUserGroupVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 分组ID
   */
  groupId: string | number;

  /**
   * 辈分差
   */
  relativeGenerationDiff: number;

  /**
   * 亲缘关系（close, distant, friend, stranger）
   */
  kinshipLevel: string;

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 分组编码
   */
  groupCode?: string;

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 用户编码
   */
  userCode?: string;
}

export interface MsgUserGroupForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 辈分差
   */
  relativeGenerationDiff?: number;

  /**
   * 亲缘关系（close, distant, friend, stranger）
   */
  kinshipLevel?: string;

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 分组编码
   */
  groupCode?: string;

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 用户编码
   */
  userCode?: string;
}

export interface MsgUserGroupQuery extends PageQuery {
  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 辈分差
   */
  relativeGenerationDiff?: number;

  /**
   * 亲缘关系（close, distant, friend, stranger）
   */
  kinshipLevel?: string;

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
