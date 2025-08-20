export interface RecGoalVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 层级
   */
  level: number;

  /**
   * 顶层ID
   */
  topId: string | number;

  /**
   * 父目标
   */
  parentId: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 内容
   */
  content: string;

  /**
   * 进度
   */
  progress: number;

  /**
   * 状态
   */
  status: string;

  /**
   * 截止日期
   */
  deadLine: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 子对象
   */
  children: RecGoalVO[];
}

export interface RecGoalForm extends BaseEntity {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 层级
   */
  level: number;

  /**
   * 顶层ID
   */
  topId: string | number;

  /**
   * 父目标
   */
  parentId?: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 内容
   */
  content?: string;

  /**
   * 进度
   */
  progress?: number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 截止日期
   */
  deadLine?: string;

  /**
   * 排序
   */
  sortOrder?: number;
}

export interface RecGoalQuery extends PageQuery {
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
