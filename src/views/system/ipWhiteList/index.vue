<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="queryParams.ipAddress" placeholder="请输入IP地址或CIDR网段" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="备注说明" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入备注说明" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="部门ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="请输入部门ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option v-for="dict in ip_white_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button v-hasPermi="['system:ipWhiteList:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:ipWhiteList:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:ipWhiteList:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <!--          <el-col :span="1.5">-->
          <!--            <el-button v-hasPermi="['system:ipWhiteList:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>-->
          <!--          </el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="ipWhiteListList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column v-if="true" label="主键ID" align="center" prop="id" /> -->
        <el-table-column label="IP地址" align="center" prop="ipAddress" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="ip_white_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="部门ID" align="center" prop="deptId" /> -->
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:ipWhiteList:edit']"></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 0" content="授权" placement="top">
              <el-button v-hasPermi="['system:ipWhiteList:authorize']" link type="primary" @click="handleAuthorize(scope.row)">
                <template #default>
                  <img src="@/assets/images/shouquan.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 1" content="取消授权" placement="top">
              <el-button v-hasPermi="['system:ipWhiteList:cancelAuthorize']" link type="primary" @click="handleCancelAuthorize(scope.row)">
                <template #default>
                  <img src="@/assets/images/quxiaoshouquan.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 0" content="删除" placement="top">
              <el-button v-hasPermi="['system:ipWhiteList:delete']" link type="primary" @click="handleDelete(scope.row)">删除</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改IP白名单对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="ipWhiteListFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="请输入IP地址或CIDR网段" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" />
        </el-form-item>
        <!--        <el-form-item label="部门ID" prop="deptId">-->
        <!--          <el-input v-model="form.deptId" placeholder="请输入部门ID" />-->
        <!--        </el-form-item>-->
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable>
            <el-option v-for="dict in ip_white_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="IpWhiteList" lang="ts">
import { listIpWhiteList, getIpWhiteList, delIpWhiteList, addIpWhiteList, updateIpWhiteList } from '@/api/system/ipWhiteList';
import { IpWhiteListVO, IpWhiteListQuery, IpWhiteListForm } from '@/api/system/ipWhiteList/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ip_white_status } = toRefs<any>(proxy?.useDict('ip_white_status'));

const ipWhiteListList = ref<IpWhiteListVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const ipWhiteListFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IpWhiteListForm = {
  id: undefined,
  ipAddress: undefined,
  description: undefined,
  status: undefined,
  deptId: undefined,
  remark: undefined
};
const data = reactive<PageData<IpWhiteListForm, IpWhiteListQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ipAddress: undefined,
    description: undefined,
    status: undefined,
    deptId: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    ipAddress: [{ required: true, message: 'IP地址或CIDR网段不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询IP白名单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIpWhiteList(queryParams.value);
  ipWhiteListList.value = res.rows;
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
  ipWhiteListFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IpWhiteListVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加IP白名单';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IpWhiteListVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getIpWhiteList(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改IP白名单';
};

/** 提交按钮 */
const submitForm = () => {
  ipWhiteListFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIpWhiteList(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIpWhiteList(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IpWhiteListVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除IP白名单编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delIpWhiteList(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/ipWhiteList/export',
    {
      ...queryParams.value
    },
    `ipWhiteList_${new Date().getTime()}.xlsx`
  );
};

const handleAuthorize = async (row) => {
  await updateIpWhiteList({
    ...row,
    status: 1,
    remark: '授权成功'
  });
  proxy?.$modal.msgSuccess('操作成功');
  getList();
};

const handleCancelAuthorize = async (row) => {
  await updateIpWhiteList({
    ...row,
    status: 0,
    remark: '授权取消'
  });
  proxy?.$modal.msgSuccess('操作成功');
  getList();
};

onMounted(() => {
  getList();
});
</script>
