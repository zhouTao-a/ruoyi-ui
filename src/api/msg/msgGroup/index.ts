import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgGroupVO, MsgGroupForm, MsgGroupQuery } from '@/api/msg/msgGroup/types';

/**
 * 查询分组信息列表
 * @param query
 * @returns {*}
 */

export const listMsgGroup = (query?: MsgGroupQuery): AxiosPromise<MsgGroupVO[]> => {
  return request({
    url: '/msg/msgGroup/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询分组信息详细
 * @param id
 */
export const getMsgGroup = (id: string | number): AxiosPromise<MsgGroupVO> => {
  return request({
    url: '/msg/msgGroup/' + id,
    method: 'get'
  });
};

/**
 * 新增分组信息
 * @param data
 */
export const addMsgGroup = (data: MsgGroupForm) => {
  return request({
    url: '/msg/msgGroup',
    method: 'post',
    data: data
  });
};

/**
 * 修改分组信息
 * @param data
 */
export const updateMsgGroup = (data: MsgGroupForm) => {
  return request({
    url: '/msg/msgGroup',
    method: 'put',
    data: data
  });
};

/**
 * 删除分组信息
 * @param id
 */
export const delMsgGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgGroup/' + id,
    method: 'delete'
  });
};

/**
 * 获取用户列表
 */
export function getUserList(params?: { userName?: string; id?: string | number }) {
  return request({
    url: '/msg/msgUser/userCodeList',
    method: 'get',
    params: params
  });
}
