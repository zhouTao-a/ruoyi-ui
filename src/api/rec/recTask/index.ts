import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RecTaskVO, RecTaskForm, RecTaskQuery } from '@/api/rec/recTask/types';

/**
 * 查询任务列表
 * @param query
 * @returns {*}
 */

export const listRecTask = (query?: RecTaskQuery): AxiosPromise<RecTaskVO[]> => {
  return request({
    url: '/rec/recTask/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询任务详细
 * @param id
 */
export const getRecTask = (id: string | number): AxiosPromise<RecTaskVO> => {
  return request({
    url: '/rec/recTask/' + id,
    method: 'get'
  });
};

/**
 * 新增任务
 * @param data
 */
export const addRecTask = (data: RecTaskForm) => {
  return request({
    url: '/rec/recTask',
    method: 'post',
    data: data
  });
};

/**
 * 修改任务
 * @param data
 */
export const updateRecTask = (data: RecTaskForm) => {
  return request({
    url: '/rec/recTask',
    method: 'put',
    data: data
  });
};

/**
 * 删除任务
 * @param id
 */
export const delRecTask = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recTask/' + id,
    method: 'delete'
  });
};
