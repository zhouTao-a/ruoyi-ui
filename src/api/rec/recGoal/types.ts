export interface RecGoalVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 父目标
   */
  parentId: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 描述
   */
  description: string;

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
   * 父目标
   */
  parentId?: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 描述
   */
  description?: string;

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

export interface RecGoalQuery {
  /**
   * 父目标
   */
  parentId?: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 截止日期
   */
  deadLine?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
