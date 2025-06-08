import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MsgDayMatterVO, MsgDayMatterForm, MsgDayMatterQuery } from '@/api/msg/msgDayMatter/types';

/**
 * 查询事件列表
 * @param query
 * @returns {*}
 */

export const listMsgDayMatter = (query?: MsgDayMatterQuery): AxiosPromise<MsgDayMatterVO[]> => {
  return request({
    url: '/msg/msgDayMatter/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询事件详细
 * @param id
 */
export const getMsgDayMatter = (id: string | number): AxiosPromise<MsgDayMatterVO> => {
  return request({
    url: '/msg/msgDayMatter/' + id,
    method: 'get'
  });
};

/**
 * 新增事件
 * @param data
 */
export const addMsgDayMatter = (data: MsgDayMatterForm) => {
  return request({
    url: '/msg/msgDayMatter',
    method: 'post',
    data: data
  });
};

/**
 * 修改事件
 * @param data
 */
export const updateMsgDayMatter = (data: MsgDayMatterForm) => {
  return request({
    url: '/msg/msgDayMatter',
    method: 'put',
    data: data
  });
};

/**
 * 删除事件
 * @param id
 */
export const delMsgDayMatter = (id: string | number | Array<string | number>) => {
  return request({
    url: '/msg/msgDayMatter/' + id,
    method: 'delete'
  });
};
