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
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option style="width: 200px" v-for="dict in task_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="截止日期" style="width: 308px">
              <el-date-picker
                style="width: 200px"
                v-model="dateRangeDeadLine"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1), new Date(2000, 1, 1)]"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['rec:recGoal:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">展开/折叠</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Finished" :disabled="multiple" @click="openBatchStatus" v-hasPermi="['rec:recGoal:edit']"
              >修改状态</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="recGoalTableRef"
        v-loading="loading"
        :data="recGoalList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="父目标" align="center" prop="parentId" v-if="false" />
        <el-table-column label="层级" align="center" prop="level" v-if="false" />
        <el-table-column label="顶层ID" align="center" prop="topId" v-if="false" />
        <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip min-width="120px" />
        <el-table-column label="内容" align="center" prop="content" show-overflow-tooltip min-width="200px" />
        <el-table-column label="进度" align="center" prop="progress" show-overflow-tooltip min-width="60px" />
        <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip min-width="60px">
          <template #default="scope">
            <dict-tag :options="task_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="截止日期" align="center" prop="deadLine" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deadLine, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" show-overflow-tooltip min-width="60px" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150px" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recGoal:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['rec:recGoal:add']" />
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['rec:recGoal:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recGoal:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改目标对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="recGoalFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父目标" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="recGoalOptions"
            :props="{ value: 'id', label: 'title', children: 'children' }"
            value-key="id"
            placeholder="请选择父目标"
            check-strictly
            :disabled="isDetailView"
          />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input ref="titleInputRef" v-model="form.title" placeholder="请输入标题" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入内容" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="进度" prop="progress">
          <el-input-number
            :disabled="isDetailView"
            style="width: 100%"
            v-model="form.progress"
            :min="0"
            :max="100"
            :step="1"
            placeholder="请输入进度"
          />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadLine">
          <el-date-picker
            style="width: 100%"
            clearable
            v-model="form.deadLine"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择截止日期"
            :disabled="isDetailView"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            :disabled="isDetailView"
            style="width: 100%"
            v-model="form.sortOrder"
            :min="0"
            :max="100"
            :step="1"
            placeholder="请输入排序"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status" style="margin-bottom: 2px">
          <el-select v-model="form.status" placeholder="请选择状态" :disabled="isDetailView">
            <el-option v-for="dict in task_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isDetailView">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="批量修改状态" v-model="batchStatusDialog.visible" width="400px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="batchStatusDialog.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="dict in task_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchStatusDialog.visible = false">取 消</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitBatchStatus">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RecGoal" lang="ts">
import { listRecGoal, getRecGoal, delRecGoal, addRecGoal, updateRecGoal, batchUpdateRecGoalStatus } from '@/api/rec/recGoal';
import { RecGoalVO, RecGoalQuery, RecGoalForm } from '@/api/rec/recGoal/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';

type RecGoalOption = {
  id: number;
  title: string;
  children?: RecGoalOption[];
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const recGoalList = ref<RecGoalVO[]>([]);
const recGoalOptions = ref<RecGoalOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);

const queryFormRef = ref<ElFormInstance>();
const recGoalFormRef = ref<ElFormInstance>();
const recGoalTableRef = ref<ElTableInstance>();

const { task_status } = toRefs<any>(proxy?.useDict('task_status'));
const isDetailView = ref(false); // 是否为详情查看模式
const batchStatusDialog = reactive({
  visible: false,
  status: ''
});
const dateRangeDeadLine = ref<[DateModelType, DateModelType]>(['', '']);
const titleInputRef = ref<InstanceType<typeof ElInput> | null>(null);

const handleDialogOpened = () => {
  nextTick(() => {
    if (titleInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = titleInputRef.value.input;
      if (inputEl) {
        inputEl.focus();
      }
    }
  });
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RecGoalForm = {
  id: undefined,
  level: undefined,
  topId: undefined,
  parentId: undefined,
  title: undefined,
  content: undefined,
  progress: undefined,
  status: undefined,
  deadLine: undefined,
  sortOrder: undefined
};

const data = reactive<PageData<RecGoalForm, RecGoalQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    status: undefined,
    beginDeadLine: undefined,
    endDeadLine: undefined
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
    progress: [{ required: true, message: '进度不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
    deadLine: [{ required: true, message: '截止日期不能为空', trigger: 'blur' }],
    sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
    parentId: [{ required: true, message: '父目标不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询目标列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.beginDeadLine = dateRangeDeadLine.value[0];
  queryParams.value.endDeadLine = dateRangeDeadLine.value[1];
  const res = await listRecGoal(queryParams.value);
  const data = proxy?.handleTree<RecGoalVO>(res.rows, 'id', 'parentId');
  if (data) {
    recGoalList.value = data;
    total.value = res.total;
    loading.value = false;
  }
};

/** 查询目标下拉树结构 */
const getTreeSelect = async () => {
  const res = await listRecGoal();
  recGoalOptions.value = [];
  const data: RecGoalOption = { id: 0, title: '顶级节点', children: [] };
  data.children = proxy?.handleTree<RecGoalOption>(res.rows, 'id', 'parentId');
  recGoalOptions.value.push(data);
};

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
};

// 表单重置
const reset = () => {
  form.value = { ...initFormData };
  recGoalFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeDeadLine.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: RecGoalVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

/** 批量修改状态 */
const openBatchStatus = () => {
  if (!ids.value.length) {
    proxy?.$modal.msgWarning('请先选择目标');
    return;
  }
  batchStatusDialog.status = '';
  batchStatusDialog.visible = true;
};

const submitBatchStatus = async () => {
  if (!batchStatusDialog.status) {
    proxy?.$modal.msgWarning('请选择状态');
    return;
  }
  buttonLoading.value = true;
  await batchUpdateRecGoalStatus(ids.value, batchStatusDialog.status).finally(() => (buttonLoading.value = false));
  proxy?.$modal.msgSuccess('修改成功');
  batchStatusDialog.visible = false;
  await getList();
};

/** 新增按钮操作 */
const handleAdd = (row?: RecGoalVO) => {
  reset();
  isDetailView.value = false;
  getTreeSelect();
  form.value.sortOrder = 0;
  form.value.progress = 0;
  form.value.status = 'pending';
  form.value.deadLine = new Date().toISOString().split('T')[0];
  if (row != null && row.id) {
    form.value.parentId = row.id;
    if (row.topId == 0) {
      form.value.topId = row.id;
    } else {
      form.value.topId = row.topId;
    }
    form.value.level = row.level + 1;
  } else {
    form.value.parentId = 0;
    form.value.topId = 0;
    form.value.level = 1;
  }
  dialog.visible = true;
  dialog.title = '添加目标';
};

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(recGoalList.value, isExpandAll.value);
};

/** 展开/折叠操作 */
const toggleExpandAll = (data: RecGoalVO[], status: boolean) => {
  data.forEach((item) => {
    recGoalTableRef.value?.toggleRowExpansion(item, status);
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status);
  });
};

/** 修改按钮操作 */
const handleUpdate = async (row: RecGoalVO) => {
  reset();
  isDetailView.value = false;
  await getTreeSelect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getRecGoal(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改目标';
};

/** 查看详情操作 */
const handleDetail = async (row: RecGoalVO) => {
  reset();
  isDetailView.value = true;
  await getTreeSelect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getRecGoal(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '目标详情';
};

/** 提交按钮 */
const submitForm = () => {
  recGoalFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRecGoal(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRecGoal(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row: RecGoalVO) => {
  await proxy?.$modal.confirm('是否确认删除目标标题为"' + row.title + '"的数据项？');
  loading.value = true;
  await delRecGoal(row.id).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
