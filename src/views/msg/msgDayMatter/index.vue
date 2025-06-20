<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="事件名称" prop="dayName">
              <el-input style="width: 200px" v-model="queryParams.dayName" placeholder="请输入事件名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="事件类型" prop="dayType">
              <el-select style="width: 200px" v-model="queryParams.dayType" placeholder="请选择事件类型" clearable>
                <el-option v-for="dict in day_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户" prop="userId">
              <el-select v-model="queryParams.userId" placeholder="请选择用户" clearable filterable style="width: 200px">
                <el-option v-for="user in userOptions" :key="user.id" :label="`${user.userName}（${user.userCode}）`" :value="user.id" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['msg:msgDayMatter:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['msg:msgDayMatter:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['msg:msgDayMatter:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['msg:msgDayMatter:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="msgDayMatterList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="事件名称" align="center" prop="dayName" min-width="100" />
        <el-table-column label="事件时间" align="center" prop="dayTarget" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.dayTarget, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间类型" align="center" prop="dayLunar" min-width="80">
          <template #default="scope">
            <dict-tag :options="day_lunar" :value="scope.row.dayLunar" />
          </template>
        </el-table-column>
        <el-table-column label="事件类型" align="center" prop="dayType" min-width="80">
          <template #default="scope">
            <dict-tag :options="day_type" :value="scope.row.dayType" />
          </template>
        </el-table-column>
        <el-table-column label="提醒周期" align="center" prop="remindType" min-width="80">
          <template #default="scope">
            <dict-tag :options="remind_type" :value="scope.row.remindType" />
          </template>
        </el-table-column>
        <el-table-column label="重复提醒" align="center" prop="repeatFlag" min-width="80">
          <template #default="scope">
            <dict-tag :options="whether_flag" :value="scope.row.repeatFlag" />
          </template>
        </el-table-column>
        <el-table-column label="通知状态" align="center" prop="notifyStatus" min-width="80">
          <template #default="scope">
            <dict-tag :options="notify_status" :value="scope.row.notifyStatus" />
          </template>
        </el-table-column>
        <el-table-column label="通知时间" align="center" prop="nextNotifyTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.nextNotifyTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" align="center" prop="userId" v-if="false" />
        <el-table-column label="用户名称" align="center" prop="userName" min-width="100" />
        <el-table-column label="用户代码" align="center" prop="userCode" min-width="100" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:msgDayMatter:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" @click="handleDetail(scope.row)" v-hasPermi="['msg:msgUser:detail']">
                <template #default>
                  <img src="@/assets/mes/Frame2.png" />
                </template>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['msg:msgDayMatter:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改事件对话框 -->
    <el-dialog @opened="handleDialogOpened" :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form class="card-container" ref="msgDayMatterFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="事件名称" prop="dayName">
          <el-input :disabled="isDetailView" ref="dayNameInputRef" class="form-input" v-model="form.dayName" placeholder="请输入事件名称">
            <template #prefix>
              <i class="iconfont icon-shijianming"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="事件时间" prop="dayTarget">
          <el-date-picker
            :disabled="isDetailView"
            class="form-input"
            style="width: 100%"
            clearable
            v-model="form.dayTarget"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择事件时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="事件类型" prop="dayType">
          <el-select :disabled="isDetailView" class="form-input" v-model="form.dayType" placeholder="请选择事件类型">
            <el-option v-for="dict in day_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            <template #prefix>
              <i class="iconfont icon-leixing"></i>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="时间类型" prop="dayLunar">
          <el-select :disabled="isDetailView" class="form-input" v-model="form.dayLunar" placeholder="请选择时间类型">
            <el-option v-for="dict in day_lunar" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            <template #prefix>
              <i class="iconfont icon-nongli"></i>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="提醒周期" prop="remindType">
          <el-select :disabled="isDetailView" class="form-input" v-model="form.remindType" placeholder="请选择提醒周期">
            <el-option v-for="dict in filteredRemindType" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            <template #prefix>
              <i class="iconfont icon-shijianzhouqi"></i>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="重复提醒" prop="repeatFlag">
          <el-select :disabled="isDetailView" v-model="form.repeatFlag" placeholder="请选择重复提醒" class="select-with-icon">
            <template #prefix>
              <i class="iconfont icon-shifoutongzhi"></i>
            </template>
            <el-option v-for="dict in whether_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知状态" prop="notifyStatus">
          <el-radio-group :disabled="isDetailView" class="form-input" v-model="form.notifyStatus">
            <el-radio v-for="dict in notify_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item style="margin-bottom: 2px" label="用户" prop="userId">
          <el-select :disabled="isDetailView" class="form-input" v-model="form.userId" placeholder="请选择用户" clearable filterable>
            <el-option v-for="user in userOptions" :key="user.id" :label="`${user.userName}（${user.userCode}）`" :value="user.id" />
            <template #prefix>
              <i class="iconfont icon-xingming"></i>
            </template>
          </el-select>
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

<script setup name="MsgDayMatter" lang="ts">
import { listMsgDayMatter, getMsgDayMatter, delMsgDayMatter, addMsgDayMatter, updateMsgDayMatter } from '@/api/msg/msgDayMatter';
import { MsgDayMatterVO, MsgDayMatterQuery, MsgDayMatterForm } from '@/api/msg/msgDayMatter/types';
import { ref, reactive, toRefs, getCurrentInstance, onMounted, nextTick } from 'vue';
import { ElInput } from 'element-plus';
import { userCodeList, groupCodeList } from '@/api/msg/common';
import { GroupVo, UserVo } from '@/api/msg/common/types';
import { watch, computed } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { remind_type, day_type, notify_status, whether_flag, day_lunar } = toRefs<any>(
  proxy?.useDict('remind_type', 'day_type', 'notify_status', 'whether_flag', 'day_lunar')
);

const dayNameInputRef = ref<InstanceType<typeof ElInput> | null>(null);

const handleDialogOpened = () => {
  nextTick(() => {
    if (dayNameInputRef.value) {
      // 获取输入框的DOM元素并聚焦
      const inputEl = dayNameInputRef.value.input;
      if (inputEl) {
        inputEl.focus();
      }
    }
  });
};

const msgDayMatterList = ref<MsgDayMatterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeDayTarget = ref<[DateModelType, DateModelType]>(['', '']);
const isDetailView = ref(false);
const queryFormRef = ref<ElFormInstance>();
const msgDayMatterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MsgDayMatterForm = {
  id: undefined,
  dayName: undefined,
  dayTarget: undefined,
  dayLunar: undefined,
  dayType: undefined,
  remindType: undefined,
  repeatFlag: undefined,
  notifyStatus: undefined,
  userId: undefined,
  userName: undefined,
  userCode: undefined
};
const data = reactive<PageData<MsgDayMatterForm, MsgDayMatterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dayName: undefined,
    dayType: undefined,
    userId: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    dayName: [{ required: true, message: '事件名称不能为空', trigger: 'blur' }],
    dayTarget: [{ required: true, message: '事件时间不能为空', trigger: 'blur' }],
    dayLunar: [{ required: true, message: '时间类型不能为空', trigger: 'change' }],
    dayType: [{ required: true, message: '事件类型不能为空', trigger: 'change' }],
    remindType: [{ required: true, message: '提醒周期不能为空', trigger: 'change' }],
    repeatFlag: [{ required: true, message: '重复提醒不能为空', trigger: 'blur' }],
    notifyStatus: [{ required: true, message: '通知状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 根据 dayLunar 过滤提醒周期
const filteredRemindType = computed(() => {
  return form.value.dayLunar === 'lunar' ? remind_type.value.filter((r) => r.value === 'yearly') : remind_type.value;
});

// 监听 dayType 自动设置
watch(
  () => form.value.dayType,
  (val) => {
    if (val === 'birthday') {
      form.value.dayLunar = 'lunar';
      form.value.remindType = 'yearly';
    }
  }
);

// 监听 dayLunar 自动修正 remindType
watch(
  () => form.value.dayLunar,
  (val) => {
    if (val === 'lunar' && form.value.remindType !== 'yearly') {
      form.value.remindType = 'yearly';
    }
  }
);

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

/** 查询事件列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeDayTarget.value, 'DayTarget');
  const res = await listMsgDayMatter(queryParams.value);
  msgDayMatterList.value = res.rows;
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
  msgDayMatterFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeDayTarget.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: MsgDayMatterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isDetailView.value = false;
  //新增按钮设置初始值
  form.value.repeatFlag = 'T';
  form.value.notifyStatus = 'pending';
  form.value.dayLunar = 'solar';
  dialog.visible = true;
  dialog.title = '添加事件';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MsgDayMatterVO) => {
  reset();
  isDetailView.value = false;
  const _id = row?.id || ids.value[0];
  const res = await getMsgDayMatter(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改事件';
};

/** 详情操作 */
const handleDetail = async (row?: MsgDayMatterVO) => {
  reset();
  isDetailView.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getMsgDayMatter(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改事件';
};

/** 提交按钮 */
const submitForm = () => {
  msgDayMatterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMsgDayMatter(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addMsgDayMatter(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MsgDayMatterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除事件"' + (row?.dayName || '选中') + '"的数据项？').finally(() => (loading.value = false));
  await delMsgDayMatter(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'msg/msgDayMatter/export',
    {
      ...queryParams.value
    },
    `msgDayMatter_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

/* 使用common.scss中全部样式 */
<style lang="scss" src="@/assets/styles/vue-column.scss" />
