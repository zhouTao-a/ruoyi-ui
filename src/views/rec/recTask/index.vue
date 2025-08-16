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
                v-model="dateRangeDeadLine"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['rec:recTask:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['rec:recTask:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['rec:recTask:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['rec:recTask:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="recTaskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="标题" align="center" show-overflow-tooltip prop="title" min-width="120" />
        <el-table-column label="描述" align="center" show-overflow-tooltip prop="description" min-width="240" />
        <el-table-column label="状态" align="center" prop="status" min-width="80" fixed="right">
          <template #default="scope">
            <dict-tag :options="task_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="进度" align="center" prop="progress" min-width="80" />
        <el-table-column label="截止日期" align="center" prop="deadLine" min-width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deadLine, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优先级" align="center" prop="priority">
          <template #default="scope">
            <dict-tag :options="priority" :value="scope.row.priority" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recTask:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['msg:msgUser:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recTask:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改任务对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="recTaskFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input ref="titleInputRef" v-model="form.title" placeholder="请输入标题" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" :disabled="isDetailView">
            <el-option v-for="dict in task_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
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
            :disabled="isDetailView"
            clearable
            v-model="form.deadLine"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择截止日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="优先级" prop="priority" style="width: 100%">
          <el-select v-model="form.priority" placeholder="请选择优先级" :disabled="isDetailView">
            <el-option v-for="dict in priority" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description" style="margin-bottom: 2px; width: 100%">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" :rows="10" :disabled="isDetailView" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isDetailView">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RecTask" lang="ts">
import { listRecTask, getRecTask, delRecTask, addRecTask, updateRecTask } from '@/api/rec/recTask';
import { RecTaskVO, RecTaskQuery, RecTaskForm } from '@/api/rec/recTask/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { task_status } = toRefs<any>(proxy?.useDict('task_status'));
const { priority } = toRefs<any>(proxy?.useDict('priority'));

const recTaskList = ref<RecTaskVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeDeadLine = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const recTaskFormRef = ref<ElFormInstance>();
const isDetailView = ref(false); // 是否为详情查看模式

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RecTaskForm = {
  id: undefined,
  title: undefined,
  description: undefined,
  status: undefined,
  progress: undefined,
  deadLine: undefined,
  priority: undefined
};
const data = reactive<PageData<RecTaskForm, RecTaskQuery>>({
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
    description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
    priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.beginDeadLine = dateRangeDeadLine.value[0];
  queryParams.value.endDeadLine = dateRangeDeadLine.value[1];
  const res = await listRecTask(queryParams.value);
  recTaskList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const titleInputRef = ref<InstanceType<typeof ElInput> | null>(null);
const handleDialogOpened = () => {
  console.log('handleDialogOpened');
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

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  recTaskFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeDeadLine.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: RecTaskVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isDetailView.value = false;
  form.value.priority = 'high';
  form.value.status = 'pending';
  dialog.visible = true;
  dialog.title = '添加任务';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: RecTaskVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getRecTask(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改任务';
};

/** 查询详情 */
const handleDetail = async (row?: RecTaskVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getRecTask(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '查看任务';
};

/** 提交按钮 */
const submitForm = () => {
  recTaskFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRecTask(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRecTask(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RecTaskVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除任务标题为"' + (row?.title || '选中') + '"的数据项？').finally(() => (loading.value = false));
  await delRecTask(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'rec/recTask/export',
    {
      ...queryParams.value
    },
    `recTask_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
