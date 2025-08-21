export interface RecTaskVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 描述
   */
  content: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 进度
   */
  progress: number;

  /**
   * 截止日期
   */
  deadLine: string;

  /**
   * 优先级
   */
  priority: string;
}

export interface RecTaskForm extends BaseEntity {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 描述
   */
  content?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 进度
   */
  progress?: number;

  /**
   * 截止日期
   */
  deadLine?: string;

  /**
   * 优先级
   */
  priority?: string;
}

export interface RecTaskQuery extends PageQuery {
  /**
   * 标题
   */
  title?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 截止开始日期
   */
  beginDeadLine?: string | Date | number;

  /**
   * 截止结束日期
   */
  endDeadLine?: string | Date | number;
}
