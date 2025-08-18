<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="事件" prop="dayMatterId">
              <el-select v-model="queryParams.dayMatterId" placeholder="请选择事件" clearable filterable style="width: 200px">
                <el-option v-for="dayName in dayNameOptions" :key="dayName.id" :label="dayName.dayName" :value="dayName.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="分组" prop="groupId">
              <el-select v-model="queryParams.groupId" placeholder="请选择分组" clearable style="width: 200px">
                <el-option v-for="group in groupOptions" :key="group.id" :label="`${group.groupName}（${group.groupCode}）`" :value="group.id" />
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
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="事件ID" align="center" prop="dayMatterId" v-if="false" />
        <el-table-column label="事件名" align="center" prop="dayName" min-width="100" />
        <el-table-column label="分组ID" align="center" prop="groupId" v-if="false" />
        <el-table-column label="分组名" align="center" prop="groupName" min-width="100" />
        <el-table-column label="分组编码" align="center" prop="groupCode" min-width="100" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgMatterGroup:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['msg:msgMatterGroup:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgMatterGroup:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加事件组对话框 -->
    <el-dialog :title="addDialog.title" v-model="addDialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="事件" prop="dayMatterIdList">
          <el-select
            class="form-input"
            v-model="addForm.dayMatterIdList"
            placeholder="请选择事件"
            clearable
            filterable
            multiple
            :disabled="isDetailView"
          >
            <template #prefix>
              <i class="iconfont icon-shijianming"></i>
            </template>
            <el-option v-for="dayName in dayNameOptions" :key="dayName.id" :label="dayName.dayName" :value="dayName.id" />
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 2px" label="分组" prop="groupIdList">
          <el-select class="form-input" v-model="addForm.groupIdList" placeholder="请选择分组" clearable filterable multiple :disabled="isDetailView">
            <template #prefix>
              <i class="iconfont icon-renyuanfenzu"></i>
            </template>
            <el-option v-for="group in groupOptions" :key="group.id" :label="`${group.groupName}（${group.groupCode}）`" :value="group.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!isDetailView" :loading="buttonLoading" type="primary" @click="submitAddForm">确 定</el-button>
          <el-button @click="cancelAdd">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改事件组对话框 -->
    <el-dialog :title="editDialog.title" v-model="editDialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="事件" prop="dayMatterId">
          <el-select class="form-input" v-model="editForm.dayMatterId" placeholder="请选择事件" clearable filterable :disabled="isDetailView">
            <template #prefix>
              <i class="iconfont icon-shijianming"></i>
            </template>
            <el-option v-for="dayName in dayNameOptions" :key="dayName.id" :label="dayName.dayName" :value="dayName.id" />
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 2px" label="分组" prop="groupId">
          <el-select class="form-input" v-model="editForm.groupId" placeholder="请选择分组" clearable filterable :disabled="isDetailView">
            <template #prefix>
              <i class="iconfont icon-renyuanfenzu"></i>
            </template>
            <el-option v-for="group in groupOptions" :key="group.id" :label="`${group.groupName}（${group.groupCode}）`" :value="group.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!isDetailView" :loading="buttonLoading" type="primary" @click="submitEditForm">确 定</el-button>
          <el-button @click="cancelEdit">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MsgMatterGroup" lang="ts">
import { listMsgMatterGroup, getMsgMatterGroup, delMsgMatterGroup, addMsgMatterGroup, updateMsgMatterGroup } from '@/api/msg/msgMatterGroup';
import { MsgMatterGroupVO, MsgMatterGroupQuery, MsgMatterGroupForm } from '@/api/msg/msgMatterGroup/types';
import { DayNameVo, GroupVo } from '@/api/msg/common/types';
import { dayNameList, groupCodeList } from '@/api/msg/common';
import { ref } from 'vue';

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
const isDetailView = ref(false); // 是否为详情查看模式

// 定义分组列表数据
const dayNameOptions = ref<DayNameVo[]>([]);
const groupOptions = ref<GroupVo[]>([]);

// 获取分组列表
const fetchGroupAndDayNameOptions = async () => {
  const res = await dayNameList();
  dayNameOptions.value = res.data || [];
  const user = await groupCodeList();
  groupOptions.value = user.data || [];
};

// 页面加载时获取分组数据
onMounted(() => {
  getList();
  fetchGroupAndDayNameOptions();
});

const addDialog = ref<DialogOption>({
  visible: false,
  title: ''
});
const editDialog = ref<DialogOption>({
  visible: false,
  title: ''
});

// 单独定义查询参数，使用明确的类型
const queryParams = ref<MsgMatterGroupQuery>({
  pageNum: 1,
  pageSize: 10,
  dayMatterId: undefined,
  groupId: undefined,
  params: {}
});

const initFormData: MsgMatterGroupForm = {
  dayMatterId: undefined,
  groupId: undefined,
  groupIdList: [],
  dayMatterIdList: []
};

// 新增表单数据和引用
const addFormRef = ref<ElFormInstance>();
const addForm = ref<MsgMatterGroupForm>({ ...initFormData });

// 修改表单数据和引用
const editFormRef = ref<ElFormInstance>();
const editForm = ref<MsgMatterGroupForm>({ ...initFormData });

const addRules = ref({
  dayMatterIdList: [{ required: true, message: '事件不能为空', trigger: 'blur' }],
  groupIdList: [{ required: true, message: '分组不能为空', trigger: 'blur' }]
});

const editRules = ref({
  id: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
  dayMatterId: [{ required: true, message: '事件不能为空', trigger: 'blur' }],
  groupId: [{ required: true, message: '分组不能为空', trigger: 'blur' }]
});

/** 查询事件组列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMsgMatterGroup(queryParams.value);
  msgMatterGroupList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮操作 */
const cancelAdd = () => resetForm(addFormRef, addForm, addDialog);
const cancelEdit = () => resetForm(editFormRef, editForm, editDialog);

function resetForm(refForm: any, formModel: any, dialog: any) {
  refForm?.value?.resetFields();
  Object.assign(formModel.value, initFormData);
  dialog.value.visible = false;
}

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
  cancelAdd(); // 确保重置表单状态
  isDetailView.value = false;
  addDialog.value.visible = true;
  addDialog.value.title = '添加事件组';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgMatterGroupVO) => {
  cancelEdit(); // 确保重置表单状态
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getMsgMatterGroup(_id);
  Object.assign(editForm.value, res.data);
  editDialog.value.title = '修改事件组';
  editDialog.value.visible = true;
};

/** 查看详情 */
const handleDetail = async (row?: MsgMatterGroupVO) => {
  cancelEdit(); // 确保重置表单状态
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getMsgMatterGroup(_id);
  Object.assign(editForm.value, res.data);
  editDialog.value.visible = true;
  editDialog.value.title = '用户事件详情';
};

/** 提交按钮 */
const submitAddForm = () => {
  addFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await addMsgMatterGroup(addForm.value).finally(() => (buttonLoading.value = false));
      proxy?.$modal.msgSuccess('操作成功');
      addDialog.value.visible = false;
      await getList();
    }
  });
};

/** 修改按钮 */
const submitEditForm = () => {
  editFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm.value.dayMatterIdList = [editForm.value.dayMatterId];
      editForm.value.groupIdList = [editForm.value.groupId];
      await updateMsgMatterGroup(editForm.value).finally(() => (buttonLoading.value = false));
      proxy?.$modal.msgSuccess('操作成功');
      editDialog.value.visible = false;
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
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
