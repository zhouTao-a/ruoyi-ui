<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['msg:msgUser:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['msg:msgUser:edit']">修改</el-button>
          </el-col>
<!--          <el-col :span="1.5">-->
<!--            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['msg:msgUser:remove']"-->
<!--              >删除</el-button-->
<!--            >-->
<!--          </el-col>-->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['msg:msgUser:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="msgUserList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="用户名" align="center" prop="userName" show-overflow-tooltip />
        <el-table-column label="性别" align="center" prop="gender">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
          </template>
        </el-table-column>
        <el-table-column label="用户编码" align="center" prop="userCode" show-overflow-tooltip />
        <el-table-column label="身份证号" align="center" prop="idCard" show-overflow-tooltip width="170" />
        <el-table-column label="手机号" align="center" prop="phoneNumber" show-overflow-tooltip />
        <el-table-column label="生日" align="center" prop="birthday" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="农历生日" align="center" prop="lunarBirthday" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lunarBirthday, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮箱地址" align="center" prop="email" show-overflow-tooltip width="160" />
        <el-table-column label="短信通知" align="center" prop="smsNotifyFlag">
          <template #default="scope">
            <dict-tag :options="whether_flag" :value="scope.row.smsNotifyFlag" />
          </template>
        </el-table-column>
        <el-table-column label="邮箱通知" align="center" prop="emailNotifyFlag">
          <template #default="scope">
            <dict-tag :options="whether_flag" :value="scope.row.emailNotifyFlag" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgUser:edit']"></el-button>
            </el-tooltip>
<!--            <el-tooltip content="删除" placement="top">-->
<!--              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgUser:remove']"></el-button>-->
<!--            </el-tooltip>-->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改用户对话框 --><!-- 添加对话框打开完成事件 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="720px" append-to-body :close-on-click-modal="false">
      <div class="card-container bg-amber-50 border border-amber-100">
        <el-form ref="msgUserFormRef" :model="form" :rules="rules" label-width="100px" label-position="right">
          <div class="form-row">
            <el-form-item label="用户名" prop="userName">
              <el-input ref="userNameInputRef" v-model="form.userName" placeholder="请输入用户名" class="input-with-icon">
                <template #prefix>
                  <i class="iconfont icon-xingming"></i>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" class="select-with-icon">
                <template #prefix>
                  <i class="iconfont icon-xingbie"></i>
                </template>
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="用户编码" prop="userCode">
              <el-input v-model="form.userCode" placeholder="请输入用户编码" class="input-with-icon">
                <template #prefix>
                  <i class="iconfont icon-xingming"></i>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号">
                <template #prefix>
                  <i class="iconfont icon-idcard"></i>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="请输入手机号" class="input-with-icon">
                <template #prefix>
                  <i class="iconfont icon-shoujihaoma"></i>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱地址" class="input-with-icon">
                <template #prefix>
                  <i class="iconfont icon-youxiang"></i>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="农历生日" prop="lunarBirthday">
              <el-date-picker clearable v-model="form.lunarBirthday" type="date" value-format="YYYY-MM-DD" placeholder="请选择农历生日" />
            </el-form-item>

            <el-form-item label="生日" prop="birthday">
              <el-date-picker clearable v-model="form.birthday" type="date" value-format="YYYY-MM-DD" placeholder="请选择生日" />
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="短信通知" prop="smsNotifyFlag">
              <el-select v-model="form.smsNotifyFlag" placeholder="请选择通知状态" class="select-with-icon">
                <template #prefix>
                  <i class="iconfont icon-shifoutongzhi"></i>
                </template>
                <el-option v-for="dict in whether_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="邮箱通知" prop="emailNotifyFlag">
              <el-select v-model="form.emailNotifyFlag" placeholder="请选择通知状态" class="select-with-icon">
                <template #prefix>
                  <i class="iconfont icon-shifoutongzhi"></i>
                </template>
                <el-option v-for="dict in whether_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm" class="primary-btn">
            <template v-if="buttonLoading">
              <el-icon><Loading /></el-icon>
              <span class="ml-2">提交中</span>
            </template>
            <template v-else> 确 定 </template>
          </el-button>
          <el-button @click="cancel" class="cancel-btn">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MsgUser" lang="ts">
import { listMsgUser, getMsgUser, delMsgUser, addMsgUser, updateMsgUser } from '@/api/msg/msgUser';
import { MsgUserVO, MsgUserQuery, MsgUserForm } from '@/api/msg/msgUser/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue'; // 确保导入nextTick
import { ElInput } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_user_sex, whether_flag } = toRefs<any>(proxy?.useDict('sys_user_sex', 'whether_flag'));

const msgUserList = ref<MsgUserVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const msgUserFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 添加用户名输入框的引用
const userNameInputRef = ref<InstanceType<typeof ElInput> | null>(null); // 声明 ref

// 处理对话框完全打开事件
const handleDialogOpened = () => {
  nextTick(() => {
    if (userNameInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = userNameInputRef.value.input;
      if (inputEl) {
        inputEl.focus();
      }
    }
  });
};

const initFormData: MsgUserForm = {
  id: undefined,
  userName: undefined,
  gender: undefined,
  userCode: undefined,
  idCard: undefined,
  phoneNumber: undefined,
  birthday: undefined,
  lunarBirthday: undefined,
  email: undefined,
  smsNotifyFlag: undefined,
  emailNotifyFlag: undefined
};
const data = reactive<PageData<MsgUserForm, MsgUserQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phoneNumber: undefined,
    params: {}
  },
  rules: {
    userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
    gender: [{ required: true, message: '性别不能为空', trigger: 'change' }],
    userCode: [{ required: true, message: '用户编码不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMsgUser(queryParams.value);
  msgUserList.value = res.rows;
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
  msgUserFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: MsgUserVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加用户';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgUserVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getMsgUser(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改用户';
};

/** 提交按钮 */
const submitForm = () => {
  msgUserFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMsgUser(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMsgUser(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
// const handleDelete = async (row?: MsgUserVO) => {
//   const _ids = row?.id || ids.value;
//   await proxy?.$modal.confirm('是否确认删除用户编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
//   await delMsgUser(_ids);
//   proxy?.$modal.msgSuccess('删除成功');
//   await getList();
// };

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'msg/msgUser/export',
    {
      ...queryParams.value
    },
    `msgUser_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style>
.form-row .el-input,
.form-row .el-date-picker {
  width: 100%; /* 强制所有输入组件宽度一致 */
}

.card-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px; /* 列间距 */

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 移动端单栏布局 */
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 0px;

  .primary-btn {
    padding: 8px 24px;
    font-weight: 500;

    &:hover {
      background-color: #4c9eff;
    }
  }

  .cancel-btn {
    color: #606266;
    padding: 8px 24px;
  }
}
</style>
