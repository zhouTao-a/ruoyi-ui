<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="分组名称" prop="groupName">
              <el-input v-model="queryParams.groupName" placeholder="请输入分组名称" clearable @keyup.enter="handleQuery" style="width: 200px" />
            </el-form-item>
            <el-form-item label="分组编码" prop="groupCode">
              <el-input v-model="queryParams.groupCode" placeholder="请输入分组编码" clearable @keyup.enter="handleQuery" style="width: 200px" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['msg:msgGroup:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['msg:msgGroup:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['msg:msgGroup:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['msg:msgGroup:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="msgGroupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="分组名称" align="center" prop="groupName" min-width="100" />
        <el-table-column label="分组编码" align="center" prop="groupCode" min-width="100" />
        <el-table-column label="默认参考用户ID" align="center" prop="defaultTargetUserId" v-if="false" />
        <el-table-column label="参考用户名称" align="center" prop="defaultTargetUserName" min-width="100" v-if="false" />
        <el-table-column label="参考用户代码" align="center" prop="defaultTargetUserCode" min-width="100" v-if="false" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="100">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgGroup:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['msg:msgUser:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgGroup:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改分组信息对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="msgGroupFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input class="form-input" :disabled="isDetailView" ref="groupNameInputRef" v-model="form.groupName" placeholder="请输入分组名称">
            <template #prefix>
              <i class="iconfont icon-renyuanfenzu"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 2px" label="分组编码" prop="groupCode">
          <el-input class="form-input" :disabled="isDetailView" v-model="form.groupCode" placeholder="请输入分组编码">
            <template #prefix>
              <i class="iconfont icon-renyuanfenzu"></i>
            </template>
          </el-input>
        </el-form-item>
        <!--        <el-form-item style="margin-bottom: 2px" label="参考用户" prop="defaultTargetUserId">-->
        <!--          <el-select-->
        <!--            class="form-input"-->
        <!--            :disabled="isDetailView"-->
        <!--            v-model="form.defaultTargetUserId"-->
        <!--            placeholder="请选择参考用户"-->
        <!--            filterable-->
        <!--            remote-->
        <!--            clearable-->
        <!--            :remote-method="fetchUserOptions"-->
        <!--            :loading="loadingUser"-->
        <!--            :default-first-option="true"-->
        <!--            @change="handleUserChange"-->
        <!--            @blur="handleUserBlur"-->
        <!--          >-->
        <!--            <el-option v-for="user in userOptions" :key="user.id" :label="`${user.userName}（${user.userCode}）`" :value="user.id" />-->
        <!--            <template #prefix>-->
        <!--              <i class="iconfont icon-xingming"></i>-->
        <!--            </template>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="primary-btn" :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isDetailView">确 定</el-button>
          <el-button class="cancel-btn" @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MsgGroup" lang="ts">
import { listMsgGroup, getMsgGroup, delMsgGroup, addMsgGroup, updateMsgGroup } from '@/api/msg/msgGroup';
import { userCodeList } from '@/api/msg/common';
import { UserVo } from '@/api/msg/common/types';
import { MsgGroupVO, MsgGroupQuery, MsgGroupForm } from '@/api/msg/msgGroup/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const msgGroupList = ref<MsgGroupVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const msgGroupFormRef = ref<ElFormInstance>();

const groupNameInputRef = ref<InstanceType<typeof ElInput> | null>(null); // 声明 ref
// 处理对话框完全打开事件
const handleDialogOpened = () => {
  nextTick(() => {
    if (groupNameInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = groupNameInputRef.value.input;
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

// 用于存储用户下拉选项列表，类型为 UserVo 数组
const userOptions = ref<UserVo[]>([]);

// 用于控制用户下拉加载状态（加载动画）
const loadingUser = ref(false);

// 异步函数：根据查询关键词从后台获取用户列表，下拉框用
const fetchUserOptions = async (query: string) => {
  loadingUser.value = true; // 开始加载，显示 loading 动画
  try {
    // 调用接口获取用户列表，如果没输入 query 就查全部用户
    const res = await userCodeList({ userName: query || '' });
    // 将获取到的数据赋值给 userOptions，下拉列表使用
    userOptions.value = res.data || [];
  } finally {
    loadingUser.value = false; // 不管成功还是失败，最后都关闭 loading
  }
};

// 当用户从下拉列表中选择某个用户后触发的函数
// 功能：根据选中的用户 id 找到对应的用户对象，然后设置 userCode 到表单中
const handleUserChange = (selectedId: string | number) => {
  // 在 userOptions 中找到匹配的用户对象
  const selectedUser = userOptions.value.find((user) => user.id === selectedId);
  // 将该用户的 userCode 设置到 form 表单的 defaultTargetUserCode 字段
  form.value.defaultTargetUserCode = selectedUser?.userCode || '';
  form.value.defaultTargetUserName = selectedUser?.userName || '';
};

// 当用户下拉框失去焦点时触发的校验函数
// 功能：确保用户是从下拉中选的而不是手动输入了一个无效的值
const handleUserBlur = () => {
  // 查找当前 form 中 defaultTargetUserId 对应的用户是否存在于下拉选项中
  const matched = userOptions.value.find((user) => user.id === form.value.defaultTargetUserId);
  if (!matched) {
    // 如果没找到，说明没从下拉里选，手动清空表单中相关字段
    form.value.defaultTargetUserId = '';
    form.value.defaultTargetUserCode = '';
  }
};

const initFormData: MsgGroupForm = {
  id: undefined,
  groupName: undefined,
  groupCode: undefined,
  defaultTargetUserId: undefined,
  defaultTargetUserCode: '',
  defaultTargetUserName: ''
};
const data = reactive<PageData<MsgGroupForm, MsgGroupQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupName: undefined,
    groupCode: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    groupName: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }],
    groupCode: [{ required: true, message: '分组编码不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询分组信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMsgGroup(queryParams.value);
  msgGroupList.value = res.rows;
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
  msgGroupFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: MsgGroupVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isDetailView.value = false;
  dialog.visible = true;
  dialog.title = '添加分组信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgGroupVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getMsgGroup(_id);
  Object.assign(form.value, res.data);

  if (form.value.defaultTargetUserId) {
    // 加载并包含该用户
    const userRes = await userCodeList({ id: form.value.defaultTargetUserId });
    userOptions.value = userRes.data || [];
  }

  dialog.visible = true;
  dialog.title = '修改分组信息';
};

const isDetailView = ref(false); // 是否为详情查看模式

/** 查看详情按钮操作 */
const handleDetail = async (row?: MsgGroupVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getMsgGroup(_id);
  Object.assign(form.value, res.data);

  if (form.value.defaultTargetUserId) {
    // 加载并包含该用户
    const userRes = await userCodeList({ id: form.value.defaultTargetUserId });
    userOptions.value = userRes.data || [];
  }

  dialog.visible = true;
  dialog.title = '分组信息详情';
};

/** 提交按钮 */
const submitForm = () => {
  msgGroupFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMsgGroup(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMsgGroup(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MsgGroupVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除分组信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delMsgGroup(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'msg/msgGroup/export',
    {
      ...queryParams.value
    },
    `msgGroup_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
