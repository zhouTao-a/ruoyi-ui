<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="事件ID" prop="matterId">
              <el-input v-model="queryParams.matterId" placeholder="请输入事件ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分组ID" prop="groupId">
              <el-input v-model="queryParams.groupId" placeholder="请输入分组ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['msg:msgMatterGroup:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['msg:msgMatterGroup:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['msg:msgMatterGroup:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['msg:msgMatterGroup:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="msgMatterGroupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="事件ID" align="center" prop="matterId" />
        <el-table-column label="分组ID" align="center" prop="groupId" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgMatterGroup:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgMatterGroup:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改事件组对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="msgMatterGroupFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="事件ID" prop="matterId">
          <el-input v-model="form.matterId" placeholder="请输入事件ID" />
        </el-form-item>
        <el-form-item label="分组ID" prop="groupId">
          <el-input v-model="form.groupId" placeholder="请输入分组ID" />
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

<script setup name="MsgMatterGroup" lang="ts">
import { listMsgMatterGroup, getMsgMatterGroup, delMsgMatterGroup, addMsgMatterGroup, updateMsgMatterGroup } from '@/api/msg/msgMatterGroup';
import { MsgMatterGroupVO, MsgMatterGroupQuery, MsgMatterGroupForm } from '@/api/msg/msgMatterGroup/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const msgMatterGroupList = ref<MsgMatterGroupVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const msgMatterGroupFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MsgMatterGroupForm = {
  matterId: undefined,
  groupId: undefined
};
const data = reactive<PageData<MsgMatterGroupForm, MsgMatterGroupQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    matterId: undefined,
    groupId: undefined,
    params: {}
  },
  rules: {
    matterId: [{ required: true, message: '事件ID不能为空', trigger: 'blur' }],
    groupId: [{ required: true, message: '分组ID不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询事件组列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMsgMatterGroup(queryParams.value);
  msgMatterGroupList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  msgMatterGroupFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: MsgMatterGroupVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加事件组';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgMatterGroupVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getMsgMatterGroup(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改事件组';
};

/** 提交按钮 */
const submitForm = () => {
  msgMatterGroupFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMsgMatterGroup(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMsgMatterGroup(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MsgMatterGroupVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除事件组"' + (row?.id || '选中') + '"的数据项？').finally(() => (loading.value = false));
  await delMsgMatterGroup(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'msg/msgMatterGroup/export',
    {
      ...queryParams.value
    },
    `msgMatterGroup_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
