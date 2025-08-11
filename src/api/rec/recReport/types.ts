export interface RecReportVO {
  /**
   * 主键ID
   */
  id: string | number;
  /**
   * 类型
   */
  reportType: string;

  /**
   * 日期
   */
  reportDate: string;

  /**
   * 内容
   */
  content: string;

  /**
   * 摘要
   */
  summary: string;
}

export interface RecReportForm extends BaseEntity {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 类型
   */
  reportType?: string;

  /**
   * 日期
   */
  reportDate?: string;

  /**
   * 内容
   */
  content?: string;

  /**
   * 摘要
   */
  summary?: string;
}

export interface RecReportQuery extends PageQuery {
  /**
   * 类型
   */
  reportType?: string;

  /**
   * 日期
   */
  reportDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
