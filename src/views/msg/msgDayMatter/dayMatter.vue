<template>
  <div class="home" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <el-calendar v-model="value">
      <template #date-cell="{ data }">
        <div
          class="date-content"
          :class="{
            'not-current-month': !isCurrentMonth(data.day),
            'selected-day': isSelectedDay(data.day)
          }"
          @click="selectDay(data.day)"
        >
          <div class="solar-date">{{ getSolarDay(data.day) }}</div>
          <div class="lunar-date">{{ getLunarDate(data.day) }}</div>
          <div v-if="getHoliday(data.day)" class="holiday">{{ getHoliday(data.day) }}</div>
          <div v-if="getSolarTerm(data.day)" class="solar-term">{{ getSolarTerm(data.day) }}</div>
          <div v-if="isToday(data.day)" class="today-mark"></div>
          <div v-if="hasReminder(data.day)" class="reminder">
            <el-icon
              v-for="(reminder, index) in getReminders(data.day).slice(0, 2)"
              :key="index"
              class="reminder-icon"
              :color="reminderColor(reminder)"
            >
              <component :is="reminderIcon(reminder.type)" />
            </el-icon>
          </div>
        </div>
      </template>
    </el-calendar>

    <!-- 弹窗显示选中日期事件详情 -->
    <el-dialog
      :title="selectedDate ? `${getFriendlyDate(selectedDate)} ` : ''"
      v-model="showDialog"
      width="90%"
      :modal-append-to-body="false"
      @close="showDialog = false"
    >
      <ul v-if="selectedReminders.length">
        <li v-for="(item, index) in selectedReminders" :key="index" class="reminder-detail-item">
          <el-icon :color="reminderColor(item)" style="margin-right: 6px">
            <component :is="reminderIcon(item.type)" />
          </el-icon>
          {{ item.content }}
        </li>
      </ul>
    </el-dialog>

    <!-- 页面底部展示当前月所有提醒 -->
    <div class="month-reminder-list">
      <ul>
        <li
          v-for="(item, index) in monthReminders"
          :key="index"
          class="reminder-detail-item"
          @click="selectDay(item.isLunar ? lunarToSolar(item.lunarMonth, item.lunarDay, currentYear) : item.date)"
          style="cursor: pointer"
          :title="item.content"
        >
          <el-icon :color="reminderColor(item)" style="margin-right: 6px">
            <component :is="reminderIcon(item.type)" />
          </el-icon>
          <span>{{ item.content }} - {{ formatDisplayDate(item) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Lunar } from 'lunar-javascript';
import { dayMatterList } from '@/api/msg/common';
import { Calendar as CalendarIcon, User as UserIcon, Present as PresentIcon, StarFilled as StarIcon } from '@element-plus/icons-vue';

const value = ref(new Date());
const selectedDate = ref('');
const showDialog = ref(false);
const reminders = ref<any[]>([]);

const currentMonth = computed(() => value.value.getMonth());
const currentYear = computed(() => value.value.getFullYear());

const isCurrentMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value;
};

const isSelectedDay = (dateStr: string) => selectedDate.value === formatDate(dateStr);

const getSolarDay = (dateStr: string) => new Date(dateStr).getDate();

const getLunarDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const lunar = Lunar.fromDate(date);
  return lunar.getDay() === 1 ? lunar.getMonthInChinese() + '月' : lunar.getDayInChinese();
};

const getHoliday = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const lunar = Lunar.fromDate(date);
  const festivals = lunar.getFestivals();
  if (festivals.length) return festivals[0];
  const map: Record<string, string> = {
    '0101': '元旦',
    '0501': '劳动节',
    '1001': '国庆节'
  };
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return map[key] || '';
};

const formatDisplayDate = (item: any): string => {
  if (item.isLunar) {
    // 把农历转换为公历日期
    const lunar = Lunar.fromYmd(currentYear.value, item.lunarMonth, item.lunarDay);
    const solarDate = lunar.getSolar().toYmd();
    const date = new Date(solarDate);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } else {
    const date = new Date(item.date);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

const getSolarTerm = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return Lunar.fromDate(date).getJieQi() || '';
};

const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return today.toDateString() === date.toDateString();
};

const formatDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getFriendlyDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const hasReminder = (dateStr: string) => getReminders(dateStr).length > 0;

const getReminders = (dateStr: string) => {
  const solar = formatDate(dateStr);
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return [];
  const lunar = Lunar.fromDate(date);
  return reminders.value.filter((r) => {
    if (r.isLunar) {
      return r.lunarMonth === lunar.getMonth() && r.lunarDay === lunar.getDay();
    } else {
      return r.date === solar;
    }
  });
};

const reminderIcon = (type: string) =>
  ({
    birthday: UserIcon,
    anniversary: PresentIcon,
    event: CalendarIcon,
    default: StarIcon
  })[type] || StarIcon;

const reminderColor = (reminder: any) => {
  if (reminder.isLunar) return '#B46AFF';
  const map: Record<string, string> = {
    birthday: '#FF6B6B',
    anniversary: '#4ECDC4',
    event: '#FFD166',
    default: '#6A0572'
  };
  return map[reminder.type] || map.default;
};

const selectDay = (dateStr: string) => {
  const formatted = formatDate(dateStr);
  const remindersForDate = getReminders(formatted);
  if (remindersForDate.length > 0) {
    selectedDate.value = formatted;
    showDialog.value = true;
  }
};

// 当前选中日期提醒
const selectedReminders = computed(() => getReminders(selectedDate.value));

// 计算当前月所有提醒事项（公历和农历都包含）
const monthReminders = computed(() => {
  const listWithDate = reminders.value.map((item) => {
    let date: Date;

    if (item.isLunar) {
      const lunar = Lunar.fromYmd(currentYear.value, item.lunarMonth, item.lunarDay);
      const solar = lunar.getSolar(); // { getYear(), getMonth(), getDay() }
      date = new Date(`${solar.getYear()}-${solar.getMonth().toString().padStart(2, '0')}-${solar.getDay().toString().padStart(2, '0')}`);
    } else {
      date = new Date(item.date);
    }

    return { ...item, displayDate: date };
  });

  // 只保留本月数据
  const filtered = listWithDate.filter((item) => {
    const d = item.displayDate;
    return d.getFullYear() === currentYear.value && d.getMonth() === currentMonth.value;
  });

  // 按照日期升序排序
  return filtered.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());
});

// 简单农历转公历日期，默认使用当年
const lunarToSolar = (lunarMonth: number, lunarDay: number, year: number) => {
  try {
    const lunar = Lunar.fromYmd(year, lunarMonth, lunarDay);
    const solarDate = lunar.getSolar().toDate();
    return formatDate(solarDate);
  } catch {
    return '';
  }
};

const fetchReminders = (year: number, month: number) => {
  return dayMatterList({ year, month })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return [];
    });
};

watch([currentYear, currentMonth], ([newYear, newMonth], [oldYear, oldMonth]) => {
  // 只有当年月发生变化时才调用
  if (newYear !== oldYear || newMonth !== oldMonth) {
    loadReminders();
  }
});

const loadReminders = () => {
  const y = currentYear.value;
  const m = currentMonth.value + 1;
  fetchReminders(y, m).then((data) => {
    reminders.value = data;
  });
};

onMounted(loadReminders);

// 滑动切换月份
let startX = 0;
const onTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX;
};
const onTouchEnd = (e: TouchEvent) => {
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;
  if (Math.abs(diff) > 50) {
    const newDate = new Date(value.value);
    newDate.setMonth(newDate.getMonth() + (diff < 0 ? 1 : -1));
    value.value = newDate;
  }
};
</script>

<style scoped lang="scss">
.home {
  padding: 12px;
  background: #f7f7f7;
}
.date-content {
  height: 100%;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
}
.date-content.selected-day {
  background-color: #f0f9ff;
  border-radius: 6px;
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}
.date-content.not-current-month {
  opacity: 0.4;
}
.solar-date {
  font-size: 16px;
  font-weight: bold;
}
.lunar-date {
  font-size: 12px;
  color: #888;
}
.holiday,
.solar-term {
  font-size: 12px;
  color: #e74c3c;
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
.reminder-icon {
  font-size: 14px;
  margin-right: 2px;
}
.reminder-detail-list {
  margin-top: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.reminder-detail-list h4 {
  font-size: 16px;
  margin-bottom: 10px;
}
.reminder-detail-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.reminder-detail-item:last-child {
  border-bottom: none;
}
.month-reminder-list {
  margin-top: 20px;
}
</style>
