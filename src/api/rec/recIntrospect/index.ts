import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  RecIntrospectForm,
  RecIntrospectItemForm,
  RecIntrospectItemQuery,
  RecIntrospectItemVO,
  RecIntrospectQuery,
  RecIntrospectVO
} from '@/api/rec/recIntrospect/types';

export const listRecIntrospect = (query?: RecIntrospectQuery): AxiosPromise<RecIntrospectVO[]> => {
  return request({
    url: '/rec/recIntrospect/list',
    method: 'get',
    params: query
  });
};

export const getCurrentRecIntrospect = (): AxiosPromise<RecIntrospectVO> => {
  return request({
    url: '/rec/recIntrospect/current',
    method: 'get'
  });
};

export const getRecIntrospect = (id: string | number): AxiosPromise<RecIntrospectVO> => {
  return request({
    url: '/rec/recIntrospect/' + id,
    method: 'get'
  });
};

export const addRecIntrospect = (data: RecIntrospectForm) => {
  return request({
    url: '/rec/recIntrospect',
    method: 'post',
    data: data
  });
};

export const updateRecIntrospect = (data: RecIntrospectForm) => {
  return request({
    url: '/rec/recIntrospect',
    method: 'put',
    data: data
  });
};

export const delRecIntrospect = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recIntrospect/' + id,
    method: 'delete'
  });
};

export const updateRecIntrospectStatus = (id: string | number, status: string) => {
  return request({
    url: '/rec/recIntrospect/status',
    method: 'put',
    data: { ids: [id], status }
  });
};

export const listRecIntrospectItem = (query?: RecIntrospectItemQuery): AxiosPromise<RecIntrospectItemVO[]> => {
  return request({
    url: '/rec/recIntrospectItem/list',
    method: 'get',
    params: query
  });
};

export const addRecIntrospectItem = (data: RecIntrospectItemForm) => {
  return request({
    url: '/rec/recIntrospectItem',
    method: 'post',
    data: data
  });
};

export const updateRecIntrospectItem = (data: RecIntrospectItemForm) => {
  return request({
    url: '/rec/recIntrospectItem',
    method: 'put',
    data: data
  });
};

export const delRecIntrospectItem = (id: string | number | Array<string | number>) => {
  return request({
    url: '/rec/recIntrospectItem/' + id,
    method: 'delete'
  });
};
