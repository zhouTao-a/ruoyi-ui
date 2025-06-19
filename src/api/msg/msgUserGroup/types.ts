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
   * 亲缘关系
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
   * 用户List
   */
  userIdList?: (string | number)[];

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 辈分差
   */
  relativeGenerationDiff?: number;

  /**
   * 亲缘关系
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
   * 亲缘关系
   */
  kinshipLevel?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
