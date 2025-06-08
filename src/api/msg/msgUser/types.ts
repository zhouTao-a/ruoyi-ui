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
   * 是否接收短信通知（T/F）
   */
  smsNotifyFlag: string;

  /**
   * 是否接收邮箱通知（T/F）
   */
  emailNotifyFlag: string;

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
   * 是否接收短信通知（T/F）
   */
  smsNotifyFlag?: string;

  /**
   * 是否接收邮箱通知（T/F）
   */
  emailNotifyFlag?: string;

}

export interface MsgUserQuery extends PageQuery {

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 手机号
   */
  phoneNumber?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



