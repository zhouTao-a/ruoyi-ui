export interface RecIntrospectVO {
  id: string | number;
  title: string;
  status: string;
  sortOrder?: number;
  userId?: string | number;
  items?: RecIntrospectItemVO[];
}

export interface RecIntrospectForm extends BaseEntity {
  id?: string | number;
  title?: string;
  status?: string;
  sortOrder?: number;
}

export interface RecIntrospectQuery extends PageQuery {
  title?: string;
  status?: string;
}

export interface RecIntrospectItemVO {
  id: string | number;
  introspectId: string | number;
  introspectTitle?: string;
  occurDate: string;
  content: string;
  sortOrder?: number;
}

export interface RecIntrospectItemForm extends BaseEntity {
  id?: string | number;
  introspectId?: string | number;
  occurDate?: string;
  content?: string;
  sortOrder?: number;
}

export interface RecIntrospectItemQuery extends PageQuery {
  introspectId?: string | number;
  occurDate?: string;
  occurDateBegin?: string;
  occurDateEnd?: string;
}
