export interface MsgUserVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 用户名
   */
  userName: string;

  /**
   * 性别
   */
  gender: string;

  /**
   * 用户编码
   */
  userCode: string;

  /**
   * 身份证号
   */
  idCard: string | number;

  /**
   * 手机号
   */
  phoneNumber: string;

  /**
   * 生日
   */
  birthday: string;

  /**
   * 农历生日
   */
  lunarBirthday: string;

  /**
   * 邮箱地址
   */
  email: string;

  /**
   * 短信通知
   */
  smsNotifyFlag: string;

  /**
   * 邮箱通知
   */
  emailNotifyFlag: string;

  /**
   * 父亲ID
   */
  fatherId: string | number;

  /**
   * 父亲名
   */
  fatherName: string;

  /**
   * 父亲代码
   */
  fatherCode: string;

  /**
   * 母亲ID
   */
  motherId: string | number;

  /**
   * 母亲名
   */
  motherName: string;

  /**
   * 母亲代码
   */
  motherCode: string;

  /**
   * 配偶ID
   */
  spouseId: string | number;

  /**
   * 配偶名
   */
  spouseName: string;

  /**
   * 配偶代码
   */
  spouseCode: string;
}

export interface MsgUserForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 性别
   */
  gender?: string;

  /**
   * 用户编码
   */
  userCode?: string;

  /**
   * 身份证号
   */
  idCard?: string | number;

  /**
   * 手机号
   */
  phoneNumber?: string;

  /**
   * 生日
   */
  birthday?: string;

  /**
   * 农历生日
   */
  lunarBirthday?: string;

  /**
   * 邮箱地址
   */
  email?: string;

  /**
   * 短信通知
   */
  smsNotifyFlag?: string;

  /**
   * 邮箱通知
   */
  emailNotifyFlag?: string;

  /**
   * 父亲ID
   */
  fatherId: string | number;

  /**
   * 母亲ID
   */
  motherId: string | number;

  /**
   * 配偶ID
   */
  spouseId: string | number;
}

export interface MsgUserQuery extends PageQuery {
  /**
   * 用户名
   */
  userName?: string;

  /**
   * 用户编码
   */
  userCode?: string;

  /**
   * 手机号
   */
  phoneNumber?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
