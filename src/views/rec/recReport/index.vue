<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="类型" prop="reportType">
              <el-select v-model="queryParams.reportType" placeholder="请选择类型" clearable>
                <el-option style="width: 200px" v-for="dict in report_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期" style="width: 308px">
              <el-date-picker
                v-model="dateRangeReportDate"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['rec:recReport:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['rec:recReport:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['rec:recReport:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['rec:recReport:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="recReportList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="类型" align="center" prop="reportType" min-width="60">
          <template #default="scope">
            <dict-tag :options="report_type" :value="scope.row.reportType" />
          </template>
        </el-table-column>
        <el-table-column label="日期" align="center" prop="reportDate" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.reportDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="摘要" align="center" show-overflow-tooltip prop="summary" min-width="120" />
        <el-table-column label="内容" align="center" show-overflow-tooltip prop="content" min-width="240" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rec:recReport:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['rec:recReport:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rec:recReport:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改报告对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="recReportFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="摘要" prop="summary">
          <el-input ref="summaryInputRef" v-model="form.summary" placeholder="请输入内容" :disabled="isDetailView" />
        </el-form-item>
        <el-form-item label="类型" prop="reportType">
          <el-select v-model="form.reportType" placeholder="请选择类型" :disabled="isDetailView">
            <el-option v-for="dict in report_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="reportDate">
          <el-date-picker
            :disabled="isDetailView"
            clearable
            style="width: 100%"
            v-model="form.reportDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="内容" prop="content" style="margin-bottom: 2px; width: 100%">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容" :rows="10" :disabled="isDetailView" />
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

<script setup name="RecReport" lang="ts">
import { listRecReport, getRecReport, delRecReport, addRecReport, updateRecReport } from '@/api/rec/recReport';
import { RecReportVO, RecReportQuery, RecReportForm } from '@/api/rec/recReport/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { report_type } = toRefs<any>(proxy?.useDict('report_type'));
const recReportList = ref<RecReportVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const recReportFormRef = ref<ElFormInstance>();
const dateRangeReportDate = ref<[DateModelType, DateModelType]>(['', '']);
const isDetailView = ref(false); // 是否为详情查看模式
const summaryInputRef = ref<InstanceType<typeof ElInput> | null>(null); // 声明 ref

const handleDialogOpened = () => {
  nextTick(() => {
    if (summaryInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = summaryInputRef.value.input;
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

const initFormData: RecReportForm = {
  id: undefined,
  reportType: undefined,
  reportDate: undefined,
  content: undefined,
  summary: undefined
};
const data = reactive<PageData<RecReportForm, RecReportQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    reportType: undefined,
    beginReportDate: undefined,
    endReportDate: undefined
  },
  rules: {
    reportType: [{ required: true, message: '类型不能为空', trigger: 'change' }],
    reportDate: [{ required: true, message: '日期不能为空', trigger: 'blur' }],
    summary: [{ required: true, message: '摘要不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询报告列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.beginReportDate = dateRangeReportDate.value[0];
  queryParams.value.endReportDate = dateRangeReportDate.value[1];
  const res = await listRecReport(queryParams.value);
  recReportList.value = res.rows;
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
  recReportFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeReportDate.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: RecReportVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  form.value.reportType = 'daily';
  form.value.reportDate = new Date().toISOString().split('T')[0];
  isDetailView.value = false;
  dialog.visible = true;
  dialog.title = '添加报告';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: RecReportVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getRecReport(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改报告';
};

/** 查看详情按钮操作 */
const handleDetail = async (row?: RecReportVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getRecReport(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '报告详情';
};

/** 提交按钮 */
const submitForm = () => {
  recReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRecReport(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRecReport(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RecReportVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除报告编号为"' + (row?.summary || '选中') + '"的数据项？').finally(() => (loading.value = false));
  await delRecReport(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'rec/recReport/export',
    {
      ...queryParams.value
    },
    `recReport_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
