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
   * 概要
   */
  synopsis: string;

  /**
   * 感想
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
   * 概要
   */
  synopsis?: string;

  /**
   * 感想
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
   * 类型
   */
  sourceType?: string;

  /**
   * 是否随机
   */
  randomFlag?: boolean;
}
