<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="父目标" prop="parentId">
              <el-input v-model="queryParams.parentId" placeholder="请输入父目标" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="截止日期" style="width: 308px">
              <el-date-picker
                v-model="dateRangedeadLine"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
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
      >
        <el-table-column label="父目标" align="center" prop="parentId" />
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="进度" align="center" prop="progress" />
        <el-table-column label="状态" align="center" prop="status" />
        <el-table-column label="截止日期" align="center" prop="deadLine" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deadLine, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recGoal:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['rec:recGoal:add']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recGoal:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改目标对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="recGoalFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父目标" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="recGoalOptions"
            :props="{ value: 'id', label: 'title', children: 'children' }"
            value-key="id"
            placeholder="请选择父目标"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="进度" prop="progress">
          <el-input v-model="form.progress" placeholder="请输入进度" />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadLine">
          <el-date-picker clearable
            v-model="form.deadLine"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择截止日期"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RecGoal" lang="ts">
import { listRecGoal, getRecGoal, delRecGoal, addRecGoal, updateRecGoal } from "@/api/rec/recGoal";
import { RecGoalVO, RecGoalQuery, RecGoalForm } from '@/api/rec/recGoal/types';

type RecGoalOption = {
  id: number;
  title: string;
  children?: RecGoalOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;


const recGoalList = ref<RecGoalVO[]>([]);
const recGoalOptions = ref<RecGoalOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const recGoalFormRef = ref<ElFormInstance>();
const recGoalTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});

const dateRangedeadLine = ref<[DateModelType, DateModelType]>(['', '']);

const initFormData: RecGoalForm = {
    parentId: undefined,
    title: undefined,
    description: undefined,
    progress: undefined,
    status: undefined,
    deadLine: undefined,
    sortOrder: undefined,
}

const data = reactive<PageData<RecGoalForm, RecGoalQuery>>({
  form: {...initFormData},
  queryParams: {
    parentId: undefined,
    title: undefined,
    status: undefined,
    params: {
      deadLine: undefined,
    }
  },
  rules: {
    title: [
      { required: true, message: "标题不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询目标列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangedeadLine.value, 'deadLine');
  const res = await listRecGoal(queryParams.value);
  const data = proxy?.handleTree<RecGoalVO>(res.data, "id", "parentId");
  if (data) {
    recGoalList.value = data;
    loading.value = false;
  }
}

/** 查询目标下拉树结构 */
const getTreeselect = async () => {
  const res = await listRecGoal();
  recGoalOptions.value = [];
  const data: RecGoalOption = { id: 0, title: '顶级节点', children: [] };
  data.children = proxy?.handleTree<RecGoalOption>(res.data, "id", "parentId");
  recGoalOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  recGoalFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangedeadLine.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: RecGoalVO) => {
  reset();
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加目标";
}

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(recGoalList.value, isExpandAll.value)
}

/** 展开/折叠操作 */
const toggleExpandAll = (data: RecGoalVO[], status: boolean) => {
  data.forEach((item) => {
    recGoalTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: RecGoalVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getRecGoal(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改目标";
}

/** 提交按钮 */
const submitForm = () => {
  recGoalFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRecGoal(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addRecGoal(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: RecGoalVO) => {
  await proxy?.$modal.confirm('是否确认删除目标编号为"' + row.id + '"的数据项？');
  loading.value = true;
  await delRecGoal(row.id).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
}

onMounted(() => {
  getList();
});
</script>
