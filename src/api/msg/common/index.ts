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
