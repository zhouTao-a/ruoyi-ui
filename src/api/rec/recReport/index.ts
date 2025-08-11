import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RecReportVO, RecReportForm, RecReportQuery } from '@/api/rec/recReport/types';

/**
 * 查询报告列表
 * @param query
 * @returns {*}
 */

export const listRecReport = (query?: RecReportQuery): AxiosPromise<RecReportVO[]> => {
  return request({
    url: '/rec/recReport/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询报告详细
 * @param id
 */
export const getRecReport = (id: string | number): AxiosPromise<RecReportVO> => {
  return request({
    url: '/rec/recReport/' + id,
    method: 'get'
  });
};

/**
 * 新增报告
 * @param data
 */
export const addRecReport = (data: RecReportForm) => {
  return request({
    url: '/rec/recReport',
    method: 'post',
    data: data
  });
};

/**
 * 修改报告
 * @param data
 */
export const updateRecReport = (data: RecReportForm) => {
  return request({
    url: '/rec/recReport',
    method: 'put',
    data: data
  });
};

/**
 * 删除报告
 * @param id
 */
export const delRecReport = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recReport/' + id,
    method: 'delete'
  });
};
