import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgUserGroupVO, MsgUserGroupForm, MsgUserGroupQuery } from '@/api/msg/msgUserGroup/types';

/**
 * 查询用户组列表
 * @param query
 * @returns {*}
 */

export const listMsgUserGroup = (query?: MsgUserGroupQuery): AxiosPromise<MsgUserGroupVO[]> => {
  return request({
    url: '/msg/msgUserGroup/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询用户组详细
 * @param id
 */
export const getMsgUserGroup = (id: string | number): AxiosPromise<MsgUserGroupVO> => {
  return request({
    url: '/msg/msgUserGroup/' + id,
    method: 'get'
  });
};

/**
 * 新增用户组
 * @param data
 */
export const addMsgUserGroup = (data: MsgUserGroupForm) => {
  return request({
    url: '/msg/msgUserGroup',
    method: 'post',
    data: data
  });
};

/**
 * 修改用户组
 * @param data
 */
export const updateMsgUserGroup = (data: MsgUserGroupForm) => {
  return request({
    url: '/msg/msgUserGroup',
    method: 'put',
    data: data
  });
};

/**
 * 删除用户组
 * @param id
 */
export const delMsgUserGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgUserGroup/' + id,
    method: 'delete'
  });
};

/**
 * 获取用户列表
 */
export function userCodeList(params?: { userName?: string; id?: string | number }) {
  return request({
    url: '/msg/msgUser/userCodeList',
    method: 'get',
    params: params
  });
}

/**
 * 获取用户列表
 */
export function groupCodeList(params?: { groupName?: string; id?: string | number }) {
  return request({
    url: '/msg/msgGroup/groupCodeList',
    method: 'get',
    params: params
  });
}
