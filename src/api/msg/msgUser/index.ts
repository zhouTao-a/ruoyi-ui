import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgUserVO, MsgUserForm, MsgUserQuery } from '@/api/msg/msgUser/types';

/**
 * 查询用户列表
 * @param query
 * @returns {*}
 */

export const listMsgUser = (query?: MsgUserQuery): AxiosPromise<MsgUserVO[]> => {
  return request({
    url: '/msg/msgUser/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询用户详细
 * @param id
 */
export const getMsgUser = (id: string | number): AxiosPromise<MsgUserVO> => {
  return request({
    url: '/msg/msgUser/' + id,
    method: 'get'
  });
};

/**
 * 新增用户
 * @param data
 */
export const addMsgUser = (data: MsgUserForm) => {
  return request({
    url: '/msg/msgUser',
    method: 'post',
    data: data
  });
};

/**
 * 修改用户
 * @param data
 */
export const updateMsgUser = (data: MsgUserForm) => {
  return request({
    url: '/msg/msgUser',
    method: 'put',
    data: data
  });
};

/**
 * 删除用户
 * @param id
 */
export const delMsgUser = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgUser/' + id,
    method: 'delete'
  });
};

/**
 * 公历转农历
 * @param lunarDate 公历时间字符串 yyyy-MM-dd HH:mm:ss
 */
export const convertSolarToLunar = (lunarDate: string): AxiosPromise<string> => {
  return request({
    url: '/msg/date/getLunarDate',
    method: 'get',
    params: { date: lunarDate }
  });
};

/**
 * 农历转公历
 * @param solarDate 公历时间字符串 yyyy-MM-dd HH:mm:ss
 */
export const convertLunarToSolar = (solarDate: string): AxiosPromise<string> => {
  return request({
    url: '/msg/date/getSolarDate',
    method: 'get',
    params: { date: solarDate }
  });
};
