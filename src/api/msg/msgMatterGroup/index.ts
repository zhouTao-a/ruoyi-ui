import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgMatterGroupVO, MsgMatterGroupForm, MsgMatterGroupQuery } from '@/api/msg/msgMatterGroup/types';

/**
 * 查询事件组列表
 * @param query
 * @returns {*}
 */

export const listMsgMatterGroup = (query?: MsgMatterGroupQuery): AxiosPromise<MsgMatterGroupVO[]> => {
  return request({
    url: '/msg/msgMatterGroup/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询事件组详细
 * @param id
 */
export const getMsgMatterGroup = (id: string | number): AxiosPromise<MsgMatterGroupVO> => {
  return request({
    url: '/msg/msgMatterGroup/' + id,
    method: 'get'
  });
};

/**
 * 新增事件组
 * @param data
 */
export const addMsgMatterGroup = (data: MsgMatterGroupForm) => {
  return request({
    url: '/msg/msgMatterGroup',
    method: 'post',
    data: data
  });
};

/**
 * 修改事件组
 * @param data
 */
export const updateMsgMatterGroup = (data: MsgMatterGroupForm) => {
  return request({
    url: '/msg/msgMatterGroup',
    method: 'put',
    data: data
  });
};

/**
 * 删除事件组
 * @param id
 */
export const delMsgMatterGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgMatterGroup/' + id,
    method: 'delete'
  });
};
