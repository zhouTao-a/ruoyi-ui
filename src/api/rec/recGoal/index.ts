import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RecGoalVO, RecGoalForm, RecGoalQuery } from '@/api/rec/recGoal/types';

/**
 * 查询目标列表
 * @param query
 * @returns {*}
 */

export const listRecGoal = (query?: RecGoalQuery): AxiosPromise<RecGoalVO[]> => {
  return request({
    url: '/rec/recGoal/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询目标详细
 * @param id
 */
export const getRecGoal = (id: string | number): AxiosPromise<RecGoalVO> => {
  return request({
    url: '/rec/recGoal/' + id,
    method: 'get'
  });
};

/**
 * 新增目标
 * @param data
 */
export const addRecGoal = (data: RecGoalForm) => {
  return request({
    url: '/rec/recGoal',
    method: 'post',
    data: data
  });
};

/**
 * 修改目标
 * @param data
 */
export const updateRecGoal = (data: RecGoalForm) => {
  return request({
    url: '/rec/recGoal',
    method: 'put',
    data: data
  });
};

/**
 * 删除目标
 * @param id
 */
export const delRecGoal = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recGoal/' + id,
    method: 'delete'
  });
};

/**
 * 批量修改目标状态
 */
export const batchUpdateRecGoalStatus = (ids: Array<string | number>, status: string) => {
  return request({
    url: '/rec/recGoal/batchStatus',
    method: 'put',
    data: { ids, status }
  });
};
