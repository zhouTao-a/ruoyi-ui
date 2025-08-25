<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="标题" prop="title">
              <el-input style="width: 200px" v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="类型" prop="sourceType">
              <el-select v-model="queryParams.sourceType" placeholder="请选择类型" clearable>
                <el-option style="width: 200px" v-for="dict in source_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['rec:recReflection:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['rec:recReflection:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['rec:recReflection:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['rec:recReflection:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="recReflectionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip min-width="100px" />
        <el-table-column label="概要" align="center" prop="synopsis" show-overflow-tooltip min-width="200px" />
        <el-table-column label="感想" align="center" prop="content" show-overflow-tooltip min-width="200px" />
        <el-table-column label="来源类型" align="center" prop="sourceType" show-overflow-tooltip min-width="60px">
          <template #default="scope">
            <dict-tag :options="source_type" :value="scope.row.sourceType" />
          </template>
        </el-table-column>
        <el-table-column label="来源名称" align="center" prop="sourceName" show-overflow-tooltip min-width="100px" />
        <el-table-column label="来源链接" align="center" prop="sourceLink" show-overflow-tooltip min-width="120px" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recReflection:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['rec:recReflection:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recReflection:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改感想对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="recReflectionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input ref="titleInputRef" v-model="form.title" placeholder="请输入标题" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="概要" prop="synopsis">
          <el-input v-model="form.synopsis" type="textarea" placeholder="请输入概要" :rows="6" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="感想" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入感想" :rows="10" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-select v-model="form.sourceType" placeholder="请选择来源类型" :disabled="isDetailView">
            <el-option v-for="dict in source_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源名称" prop="sourceName">
          <el-input v-model="form.sourceName" placeholder="请输入来源名称" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="来源链接" prop="sourceLink" style="margin-bottom: 2px; width: 100%">
          <el-input v-model="form.sourceLink" placeholder="请输入来源链接" :disabled="isDetailView" />
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

<script setup name="RecReflection" lang="ts">
import { listRecReflection, getRecReflection, delRecReflection, addRecReflection, updateRecReflection } from '@/api/rec/recReflection';
import { RecReflectionVO, RecReflectionQuery, RecReflectionForm } from '@/api/rec/recReflection/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { source_type } = toRefs<any>(proxy?.useDict('source_type'));

const recReflectionList = ref<RecReflectionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const recReflectionFormRef = ref<ElFormInstance>();
const isDetailView = ref(false); // 是否为详情查看模式
const titleInputRef = ref<InstanceType<typeof ElInput> | null>(null);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RecReflectionForm = {
  id: undefined,
  title: undefined,
  content: undefined,
  sourceType: undefined,
  sourceName: undefined,
  sourceLink: undefined
};
const data = reactive<PageData<RecReflectionForm, RecReflectionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    sourceType: undefined
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
  }
});

const handleDialogOpened = () => {
  nextTick(() => {
    if (titleInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = titleInputRef.value.textarea;
      if (inputEl) {
        inputEl.focus();
      }
    }
  });
};

const { queryParams, form, rules } = toRefs(data);

/** 查询感想列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRecReflection(queryParams.value);
  recReflectionList.value = res.rows;
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
  recReflectionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RecReflectionVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isDetailView.value = false;
  dialog.visible = true;
  dialog.title = '添加感想';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: RecReflectionVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getRecReflection(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改感想';
};

/** 修改按钮操作 */
const handleDetail = async (row?: RecReflectionVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getRecReflection(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '感想详情';
};

/** 提交按钮 */
const submitForm = () => {
  recReflectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRecReflection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRecReflection(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RecReflectionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除感想标题为"' + (row?.title || '选中') + '"的数据项？').finally(() => (loading.value = false));
  await delRecReflection(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'rec/recReflection/export',
    {
      ...queryParams.value
    },
    `recReflection_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
