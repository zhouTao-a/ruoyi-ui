<template>
  <div class="tabs-container">
    <!-- 横向滑动 Tabs -->
    <div class="tabs-scroll-wrapper">
      <div class="tabs-scroll">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab-item', { active: activeTab === tab.name }]"
          @click="handleTabClick(tab.name)"
          @touchstart.stop="onTabTouchStart"
          @touchend.stop="onTabTouchEnd"
        >
          {{ tab.label }}
          <div class="tab-indicator" v-if="activeTab === tab.name"></div>
        </div>
      </div>
    </div>

    <!-- Tab 内容区域 -->
    <div class="tab-content">
      <!-- 感想标签页 -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'thoughts'" class="tab-pane">
          <div class="thought-card" v-if="recReflection">
            <h3 class="thought-title">{{ recReflection.title }}</h3>
            <p v-if="recReflection.synopsis" class="thought-synopsis"><strong>概要:</strong> {{ recReflection.synopsis }}</p>
            <p v-if="recReflection.content" class="thought-content"><strong>感想:</strong> {{ recReflection.content }}</p>
            <p v-if="recReflection.sourceName" class="thought-source">
              <strong>来源:</strong> {{ recReflection.sourceName }}
              <span v-if="recReflection.sourceType"> — {{ recReflection.sourceType }} </span>
            </p>
            <a v-if="recReflection.sourceLink" :href="recReflection.sourceLink" class="thought-link" target="_blank">
              <strong>链接:</strong> {{ recReflection.sourceLink }}
            </a>
            <div class="button-container">
              <button @click="getList" class="refresh-btn">切 &nbsp;&nbsp;&nbsp;&nbsp;换</button>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无感想数据</p>
            <button @click="getList" class="refresh-btn small">获取数据</button>
          </div>
        </div>
      </transition>

      <!-- 目标标签页（日期区域加专属类：date-goal） -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'goals'" class="tab-pane goals-tab">
          <div v-if="formattedGoals.length > 0" class="reports-list">
            <div v-for="goal in formattedGoals" :key="goal.id" class="report-item">
              <div class="report-header">
                <div v-if="goal.hasChildren" class="expand-control" @click.stop="toggleGoalDetails(goal.id)">
                  <i class="expand-icon" :class="{ 'expanded': goal.showDetails }">
                    {{ goal.showDetails ? '−' : '+' }}
                  </i>
                </div>

                <!-- 目标日期区域：添加 date-goal 类 -->
                <div class="report-date date-goal">
                  <span class="date-day">{{ goal.formattedDate.day || '∞' }}</span>
                  <div class="date-month-year">
                    <span>{{ goal.formattedDate.month || '无截止' }}</span>
                    <span>{{ goal.formattedDate.year || '日期' }}</span>
                  </div>
                </div>

                <div class="report-divider"></div>
                <div class="task-status" :class="goal.statusClass">
                  {{ goal.statusText }}
                </div>
              </div>

              <div class="report-content">
                <h3 class="report-summary">{{ goal.title }}</h3>
                <div class="report-body">
                  <p>{{ goal.content }}</p>
                </div>
              </div>

              <!-- 子目标明细（原二级子目标，现在支持渲染三级） -->
              <div v-if="goal.showDetails && goal.children && goal.children.length" class="goal-details">
                <div class="subgoal-label">子目标 ({{ goal.children.length }})</div>
                <div class="subgoals-list">
                  <!-- 二级子目标（原逻辑），现在新增展开控制和三级目标渲染 -->
                  <div v-for="subgoal in goal.children" :key="subgoal.id" class="subgoal-item">
                    <div class="report-header">
                      <!-- 新增：三级目标的展开/折叠控制（和根目标逻辑一致） -->
                      <div v-if="subgoal.hasChildren" class="expand-control" @click.stop="toggleGoalDetails(subgoal.id)">
                        <i class="expand-icon" :class="{ 'expanded': subgoal.showDetails }">
                          {{ subgoal.showDetails ? '−' : '+' }}
                        </i>
                      </div>

                      <!-- 二级子目标日期（不变） -->
                      <div class="report-date date-goal">
                        <span class="date-day">{{ subgoal.formattedDate.day || '∞' }}</span>
                        <div class="date-month-year">
                          <span>{{ subgoal.formattedDate.month || '无截止' }}</span>
                          <span>{{ subgoal.formattedDate.year || '日期' }}</span>
                        </div>
                      </div>

                      <div class="report-divider"></div>
                      <div class="task-status" :class="subgoal.statusClass">
                        {{ subgoal.statusText }}
                      </div>
                    </div>

                    <!-- 二级子目标内容（不变） -->
                    <div class="report-content">
                      <h3 class="report-summary">{{ subgoal.title }}</h3>
                      <div class="report-body">
                        <p>{{ subgoal.content }}</p>
                      </div>
                    </div>

                    <!-- 新增：三级目标渲染区域（含四级目标扩展） -->
                    <div v-if="subgoal.showDetails && subgoal.children && subgoal.children.length" class="subgoal-details">
                      <div class="subgoal-label">子目标 ({{ subgoal.children.length }})</div>
                      <div class="subgoals-list">
                        <!-- 三级目标 -->
                        <div v-for="thirdGoal in subgoal.children" :key="thirdGoal.id" class="subgoal-item third-goal-item">
                          <div class="report-header">
                            <!-- 四级目标的展开/折叠控制 -->
                            <div v-if="thirdGoal.hasChildren" class="expand-control" @click.stop="toggleGoalDetails(thirdGoal.id)">
                              <i class="expand-icon" :class="{ 'expanded': thirdGoal.showDetails }">
                                {{ thirdGoal.showDetails ? '−' : '+' }}
                              </i>
                            </div>

                            <!-- 三级目标日期 -->
                            <div class="report-date date-goal">
                              <span class="date-day">{{ thirdGoal.formattedDate.day || '∞' }}</span>
                              <div class="date-month-year">
                                <span>{{ thirdGoal.formattedDate.month || '无截止' }}</span>
                                <span>{{ thirdGoal.formattedDate.year || '日期' }}</span>
                              </div>
                            </div>

                            <div class="report-divider"></div>
                            <div class="task-status" :class="thirdGoal.statusClass">
                              {{ thirdGoal.statusText }}
                            </div>
                          </div>

                          <!-- 三级目标内容 -->
                          <div class="report-content">
                            <h3 class="report-summary">{{ thirdGoal.title }}</h3>
                            <div class="report-body">
                              <p>{{ thirdGoal.content }}</p>
                            </div>
                          </div>

                          <!-- 新增：四级目标渲染区域（含五级目标扩展） -->
                          <div v-if="thirdGoal.showDetails && thirdGoal.children && thirdGoal.children.length" class="subgoal-details">
                            <div class="subgoal-label">子目标 ({{ thirdGoal.children.length }})</div>
                            <div class="subgoals-list">
                              <!-- 四级目标 -->
                              <div v-for="fourthGoal in thirdGoal.children" :key="fourthGoal.id" class="subgoal-item fourth-goal-item">
                                <div class="report-header">
                                  <!-- 五级目标的展开/折叠控制 -->
                                  <div v-if="fourthGoal.hasChildren" class="expand-control" @click.stop="toggleGoalDetails(fourthGoal.id)">
                                    <i class="expand-icon" :class="{ 'expanded': fourthGoal.showDetails }">
                                      {{ fourthGoal.showDetails ? '−' : '+' }}
                                    </i>
                                  </div>

                                  <!-- 四级目标日期 -->
                                  <div class="report-date date-goal">
                                    <span class="date-day">{{ fourthGoal.formattedDate.day || '∞' }}</span>
                                    <div class="date-month-year">
                                      <span>{{ fourthGoal.formattedDate.month || '无截止' }}</span>
                                      <span>{{ fourthGoal.formattedDate.year || '日期' }}</span>
                                    </div>
                                  </div>

                                  <div class="report-divider"></div>
                                  <div class="task-status" :class="fourthGoal.statusClass">
                                    {{ fourthGoal.statusText }}
                                  </div>
                                </div>

                                <!-- 四级目标内容 -->
                                <div class="report-content">
                                  <h3 class="report-summary">{{ fourthGoal.title }}</h3>
                                  <div class="report-body">
                                    <p>{{ fourthGoal.content }}</p>
                                  </div>
                                </div>

                                <!-- 新增：五级目标渲染区域 -->
                                <div v-if="fourthGoal.showDetails && fourthGoal.children && fourthGoal.children.length" class="subgoal-details">
                                  <div class="subgoal-label">子目标 ({{ fourthGoal.children.length }})</div>
                                  <div class="subgoals-list">
                                    <!-- 五级目标 -->
                                    <div v-for="fifthGoal in fourthGoal.children" :key="fifthGoal.id" class="subgoal-item fifth-goal-item">
                                      <div class="report-header">
                                        <!-- 可选：六级目标的展开控制（如需支持，复制此段即可） -->
                                        <div v-if="fifthGoal.hasChildren" class="expand-control" @click.stop="toggleGoalDetails(fifthGoal.id)">
                                          <i class="expand-icon" :class="{ 'expanded': fifthGoal.showDetails }">
                                            {{ fifthGoal.showDetails ? '−' : '+' }}
                                          </i>
                                        </div>

                                        <!-- 五级目标日期 -->
                                        <div class="report-date date-goal">
                                          <span class="date-day">{{ fifthGoal.formattedDate.day || '∞' }}</span>
                                          <div class="date-month-year">
                                            <span>{{ fifthGoal.formattedDate.month || '无截止' }}</span>
                                            <span>{{ fifthGoal.formattedDate.year || '日期' }}</span>
                                          </div>
                                        </div>

                                        <div class="report-divider"></div>
                                        <div class="task-status" :class="fifthGoal.statusClass">
                                          {{ fifthGoal.statusText }}
                                        </div>
                                      </div>

                                      <!-- 五级目标内容 -->
                                      <div class="report-content">
                                        <h3 class="report-summary">{{ fifthGoal.title }}</h3>
                                        <div class="report-body">
                                          <p>{{ fifthGoal.content }}</p>
                                        </div>
                                      </div>

                                      <!-- 可选：六级目标渲染区域（递归逻辑，结构同上） -->
                                      <!-- <div v-if="fifthGoal.showDetails && fifthGoal.children && fifthGoal.children.length" class="subgoal-details">
                                        ... 重复上述结构，变量名改为 sixthGoal，类名改为 sixth-goal-item ...
                                      </div> -->
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无目标数据</div>
        </div>
      </transition>

      <!-- 任务标签页（日期区域加专属类：date-task） -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'tasks'" class="tab-pane tasks-tab">
          <div v-if="tasks.length > 0" class="reports-list">
            <div v-for="task in formatTasks(tasks)" :key="task.id" class="report-item">
              <div class="report-header">
                <!-- 任务日期区域：添加 date-task 类 -->
                <div class="report-date date-task">
                  <span class="date-day">{{ task.formattedDate.day }}</span>
                  <div class="date-month-year">
                    <span>{{ task.formattedDate.month }}</span>
                    <span>{{ task.formattedDate.year }}</span>
                  </div>
                </div>

                <div class="report-divider"></div>
                <div class="task-status" :class="task.statusClass">
                  {{ task.statusText }}
                </div>
              </div>
              <div class="report-content">
                <h3 class="report-summary">{{ task.title }}</h3>
                <div class="report-body">
                  <p>{{ task.content }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无任务数据</div>
        </div>
      </transition>

      <!-- 报告标签页（日期区域加专属类：date-report） -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'reports'" class="tab-pane reports-tab">
          <div v-if="reports.length > 0" class="reports-list">
            <div v-for="report in formatReports(reports)" :key="report.id" class="report-item">
              <div class="report-header">
                <!-- 报告日期区域：添加 date-report 类 -->
                <div class="report-date date-report">
                  <span class="date-day">{{ report.formattedDate.day }}</span>
                  <div class="date-month-year">
                    <span>{{ report.formattedDate.month }}</span>
                    <span>{{ report.formattedDate.year }}</span>
                  </div>
                </div>

                <div class="report-divider"></div>
              </div>
              <div class="report-content">
                <h3 class="report-summary">{{ report.summary }}</h3>
                <div class="report-body">
                  <p>{{ report.content }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无报告数据</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
// 脚本部分无修改，保持原逻辑
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { listRecReflection } from '@/api/rec/recReflection';
import { listRecReport } from '@/api/rec/recReport';
import { listRecGoal } from '@/api/rec/recGoal';
import { listRecTask } from '@/api/rec/recTask';
import { RecReportVO } from '@/api/rec/recReport/types';
import { RecReflectionVO } from '@/api/rec/recReflection/types';
import { RecGoalVO } from '@/api/rec/recGoal/types';
import { RecTaskVO } from '@/api/rec/recTask/types';

interface FormattedGoal {
  id: string | number;
  title: string;
  content: string;
  status: string;
  statusText: string;
  statusClass: string;
  deadLine: string | null;
  formattedDate: {
    year: string | number;
    month: string;
    day: string;
  };
  hasDeadLine: boolean;
  hasChildren: boolean;
  children?: FormattedGoal[];
  showDetails?: boolean;
}

const tabs = [
  { name: 'thoughts', label: '感想' },
  { name: 'goals', label: '目标' },
  { name: 'tasks', label: '任务' },
  { name: 'reports', label: '报告' }
];

const activeTab = ref('thoughts');
const recReflection = ref<RecReflectionVO | null>(null);
const reports = ref<RecReportVO[]>([]);
const tasks = ref<RecTaskVO[]>([]);
const goals = ref<RecGoalVO[]>([]);
const formattedGoals = ref<FormattedGoal[]>([]);

const recRefParams = ref({ pageNum: 1, pageSize: 1, randomFlag: true });
const pageQueryParams = ref({ pageNum: 1, pageSize: 10 });

const formatGoals = (goals: RecGoalVO[]): FormattedGoal[] => {
  return goals.map((goal) => {
    let formattedDate = { year: '', month: '', day: '' };
    let hasDeadLine = false;
    let statusText = '';
    let statusClass = '';

    if (goal.deadLine) {
      const deadlineDate = new Date(goal.deadLine);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // 时分秒重置为 0，只保留日期维度

      formattedDate = {
        year: deadlineDate.getFullYear().toString(),
        month: `${deadlineDate.getMonth() + 1}月`,
        day: deadlineDate.getDate().toString()
      };
      hasDeadLine = true;

      if (goal.status === 'completed') {
        statusText = '已完成';
        statusClass = 'status-completed';
      } else if (deadlineDate < currentDate) {
        statusText = '已逾期';
        statusClass = 'status-overdue';
      } else if (goal.status === 'in_progress') {
        statusText = '进行中';
        statusClass = 'status-in-progress';
      } else {
        statusText = '待处理';
        statusClass = 'status-pending';
      }
    } else {
      statusText = '无截止日期';
      statusClass = 'status-no-deadline';
    }

    const hasChildren = goal.children && goal.children.length > 0;
    const children = hasChildren ? formatGoals(goal.children) : undefined;

    return {
      id: goal.id,
      title: goal.title,
      content: goal.content,
      status: goal.status,
      statusText,
      statusClass,
      deadLine: goal.deadLine,
      formattedDate,
      hasDeadLine,
      hasChildren,
      children,
      showDetails: false
    };
  });
};

const formatTasks = (tasks: any[]) =>
  tasks.map((task) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return {
      ...task,
      formattedDate: {
        year: new Date(task.deadLine).getFullYear(),
        month: `${new Date(task.deadLine).getMonth() + 1}月`,
        day: new Date(task.deadLine).getDate().toString()
      },
      statusText:
        task.status === 'completed'
          ? '已完成'
          : new Date(task.deadLine) < currentDate
            ? '已逾期'
            : task.status === 'in-progress'
              ? '进行中'
              : '待处理',
      statusClass:
        task.status === 'completed'
          ? 'status-completed'
          : new Date(task.deadLine) < currentDate
            ? 'status-overdue'
            : task.status === 'in-progress'
              ? 'status-in-progress'
              : 'status-pending'
    };
  });

const formatReports = (reports: any[]) =>
  reports.map((report) => ({
    ...report,
    formattedDate: {
      year: new Date(report.reportDate).getFullYear(),
      month: `${new Date(report.reportDate).getMonth() + 1}月`,
      day: new Date(report.reportDate).getDate().toString()
    }
  }));

const toggleGoalDetails = (goalId: string | number) => {
  const toggleInArray = (goalsArray: FormattedGoal[]) => {
    for (const goal of goalsArray) {
      if (goal.id === goalId) {
        goal.showDetails = !goal.showDetails;
        return true;
      }
      if (goal.children && toggleInArray(goal.children)) {
        return true;
      }
    }
    return false;
  };
  toggleInArray(formattedGoals.value);
};

const getList = async () => {
  try {
    const res = await listRecReflection(recRefParams.value);
    recReflection.value = res.rows?.[0] || null;
  } catch (e) {
    recReflection.value = null;
  }
};

const getGoalList = async () => {
  try {
    const res = await listRecGoal(pageQueryParams.value);
    goals.value = convertToTree(res.rows);
    formattedGoals.value = formatGoals(goals.value.filter((goal) => !goal.parentId || goal.parentId === 0));
  } catch (e) {
    goals.value = [];
    formattedGoals.value = [];
  }
};

function convertToTree(flatData: RecGoalVO[]) {
  const nodeMap = new Map();
  const tree: RecGoalVO[] = [];
  flatData.forEach((node) => {
    nodeMap.set(node.id, { ...node, children: [] });
  });
  flatData.forEach((node) => {
    const currentNode = nodeMap.get(node.id);
    if (node.parentId === 0) {
      tree.push(currentNode);
    } else {
      const parentNode = nodeMap.get(node.parentId);
      if (parentNode) {
        parentNode.children.push(currentNode);
      }
    }
  });
  return tree;
}

const getReportList = async () => {
  try {
    const res = await listRecReport(pageQueryParams.value);
    reports.value = res.rows || [];
  } catch (e) {
    reports.value = [];
  }
};

const getTaskList = async () => {
  try {
    const res = await listRecTask(pageQueryParams.value);
    tasks.value = res.rows || [];
  } catch (e) {
    tasks.value = [];
  }
};

getList();
getReportList();
getGoalList();
getTaskList();

watch(goals, (newGoals) => {
  formattedGoals.value = formatGoals(newGoals.filter((goal) => !goal.parentId || goal.parentId === 0));
});

let startX = 0,
  startY = 0,
  endX = 0,
  endY = 0,
  startTime = 0,
  isSwiping = false;
const SWIPE_THRESHOLD = 50,
  CLICK_THRESHOLD = 10,
  VERTICAL_SWIPE_THRESHOLD = 20;

const handleGlobalTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startTime = Date.now();
  isSwiping = true;
};

const handleGlobalTouchMove = (e: TouchEvent) => {
  if (!isSwiping || e.touches.length !== 1) return;
  endX = e.touches[0].clientX;
  endY = e.touches[0].clientY;
};

const handleGlobalTouchEnd = () => {
  if (!isSwiping) return;
  const deltaX = endX - startX,
    deltaY = endY - startY;
  const currentIndex = tabs.findIndex((tab) => tab.name === activeTab.value);
  if (Math.abs(deltaY) > VERTICAL_SWIPE_THRESHOLD || Math.abs(deltaX) <= CLICK_THRESHOLD) {
    resetSwipeState();
    return;
  }
  const isFastSwipe = Math.abs(deltaX) / (Date.now() - startTime) > 0.5;
  if (Math.abs(deltaX) > SWIPE_THRESHOLD || isFastSwipe) {
    if (deltaX < 0 && currentIndex < tabs.length - 1) {
      activeTab.value = tabs[currentIndex + 1].name;
    } else if (deltaX > 0 && currentIndex > 0) {
      activeTab.value = tabs[currentIndex - 1].name;
    }
  }
  resetSwipeState();
};

const handleGlobalTouchCancel = () => resetSwipeState();
const resetSwipeState = () => {
  startX = startY = endX = endY = startTime = 0;
  isSwiping = false;
};

const handleTabClick = (tabName: string) => {
  activeTab.value = tabName;
};

const onTabTouchStart = (e: TouchEvent) => {
  e.stopPropagation();
  isSwiping = false;
};

const onTabTouchEnd = (e: TouchEvent) => {
  e.stopPropagation();
};

const scrollToActiveTab = () => {
  const activeElement = document.querySelector('.tab-item.active');
  const wrapper = document.querySelector('.tabs-scroll-wrapper');
  if (!activeElement || !wrapper) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  const tabRect = activeElement.getBoundingClientRect();
  const scrollPosition = tabRect.left - wrapperRect.left + wrapper.scrollLeft - (wrapperRect.width / 2 - tabRect.width / 2);
  wrapper.scrollTo({ left: scrollPosition, behavior: 'smooth' });
};

watch(activeTab, scrollToActiveTab);

onMounted(() => {
  document.addEventListener('touchstart', handleGlobalTouchStart, { passive: false });
  document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
  document.addEventListener('touchend', handleGlobalTouchEnd);
  document.addEventListener('touchcancel', handleGlobalTouchCancel);
});

onUnmounted(() => {
  document.removeEventListener('touchstart', handleGlobalTouchStart);
  document.removeEventListener('touchmove', handleGlobalTouchMove);
  document.removeEventListener('touchend', handleGlobalTouchEnd);
  document.removeEventListener('touchcancel', handleGlobalTouchCancel);
});
</script>

<style scoped>
/* 基础样式保持不变 */
.tabs-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-scroll-wrapper {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f5f5f5;
}

.tabs-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.tabs-scroll {
  display: flex;
  width: max-content;
  padding: 0 16px;
}

.tab-item {
  flex: 0 0 auto;
  padding: 16px 24px;
  margin: 0 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
}

.tab-item:hover {
  color: #409eff;
  background-color: #f0f7ff;
}

.tab-item.active {
  color: #409eff;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #409eff;
  border-radius: 3px 3px 0 0;
}

.tab-content {
  overflow: hidden;
  padding: 16px;
  min-height: 300px;
}

.tab-pane {
  width: 100%;
  transition: all 0.3s ease;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease;
}

.report-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.report-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.expand-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e8f3ff;
  color: #409eff;
  font-size: 14px;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 1. 日期区域基础样式（保留通用布局） */
.report-date {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px; /* 增加内边距，让背景色更明显 */
  border-radius: 8px; /* 加圆角，提升美观度 */
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.date-month-year {
  display: flex;
  flex-direction: column;
}

.date-month-year span:first-child {
  font-size: 14px;
  font-weight: 500;
}

.date-month-year span:last-child {
  font-size: 12px;
  opacity: 0.8;
}

/* 2. 目标日期专属样式（淡蓝色） */
.date-goal {
  background-color: rgba(64, 158, 255, 0.1); /* 淡蓝背景 */
}
.date-goal .date-day {
  color: #409eff; /* 蓝色日期 */
}
.date-goal .date-month-year {
  color: #004085; /* 深蓝色文字 */
}

/* 3. 任务日期专属样式（淡绿色） */
.date-task {
  background-color: rgba(103, 194, 58, 0.1); /* 淡绿背景 */
}
.date-task .date-day {
  color: #67c23a; /* 绿色日期 */
}
.date-task .date-month-year {
  color: #155724; /* 深绿色文字 */
}

/* 4. 报告日期专属样式（淡橙色） */
.date-report {
  background-color: rgba(230, 162, 60, 0.1); /* 淡橙背景 */
}
.date-report .date-day {
  color: #e6a23c; /* 橙色日期 */
}
.date-report .date-month-year {
  color: #856404; /* 深橙色文字 */
}

/* 无截止日期样式补充 */
.date-goal .date-day.no-deadline,
.date-task .date-day.no-deadline,
.date-report .date-day.no-deadline {
  color: #909399;
  font-size: 20px;
}

.report-divider {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
  margin-left: 16px;
}

.report-content {
  padding: 16px;
}

.report-summary {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.4;
}

.report-body {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
  padding-left: 4px;
  border-left: 2px solid #e0e0e0;
}

.goal-details {
  border-top: 1px dashed #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.subgoal-label {
  padding: 8px 16px;
  font-size: 13px;
  color: #409eff;
  background-color: #f0f7ff;
  border-bottom: 1px solid #e6f7ff;
}

.subgoals-list {
  padding: 8px;
  background-color: #fafafa;
}

.subgoal-item {
  border-radius: 6px;
  background-color: #fff;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
}

.subgoal-item:last-child {
  margin-bottom: 0;
}

.task-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 16px;
  white-space: nowrap;
}

.status-pending {
  background-color: #e9ecef;
  color: #495057;
}

.status-in-progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-overdue {
  background-color: #f8d7da;
  color: #721c24;
}

.status-no-deadline {
  background-color: #f0f2f5;
  color: #606266;
}

.thought-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.thought-title {
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.thought-synopsis,
.thought-content,
.thought-source {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #606266;
  font-size: 15px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.refresh-btn {
  width: 100%;
  max-width: 300px;
  padding: 12px 0;
  background-color: #409eff;
  color: #fff;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #909399;
  font-size: 16px;
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .tab-item {
    padding: 14px 18px;
    font-size: 15px;
  }
  .report-date {
    padding: 4px 8px; /* 小屏幕缩小内边距 */
  }
}

@media (max-width: 480px) {
  .tab-item {
    padding: 12px 14px;
    font-size: 14px;
  }
  .date-day {
    font-size: 20px;
  }
  .report-date {
    gap: 6px; /* 小屏幕缩小间距 */
  }
}

/* 三级目标容器：缩进 + 浅蓝色边框，与二级目标区分 */
.third-goal-item {
  margin-left: 16px; /* 缩进，体现层级 */
  border-color: #e6f7ff; /* 浅蓝色边框，区别于二级的灰色 */
}

/* 三级目标的展开控制：缩小尺寸，视觉上更紧凑 */
.third-goal-item .expand-control {
  width: 20px;
  height: 20px;
}
.third-goal-item .expand-icon {
  width: 14px;
  height: 14px;
  font-size: 12px;
}

/* 三级目标的内容区域：左侧边框改为浅蓝色，区分层级 */
.third-goal-item .report-body {
  border-left-color: #e6f7ff;
}

/* 三级目标的详情容器：浅蓝色虚线边框 */
.subgoal-details .subgoal-details {
  border-top-color: #e6f7ff;
}
</style>
