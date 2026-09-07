<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="标题" prop="title">
              <el-input style="width: 200px" v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 160px">
                <el-option label="生效" value="active" />
                <el-option label="失效" value="inactive" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['rec:recIntrospect:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['rec:recIntrospect:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['rec:recIntrospect:remove']"
              >删除</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="introspectList" row-key="id" @selection-change="handleSelectionChange" @expand-change="onExpandChange">
        <el-table-column type="expand">
          <template #default="scope">
            <div class="expand-wrap" v-loading="expandOf(scope.row.id).loading">
              <div class="expand-filter">
                <span class="expand-filter-label">年月</span>
                <el-date-picker
                  :model-value="expandOf(scope.row.id).month"
                  type="month"
                  value-format="YYYY-MM"
                  placeholder="选择年月"
                  style="width: 140px"
                  @update:model-value="(val: string) => loadExpand(scope.row.id, val)"
                />
              </div>
              <div v-if="!expandOf(scope.row.id).dates.length" class="expand-empty">暂无该月记录</div>
              <div v-for="day in expandOf(scope.row.id).dates" :key="day.date" class="day-card" :class="{ open: day.open }">
                <div class="day-head" @click="toggleDay(scope.row.id, day.date)">
                  <div class="day-date">
                    <span class="day-num">{{ day.day }}</span>
                    <div class="day-meta">
                      <span>{{ day.monthLabel }}</span>
                      <span>{{ day.year }}</span>
                    </div>
                  </div>
                  <div class="day-head-main">
                    <span class="day-full">{{ day.date }}</span>
                    <span class="day-count">{{ day.list.length }} 次</span>
                  </div>
                  <i class="day-arrow" :class="{ open: day.open }"></i>
                </div>
                <div v-if="day.open" class="day-body">
                  <div v-for="(item, index) in day.list" :key="item.id" class="item-row">
                    <span class="item-index">{{ index + 1 }}</span>
                    <span class="item-text">{{ item.content }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip min-width="160" />
        <el-table-column label="生效" align="center" prop="status" min-width="90">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status === 'active'"
              :disabled="!checkPermi(['rec:recIntrospect:edit'])"
              @change="(val: boolean) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" min-width="80" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="140" fixed="right">
          <template #default="scope">
            <el-tooltip content="维护明细" placement="top">
              <el-button link type="primary" icon="List" @click="openItemDrawer(scope.row)" v-hasPermi="['rec:recIntrospect:list']" />
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recIntrospect:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recIntrospect:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input ref="titleInputRef" v-model="form.title" placeholder="例如：情绪控制" />
        </el-form-item>
        <el-form-item label="生效" prop="status">
          <el-switch v-model="form.status" active-value="active" inactive-value="inactive" />
          <span class="ml-2 text-xs text-gray-400">同时只能有一条生效</span>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="itemDrawer.visible" :title="'维护明细：' + itemDrawer.title" size="480px" append-to-body>
      <el-form inline>
        <el-form-item label="日期">
          <el-date-picker v-model="itemDrawer.occurDate" type="date" value-format="YYYY-MM-DD" @change="loadItems" />
        </el-form-item>
      </el-form>
      <el-table v-loading="itemDrawer.loading" :data="itemDrawer.list" size="small">
        <el-table-column label="#" type="index" width="50" align="center" />
        <el-table-column label="情况" prop="content" show-overflow-tooltip min-width="200" />
        <el-table-column label="操作" width="90" align="center">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEditItem(scope.row)" v-hasPermi="['rec:recIntrospect:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDeleteItem(scope.row)" v-hasPermi="['rec:recIntrospect:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-form class="mt-4" ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="80px">
        <el-form-item label="情况" prop="content">
          <el-input v-model="itemForm.content" type="textarea" :rows="3" placeholder="记录当天发生的情况" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="itemDrawer.saving" @click="submitItem">{{ itemForm.id ? '保存修改' : '新增一条' }}</el-button>
          <el-button v-if="itemForm.id" @click="resetItemForm">取消编辑</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup name="RecIntrospect" lang="ts">
import {
  addRecIntrospect,
  addRecIntrospectItem,
  delRecIntrospect,
  delRecIntrospectItem,
  getRecIntrospect,
  listRecIntrospect,
  listRecIntrospectItem,
  updateRecIntrospect,
  updateRecIntrospectItem,
  updateRecIntrospectStatus
} from '@/api/rec/recIntrospect';
import { RecIntrospectForm, RecIntrospectItemForm, RecIntrospectItemVO, RecIntrospectQuery, RecIntrospectVO } from '@/api/rec/recIntrospect/types';
import { checkPermi } from '@/utils/permission';
import { ElInput } from 'element-plus';
import { getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from 'vue';

interface ExpandDay {
  date: string;
  day: string;
  monthLabel: string;
  year: string;
  list: RecIntrospectItemVO[];
  open: boolean;
}

interface ExpandState {
  loading: boolean;
  month: string;
  dates: ExpandDay[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const introspectList = ref<RecIntrospectVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const itemFormRef = ref<ElFormInstance>();
const titleInputRef = ref<InstanceType<typeof ElInput> | null>(null);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const todayStr = () => {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
};

const currentMonth = () => todayStr().slice(0, 7);

const monthBounds = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  const begin = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { occurDateBegin: begin, occurDateEnd: end };
};

const itemDrawer = reactive({
  visible: false,
  loading: false,
  saving: false,
  title: '',
  introspectId: undefined as string | number | undefined,
  occurDate: todayStr(),
  list: [] as RecIntrospectItemVO[]
});

const expandMap = ref<Record<string, ExpandState>>({});

const emptyExpand = (): ExpandState => ({ loading: false, month: currentMonth(), dates: [] });

const expandOf = (id: string | number): ExpandState => {
  return expandMap.value[String(id)] || emptyExpand();
};

const formatOccurDate = (value?: string | Date | number) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    const matched = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matched) {
      return matched[1];
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const splitDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return {
    year: year || '',
    monthLabel: month ? `${Number(month)}月` : '',
    day: day || ''
  };
};

const groupByDate = (items: RecIntrospectItemVO[], keepOpen?: Set<string>): ExpandDay[] => {
  const grouped = new Map<string, RecIntrospectItemVO[]>();
  items.forEach((item) => {
    const date = formatOccurDate(item.occurDate);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(item);
  });
  return Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, list]) => ({
      date,
      ...splitDate(date),
      list,
      open: keepOpen?.has(date) || false
    }));
};

const loadExpand = async (id: string | number, month?: string) => {
  const key = String(id);
  const ym = month || expandMap.value[key]?.month || currentMonth();
  const monthChanged = expandMap.value[key]?.month !== ym;
  const prevOpen = monthChanged ? new Set<string>() : new Set((expandMap.value[key]?.dates || []).filter((day) => day.open).map((day) => day.date));
  expandMap.value[key] = { loading: true, month: ym, dates: expandMap.value[key]?.dates || [] };
  try {
    const res = await listRecIntrospectItem({
      pageNum: 1,
      pageSize: 1000,
      introspectId: id,
      ...monthBounds(ym)
    });
    expandMap.value[key] = { loading: false, month: ym, dates: groupByDate(res.rows || [], prevOpen) };
  } catch {
    expandMap.value[key] = { loading: false, month: ym, dates: [] };
  }
};

const onExpandChange = async (row: RecIntrospectVO, expandedRows: RecIntrospectVO[]) => {
  const opened = expandedRows.some((item) => item.id === row.id);
  if (opened) {
    await loadExpand(row.id);
  }
};

const toggleDay = (id: string | number, date: string) => {
  const state = expandMap.value[String(id)];
  if (!state) {
    return;
  }
  state.dates = state.dates.map((day) => (day.date === date ? { ...day, open: !day.open } : day));
};

const initFormData: RecIntrospectForm = {
  id: undefined,
  title: undefined,
  status: 'inactive',
  sortOrder: 0
};

const data = reactive<PageData<RecIntrospectForm, RecIntrospectQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    status: undefined
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const itemForm = ref<RecIntrospectItemForm>({
  id: undefined,
  introspectId: undefined,
  occurDate: todayStr(),
  content: undefined
});

const itemRules = {
  content: [{ required: true, message: '情况说明不能为空', trigger: 'blur' }]
};

const getList = async () => {
  loading.value = true;
  const res = await listRecIntrospect(queryParams.value);
  introspectList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleDialogOpened = () => {
  nextTick(() => titleInputRef.value?.input?.focus());
};

const reset = () => {
  form.value = { ...initFormData };
  formRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: RecIntrospectVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加自省主题';
};

const handleUpdate = async (row?: RecIntrospectVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getRecIntrospect(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改自省主题';
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateRecIntrospect(form.value);
      } else {
        await addRecIntrospect(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: RecIntrospectVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除自省主题"' + (row?.title || '选中') + '"？');
  await delRecIntrospect(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleStatusChange = async (row: RecIntrospectVO, active: boolean) => {
  const status = active ? 'active' : 'inactive';
  try {
    if (active) {
      await proxy?.$modal.confirm('生效「' + row.title + '」后，其它主题将失效，是否继续？');
    }
    await updateRecIntrospectStatus(row.id, status);
    proxy?.$modal.msgSuccess(active ? '已生效' : '已失效');
    await getList();
  } catch {
    // 取消确认或接口失败时，开关仍以列表中的 status 为准
  }
};

const openItemDrawer = (row: RecIntrospectVO) => {
  itemDrawer.visible = true;
  itemDrawer.title = row.title;
  itemDrawer.introspectId = row.id;
  itemDrawer.occurDate = todayStr();
  resetItemForm();
  loadItems();
};

const loadItems = async () => {
  if (!itemDrawer.introspectId || !itemDrawer.occurDate) {
    return;
  }
  itemDrawer.loading = true;
  try {
    const res = await listRecIntrospectItem({
      pageNum: 1,
      pageSize: 100,
      introspectId: itemDrawer.introspectId,
      occurDate: itemDrawer.occurDate
    });
    itemDrawer.list = res.rows || [];
    if (itemDrawer.introspectId) {
      await loadExpand(itemDrawer.introspectId);
    }
  } finally {
    itemDrawer.loading = false;
  }
};

const resetItemForm = () => {
  itemForm.value = {
    id: undefined,
    introspectId: itemDrawer.introspectId,
    occurDate: itemDrawer.occurDate,
    content: undefined
  };
  itemFormRef.value?.resetFields();
};

const handleEditItem = (row: RecIntrospectItemVO) => {
  itemForm.value = {
    id: row.id,
    introspectId: row.introspectId,
    occurDate: itemDrawer.occurDate,
    content: row.content,
    sortOrder: row.sortOrder
  };
};

const handleDeleteItem = async (row: RecIntrospectItemVO) => {
  await proxy?.$modal.confirm('是否删除该条情况？');
  await delRecIntrospectItem(row.id);
  proxy?.$modal.msgSuccess('删除成功');
  resetItemForm();
  await loadItems();
};

const submitItem = () => {
  itemFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    itemDrawer.saving = true;
    itemForm.value.introspectId = itemDrawer.introspectId;
    itemForm.value.occurDate = itemDrawer.occurDate;
    try {
      if (itemForm.value.id) {
        await updateRecIntrospectItem(itemForm.value);
      } else {
        await addRecIntrospectItem(itemForm.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      resetItemForm();
      await loadItems();
    } finally {
      itemDrawer.saving = false;
    }
  });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" src="@/assets/styles/vue-column.scss" />

<style scoped>
.expand-wrap {
  padding: 8px 24px 16px 56px;
  background: linear-gradient(180deg, #f7f9fc 0%, #fff 100%);
}
.expand-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.expand-filter-label {
  color: #606266;
  font-size: 13px;
}
.expand-empty {
  color: #909399;
  font-size: 13px;
  padding: 12px 0;
}
.day-card {
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}
.day-card.open {
  border-color: #d6e8ff;
}
.day-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
}
.day-head:hover {
  background: #f5f9ff;
}
.day-date {
  display: flex;
  align-items: center;
  min-width: 76px;
  padding: 4px 10px;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
}
.day-num {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin-right: 8px;
}
.day-meta {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  line-height: 1.3;
  font-weight: 500;
}
.day-head-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.day-full {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}
.day-count {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f2f5;
  color: #606266;
  font-size: 12px;
}
.day-card.open .day-count {
  background: #ecf5ff;
  color: #409eff;
}
.day-arrow {
  width: 8px;
  height: 8px;
  border-right: 2px solid #c0c4cc;
  border-bottom: 2px solid #c0c4cc;
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
}
.day-arrow.open {
  transform: rotate(45deg);
}
.day-body {
  padding: 0 16px 12px;
  border-top: 1px solid #f0f2f5;
}
.item-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
}
.item-row:last-child {
  border-bottom: none;
  padding-bottom: 2px;
}
.item-index {
  flex: 0 0 22px;
  height: 22px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.item-text {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
