<template>
  <div class="app-container home">
    <el-calendar v-model="value">
      <template #date-cell="{ data }">
        <div class="date-content" :class="{ 'not-current-month': !isCurrentMonth(data.day) }">
          <div class="solar-date">{{ getSolarDay(data.day) }}</div>
          <div class="lunar-date">{{ getLunarDate(data.day) }}</div>

          <!-- 节假日和节气 -->
          <div v-if="getHoliday(data.day)" class="holiday">{{ getHoliday(data.day) }}</div>
          <div v-if="getSolarTerm(data.day)" class="solar-term">{{ getSolarTerm(data.day) }}</div>

          <!-- 提醒事项 -->
          <div v-if="hasReminder(data.day)" class="reminder">
            <div v-for="(reminder, index) in getReminders(data.day)" :key="index" class="reminder-item">
              <el-icon :color="reminderColor(reminder.type)" class="reminder-icon">
                <component :is="reminderIcon(reminder.type)" />
              </el-icon>
              <span>{{ reminder.content }}</span>
            </div>
          </div>

          <!-- 今日标记 -->
          <div v-if="isToday(data.day)" class="today-mark"></div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Lunar } from 'lunar-javascript';
import { Calendar as CalendarIcon, User as UserIcon, Present as PresentIcon, StarFilled as StarIcon } from '@element-plus/icons-vue';

// 当前选中的日期
const value = ref(new Date());

// 提醒事项数据（模拟API返回的数据）
const reminders = ref([
  { date: '2023-06-15', type: 'birthday', content: '张三生日' },
  { date: '2023-06-18', type: 'anniversary', content: '结婚纪念日' },
  { date: '2023-06-22', type: 'event', content: '团队会议' },
  { date: '2023-06-25', type: 'birthday', content: '李四生日' },
  { date: '2023-07-01', type: 'event', content: '项目截止日' }
]);

// 获取当前月/年
const currentMonth = computed(() => value.value.getMonth());
const currentYear = computed(() => value.value.getFullYear());

// 检查日期是否是当前月
const isCurrentMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value;
};

// 获取公历日期（只显示日）
const getSolarDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getDate();
};

// 获取农历日期
const getLunarDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const lunar = Lunar.fromDate(date);

  // 如果是初一，显示月份，否则显示日
  if (lunar.getDay() === 1) {
    return lunar.getMonthInChinese() + '月';
  }
  return lunar.getDayInChinese();
};

// 获取节假日
const getHoliday = (dateStr: string) => {
  const date = new Date(dateStr);
  const lunar = Lunar.fromDate(date);
  const festivals = lunar.getFestivals();

  // 只显示第一个节假日
  if (festivals.length > 0) {
    return festivals[0];
  }

  // 特殊处理一些公历节日
  const solarFestivals: Record<string, string> = {
    '0101': '元旦',
    '0501': '劳动节',
    '1001': '国庆节'
  };

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const monthDay = `${month}${day}`;
  return solarFestivals[monthDay] || '';
};

// 获取节气
const getSolarTerm = (dateStr: string) => {
  const date = new Date(dateStr);
  const lunar = Lunar.fromDate(date);
  return lunar.getJieQi();
};

// 判断是否是今天
const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return today.toDateString() === date.toDateString();
};

// 检查日期是否有提醒事项
const hasReminder = (dateStr: string) => {
  const formattedDate = formatDate(dateStr);
  return reminders.value.some((reminder) => reminder.date === formattedDate);
};

// 获取日期对应的提醒事项
const getReminders = (dateStr: string) => {
  const formattedDate = formatDate(dateStr);
  return reminders.value.filter((reminder) => reminder.date === formattedDate);
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取提醒事项图标
const reminderIcon = (type: string) => {
  const icons: Record<string, any> = {
    birthday: UserIcon,
    anniversary: PresentIcon,
    event: CalendarIcon,
    default: StarIcon
  };
  return icons[type] || icons.default;
};

// 获取提醒事项颜色
const reminderColor = (type: string) => {
  const colors: Record<string, string> = {
    birthday: '#FF6B6B',
    anniversary: '#4ECDC4',
    event: '#FFD166',
    default: '#6A0572'
  };
  return colors[type] || colors.default;
};

// 模拟从API获取提醒事项
const fetchReminders = async (year: number, month: number) => {
  // 这里应该是实际的API调用
  console.log(`Fetching reminders for ${year}-${month}`);

  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 在实际应用中，这里会返回API数据
  // 现在使用模拟数据
  return [
    { date: `${year}-${String(month).padStart(2, '0')}-22`, type: 'birthday', content: '张三生日' },
    { date: `${year}-${String(month).padStart(2, '0')}-22`, type: 'anniversary', content: '结婚纪念日' },
    { date: `${year}-${String(month).padStart(2, '0')}-22`, type: 'event', content: '团队会议' },
    { date: `${year}-${String(month).padStart(2, '0')}-22`, type: 'birthday', content: '李四生日' }
  ];
};

// 当月份/年份变化时重新加载提醒事项
onMounted(() => {
  const year = currentYear.value;
  const month = currentMonth.value + 1;
  fetchReminders(year, month).then((data) => {
    reminders.value = data;
  });
});

// 监听日历变化
watch(value, (newVal) => {
  const year = newVal.getFullYear();
  const month = newVal.getMonth() + 1;
  fetchReminders(year, month).then((data) => {
    reminders.value = data;
  });
});
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 16px;
  background: #f7f7f7;
  overflow-y: auto;
}

// 日历头部样式
:deep(.el-calendar__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f5ff;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-calendar__title) {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

:deep(.el-calendar-table) {
  width: 100%;
}

:deep(.el-calendar-table thead th) {
  padding: 12px 0;
  color: #606266;
  font-weight: 600;
  background-color: #f8f9fa;
}

// 非当前月样式
:deep(.el-calendar-table:not(.is-range) td.next),
:deep(.el-calendar-table:not(.is-range) td.prev) {
  .date-content {
    color: #c0c4cc;

    .solar-date,
    .lunar-date {
      color: #c0c4cc;
    }
  }
}

:deep(.el-calendar-table td) {
  border: none;
  vertical-align: top;
  height: 110px; /* 增加高度以容纳提醒事项 */
  padding: 4px;
}

:deep(.el-calendar-table td.is-selected) {
  background-color: #f0f7ff;
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

:deep(.el-calendar-table .el-calendar-day:hover) {
  background-color: #f5f7fa;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* 日期内容样式 */
.date-content {
  width: 100%;
  height: 100%;
  position: relative;

  &.not-current-month {
    opacity: 0.6;
  }
}

.solar-date {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.lunar-date {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.holiday {
  font-size: 12px;
  color: #e74c3c;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(231, 76, 60, 0.1);
  margin-top: 2px;
}

.solar-term {
  font-size: 12px;
  color: #27ae60;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(39, 174, 96, 0.1);
  margin-top: 2px;
}

.today-mark {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  background-color: #409eff;
  border-radius: 50%;
}

/* 提醒事项样式 */
.reminder {
  margin-top: 4px;
  width: 100%;
}

.reminder-item {
  display: flex;
  align-items: center;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .reminder-icon {
    margin-right: 4px;
    font-size: 12px;
  }
}
</style>
