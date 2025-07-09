import request from '@/utils/request';

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

/**
 * 获取用户列表
 */
export function dayNameList(params?: { dayName?: string; id?: string | number }) {
  return request({
    url: '/msg/msgDayMatter/dayNameList',
    method: 'get',
    params: params
  });
}

/**
 * 获取事件列表
 */
export function dayMatterList(params?: { year?: number; month?: number }) {
  return request({
    url: '/msg/msgDayMatter/dayMatterList',
    method: 'get',
    params: params
  });
}
