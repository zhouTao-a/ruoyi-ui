import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgDayMatterUserVO, MsgDayMatterUserForm, MsgDayMatterUserQuery } from '@/api/msg/msgDayMatterUser/types';

/**
 * 查询事件与用户关联列表
 * @param query
 * @returns {*}
 */

export const listMsgDayMatterUser = (query?: MsgDayMatterUserQuery): AxiosPromise<MsgDayMatterUserVO[]> => {
  return request({
    url: '/msg/msgDayMatterUser/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询事件与用户关联详细
 * @param id
 */
export const getMsgDayMatterUser = (id: string | number): AxiosPromise<MsgDayMatterUserVO> => {
  return request({
    url: '/msg/msgDayMatterUser/' + id,
    method: 'get'
  });
};

/**
 * 新增事件与用户关联
 * @param data
 */
export const addMsgDayMatterUser = (data: MsgDayMatterUserForm) => {
  return request({
    url: '/msg/msgDayMatterUser',
    method: 'post',
    data: data
  });
};

/**
 * 修改事件与用户关联
 * @param data
 */
export const updateMsgDayMatterUser = (data: MsgDayMatterUserForm) => {
  return request({
    url: '/msg/msgDayMatterUser',
    method: 'put',
    data: data
  });
};

/**
 * 删除事件与用户关联
 * @param id
 */
export const delMsgDayMatterUser = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgDayMatterUser/' + id,
    method: 'delete'
  });
};
