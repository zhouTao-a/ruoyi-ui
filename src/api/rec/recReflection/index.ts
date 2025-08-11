import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RecReflectionVO, RecReflectionForm, RecReflectionQuery } from '@/api/rec/recReflection/types';

/**
 * 查询感想列表
 * @param query
 * @returns {*}
 */

export const listRecReflection = (query?: RecReflectionQuery): AxiosPromise<RecReflectionVO[]> => {
  return request({
    url: '/rec/recReflection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询感想详细
 * @param id
 */
export const getRecReflection = (id: string | number): AxiosPromise<RecReflectionVO> => {
  return request({
    url: '/rec/recReflection/' + id,
    method: 'get'
  });
};

/**
 * 新增感想
 * @param data
 */
export const addRecReflection = (data: RecReflectionForm) => {
  return request({
    url: '/rec/recReflection',
    method: 'post',
    data: data
  });
};

/**
 * 修改感想
 * @param data
 */
export const updateRecReflection = (data: RecReflectionForm) => {
  return request({
    url: '/rec/recReflection',
    method: 'put',
    data: data
  });
};

/**
 * 删除感想
 * @param id
 */
export const delRecReflection = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recReflection/' + id,
    method: 'delete'
  });
};
