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
   * 代际差
   */
  relativeGenerationDiff: number;

  /**
   * 亲缘关系（close, distant, friend, stranger）
   */
  kinshipLevel: string;

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
   * 代际差
   */
  relativeGenerationDiff?: number;

  /**
   * 亲缘关系（close, distant, friend, stranger）
   */
  kinshipLevel?: string;

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
   * 代际差
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



