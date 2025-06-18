<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户" prop="userId">
              <el-select v-model="queryParams.userId" placeholder="请选择用户" clearable filterable style="width: 200px">
                <el-option v-for="user in userOptions" :key="user.id" :label="`${user.userName}（${user.userCode}）`" :value="user.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="分组" prop="groupId">
              <el-select v-model="queryParams.groupId" placeholder="请选择分组" clearable style="width: 200px">
                <el-option v-for="group in groupOptions" :key="group.id" :label="`${group.groupName}（${group.groupCode}）`" :value="group.id" />
              </el-select>
            </el-form-item>
            <!--            <el-form-item label="辈分差" prop="relativeGenerationDiff">-->
            <!--              <el-input-number-->
            <!--                v-model="queryParams.relativeGenerationDiff"-->
            <!--                placeholder="请输入辈分差"-->
            <!--                :min="-100"-->
            <!--                :max="100"-->
            <!--                :step="1"-->
            <!--                controls-position="right"-->
            <!--                style="width: 200px"-->
            <!--                @keyup.enter="handleQuery"-->
            <!--              />-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="亲缘关系" prop="kinshipLevel">-->
            <!--              <el-select v-model="queryParams.kinshipLevel" placeholder="请选择亲缘关系" clearable style="width: 200px">-->
            <!--                <el-option v-for="dict in kinship_level" :key="dict.value" :label="dict.label" :value="dict.value" />-->
            <!--              </el-select>-->
            <!--            </el-form-item>-->
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['msg:msgUserGroup:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['msg:msgUserGroup:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['msg:msgUserGroup:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['msg:msgUserGroup:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="msgUserGroupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="用户ID" align="center" prop="userId" v-if="false" />
        <el-table-column label="用户名称" align="center" prop="userName" min-width="100" />
        <el-table-column label="用户代码" align="center" prop="userCode" min-width="100" />
        <el-table-column label="分组名称" align="center" prop="groupName" min-width="100" />
        <el-table-column label="分组代码" align="center" prop="groupCode" min-width="100" />
        <el-table-column label="分组ID" align="center" prop="groupId" v-if="false" />
        <el-table-column label="辈分差" align="center" prop="relativeGenerationDiff" min-width="100" v-if="false" />
        <el-table-column label="亲缘关系" align="center" prop="kinshipLevel" min-width="100" v-if="false">
          <template #default="scope">
            <dict-tag :options="kinship_level" :value="scope.row.kinshipLevel" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgUserGroup:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['msg:msgUser:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgUserGroup:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改用户组对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="400px" append-to-body>
      <el-form class="card-container" ref="msgUserGroupFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户" prop="userId">
          <el-select class="form-input" v-model="form.userId" placeholder="请选择用户" clearable filterable :disabled="isDetailView">
            <template #prefix>
              <i class="iconfont icon-xingming"></i>
            </template>
            <el-option v-for="user in userOptions" :key="user.id" :label="`${user.userName}（${user.userCode}）`" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 2px" label="分组" prop="groupId">
          <el-select class="form-input" v-model="form.groupId" placeholder="请选择分组" clearable :disabled="isDetailView">
            <template #prefix>
              <i class="iconfont icon-renyuanfenzu"></i>
            </template>
            <el-option v-for="group in groupOptions" :key="group.id" :label="`${group.groupName}（${group.groupCode}）`" :value="group.id" />
          </el-select>
        </el-form-item>
        <!--        <el-form-item label="辈分差" prop="relativeGenerationDiff">-->
        <!--          <el-input-number-->
        <!--            class="form-input"-->
        <!--            v-model="form.relativeGenerationDiff"-->
        <!--            placeholder="请输入辈分差"-->
        <!--            :min="-100"-->
        <!--            :max="100"-->
        <!--            :step="1"-->
        <!--            controls-position="right"-->
        <!--            :disabled="isDetailView"-->
        <!--          >-->
        <!--            <template #prefix>-->
        <!--              <i class="iconfont icon-beifen"></i>-->
        <!--            </template>-->
        <!--          </el-input-number>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item style="margin-bottom: 2px" label="亲缘关系" prop="kinshipLevel">-->
        <!--          <el-select class="form-input" v-model="form.kinshipLevel" placeholder="请选择亲缘关系" :disabled="isDetailView">-->
        <!--            <template #prefix>-->
        <!--              <i class="iconfont icon-qinshuguanxi"></i>-->
        <!--            </template>-->
        <!--            <el-option v-for="dict in kinship_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>-->
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

<script setup name="MsgUserGroup" lang="ts">
import { listMsgUserGroup, getMsgUserGroup, delMsgUserGroup, addMsgUserGroup, updateMsgUserGroup } from '@/api/msg/msgUserGroup';
import { userCodeList, groupCodeList } from '@/api/msg/common';
import { GroupVo, UserVo } from '@/api/msg/common/types';
import { MsgUserGroupVO, MsgUserGroupQuery, MsgUserGroupForm } from '@/api/msg/msgUserGroup/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { kinship_level } = toRefs<any>(proxy?.useDict('kinship_level'));

const msgUserGroupList = ref<MsgUserGroupVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const msgUserGroupFormRef = ref<ElFormInstance>();

// 定义分组列表数据
const groupOptions = ref<GroupVo[]>([]);
const userOptions = ref<UserVo[]>([]);

// 获取分组列表
const fetchGroupAndUserOptions = async () => {
  const res = await groupCodeList();
  groupOptions.value = res.data || [];
  const user = await userCodeList();
  userOptions.value = user.data || [];
};

// 页面加载时获取分组数据
onMounted(() => {
  fetchGroupAndUserOptions();
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MsgUserGroupForm = {
  id: undefined,
  userId: undefined,
  groupId: undefined,
  relativeGenerationDiff: undefined,
  kinshipLevel: undefined
};
const data = reactive<PageData<MsgUserGroupForm, MsgUserGroupQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    groupId: undefined,
    relativeGenerationDiff: undefined,
    kinshipLevel: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
    groupId: [{ required: true, message: '分组ID不能为空', trigger: 'blur' }]
    // ,
    // relativeGenerationDiff: [{ required: true, message: '辈分差不能为空', trigger: 'blur' }],
    // kinshipLevel: [{ required: true, message: '亲缘关系不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户组列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMsgUserGroup(queryParams.value);
  msgUserGroupList.value = res.rows;
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
  msgUserGroupFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: MsgUserGroupVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isDetailView.value = false;
  dialog.visible = true;
  dialog.title = '添加用户组';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgUserGroupVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getMsgUserGroup(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改用户组';
};

const isDetailView = ref(false); // 是否为详情查看模式
/** 查看详情 */
const handleDetail = async (row?: MsgUserGroupVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getMsgUserGroup(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '用户组详情';
};

/** 提交按钮 */
const submitForm = () => {
  msgUserGroupFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMsgUserGroup(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMsgUserGroup(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MsgUserGroupVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除用户组编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delMsgUserGroup(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'msg/msgUserGroup/export',
    {
      ...queryParams.value
    },
    `msgUserGroup_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
