import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IpWhiteListVO, IpWhiteListForm, IpWhiteListQuery } from '@/api/system/ipWhiteList/types';

/**
 * 查询IP白名单列表
 * @param query
 * @returns {*}
 */

export const listIpWhiteList = (query?: IpWhiteListQuery): AxiosPromise<IpWhiteListVO[]> => {
  return request({
    url: '/system/ipWhiteList/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询IP白名单详细
 * @param id
 */
export const getIpWhiteList = (id: string | number): AxiosPromise<IpWhiteListVO> => {
  return request({
    url: '/system/ipWhiteList/' + id,
    method: 'get'
  });
};

/**
 * 新增IP白名单
 * @param data
 */
export const addIpWhiteList = (data: IpWhiteListForm) => {
  return request({
    url: '/system/ipWhiteList',
    method: 'post',
    data: data
  });
};

/**
 * 修改IP白名单
 * @param data
 */
export const updateIpWhiteList = (data: IpWhiteListForm) => {
  return request({
    url: '/system/ipWhiteList',
    method: 'put',
    data: data
  });
};

/**
 * 删除IP白名单
 * @param id
 */
export const delIpWhiteList = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/ipWhiteList/' + id,
    method: 'delete'
  });
};
