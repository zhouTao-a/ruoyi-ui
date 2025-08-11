export interface RecReflectionVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 内容
   */
  content: string;

  /**
   * 来源类型
   */
  sourceType: string;

  /**
   * 来源名称
   */
  sourceName: string;

  /**
   * 来源链接
   */
  sourceLink: string;
}

export interface RecReflectionForm extends BaseEntity {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 内容
   */
  content?: string;

  /**
   * 来源类型
   */
  sourceType?: string;

  /**
   * 来源名称
   */
  sourceName?: string;

  /**
   * 来源链接
   */
  sourceLink?: string;
}

export interface RecReflectionQuery extends PageQuery {
  /**
   * 标题
   */
  title?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
