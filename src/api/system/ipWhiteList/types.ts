export interface IpWhiteListVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * IP地址或CIDR网段
   */
  ipAddress: string;

  /**
   * 备注说明
   */
  description: string;

  /**
   * 状态：1-有效，0-无效
   */
  status: string | number;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface IpWhiteListForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * IP地址或CIDR网段
   */
  ipAddress?: string;

  /**
   * 备注说明
   */
  description?: string;

  /**
   * 状态：1-有效，0-无效
   */
  status?: string | number;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;
}

export interface IpWhiteListQuery extends PageQuery {
  /**
   * IP地址或CIDR网段
   */
  ipAddress?: string;

  /**
   * 备注说明
   */
  description?: string;

  /**
   * 状态：1-有效，0-无效
   */
  status?: string | number;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
