<template>
  <!-- 外层容器仅用于展示内容，触摸事件绑定到全局 -->
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

      <!-- 目标标签页（树形结构，支持展开/折叠） -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'goals'" class="tab-pane goals-tab">
          <div v-if="goalTree.length > 0" class="reports-list">
            <!-- 递归渲染树形结构 -->
            <GoalNode v-for="goal in goalTree" :key="goal.id" :goal="goal" :level="1" @toggle="handleGoalToggle" />
          </div>
          <div v-else class="empty-state">暂无目标数据</div>
        </div>
      </transition>

      <!-- 任务标签页 -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'tasks'" class="tab-pane tasks-tab">
          <div v-if="tasks.length > 0" class="reports-list">
            <!-- 任务列表项 -->
            <div v-for="(task, index) in formatTasks(tasks)" :key="task.id" class="report-item">
              <div class="report-header">
                <div class="report-date">
                  <span class="date-day">{{ task.formattedDate.day }}</span>
                  <div class="date-month-year">
                    <span>{{ task.formattedDate.month }}</span>
                    <span>{{ task.formattedDate.year }}</span>
                  </div>
                </div>
                <div class="report-divider"></div>

                <!-- 任务状态：添加在日期右侧 -->
                <div class="task-status" :class="task.statusClass">
                  {{ task.statusText }}
                </div>
              </div>

              <!-- 任务内容：与报告保持一致 -->
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

      <!-- 报告标签页 -->
      <transition name="tab-fade">
        <div v-show="activeTab === 'reports'" class="tab-pane reports-tab">
          <div v-if="reports.length > 0" class="reports-list">
            <!-- 报告列表项 -->
            <div v-for="(report, index) in formatReports(reports)" :key="report.id" class="report-item">
              <!-- 报告头部：日期与装饰 -->
              <div class="report-header">
                <div class="report-date">
                  <span class="date-day">{{ report.formattedDate.day }}</span>
                  <div class="date-month-year">
                    <span>{{ report.formattedDate.month }}</span>
                    <span>{{ report.formattedDate.year }}</span>
                  </div>
                </div>
                <div class="report-divider"></div>
              </div>

              <!-- 报告内容 -->
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
import { ref, getCurrentInstance, toRefs, onMounted, watch, onUnmounted, defineComponent, h } from 'vue';
import { listRecReflection } from '@/api/rec/recReflection';
import { listRecReport } from '@/api/rec/recReport';
import { listRecGoal } from '@/api/rec/recGoal';
import { listRecTask } from '@/api/rec/recTask';
import { RecReportVO } from '@/api/rec/recReport/types';
import { RecReflectionVO } from '@/api/rec/recReflection/types';
import { RecGoalVO } from '@/api/rec/recGoal/types';
import { RecTaskVO } from '@/api/rec/recTask/types';

// 修正接口定义 - 保持children为必填属性以匹配RecGoalVO
interface GoalNode extends RecGoalVO {
  formattedDate: {
    year: number;
    month: string;
    day: string;
  };
  isExpanded?: boolean; // 控制展开/折叠状态
}

// 类型断言函数
function isGoalNode(node: any): node is GoalNode {
  return 'formattedDate' in node && 'isExpanded' in node;
}

// 转换扁平目标数据为树形结构
const formatGoalsToTree = (goals: RecGoalVO[]): GoalNode[] => {
  const nodes = goals.map(
    (goal) =>
      ({
        ...goal,
        formattedDate: {
          year: new Date(goal.deadLine).getFullYear(),
          month: `${new Date(goal.deadLine).getMonth() + 1}月`,
          day: new Date(goal.deadLine).getDate().toString()
        },
        isExpanded: false,
        children: goal.children || []
      }) as GoalNode
  );

  const nodeMap = new Map<string | number, GoalNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  const tree: GoalNode[] = [];
  nodes.forEach((node) => {
    if (!node.parentId) {
      tree.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) (parent.children as GoalNode[]).push(node);
      else tree.push(node);
    }
  });
  return tree;
};

// 定义目标节点组件（通过defineComponent实现）
const GoalNode = defineComponent({
  name: 'GoalNode',
  props: {
    goal: {
      type: Object as () => GoalNode,
      required: true
    },
    level: {
      type: Number,
      required: true
    }
  },
  emits: ['toggle'],
  render() {
    const { goal, level } = this;
    // 递归引用自身需要使用this.$options.components
    const SelfComponent = this.$options.components?.GoalNode;

    return h(
      'div',
      {
        class: ['report-item', `level-${level}`]
      },
      [
        // 目标头部
        h(
          'div',
          {
            class: 'report-header',
            onClick: () => this.$emit('toggle', goal.id)
          },
          [
            // 展开/折叠按钮
            goal.children &&
              goal.children.length &&
              h('div', { class: 'expand-control' }, [
                h(
                  'i',
                  {
                    class: ['expand-icon', { 'expanded': goal.isExpanded }]
                  },
                  goal.isExpanded ? '−' : '+'
                )
              ]),
            // 日期区域
            h('div', { class: 'report-date' }, [
              h('span', { class: 'date-day' }, goal.formattedDate.day),
              h('div', { class: 'date-month-year' }, [h('span', goal.formattedDate.month), h('span', goal.formattedDate.year)])
            ]),
            h('div', { class: 'report-divider' }),
            // 目标类型
            h('div', { class: ['task-status', 'status-pending'] }, goal.parentId ? '子目标' : '主目标')
          ]
        ),
        // 目标内容
        h('div', { class: 'report-content' }, [
          h('h3', { class: 'report-summary' }, goal.title),
          h('div', { class: 'report-body' }, [
            h('p', goal.content),
            goal.parentId && h('p', { class: 'goal-parent-id' }, `父目标ID：${goal.parentId}`),
            h('p', [h('strong', '进度：'), `${goal.progress}%`]),
            h('p', [h('strong', '状态：'), goal.status])
          ])
        ]),
        // 子目标容器
        goal.isExpanded &&
          goal.children &&
          goal.children.length &&
          h(
            'div',
            { class: 'children-container' },
            goal.children.map((child: GoalNode) =>
              h(SelfComponent, {
                goal: child,
                level: level + 1,
                onToggle: (id: string | number) => this.$emit('toggle', id)
              })
            )
          )
      ]
    );
  }
});

// 类型定义和数据初始化
const tabs = [
  { name: 'thoughts', label: '感想' },
  { name: 'goals', label: '目标' },
  { name: 'tasks', label: '任务' },
  { name: 'reports', label: '报告' }
];

const instance = getCurrentInstance();
const proxy = instance?.proxy;
const { source_type } = toRefs<any>(proxy?.useDict('source_type'));

const activeTab = ref('thoughts');
const recReflection = ref<RecReflectionVO | null>(null);
const reports = ref<RecReportVO[]>([]);
const tasks = ref<RecTaskVO[]>([]);
const goals = ref<RecGoalVO[]>([]);
const goalTree = ref<GoalNode[]>([]);
const recRefParams = ref({ pageNum: 1, pageSize: 1, randomFlag: true });
const pageQueryParams = ref({ pageNum: 1, pageSize: 10 });

// 格式化任务
const formatTasks = (tasks: any[]) =>
  tasks.map((task) => ({
    ...task,
    formattedDate: {
      year: new Date(task.deadLine).getFullYear(),
      month: `${new Date(task.deadLine).getMonth() + 1}月`,
      day: new Date(task.deadLine).getDate().toString()
    },
    statusText:
      task.status === 'completed' ? '已完成' : new Date(task.deadLine) < new Date() ? '已逾期' : task.status === 'in-progress' ? '进行中' : '待处理',
    statusClass:
      task.status === 'completed'
        ? 'status-completed'
        : new Date(task.deadLine) < new Date()
          ? 'status-overdue'
          : task.status === 'in-progress'
            ? 'status-in-progress'
            : 'status-pending'
  }));

// 格式化报告
const formatReports = (reports: any[]) =>
  reports.map((report) => ({
    ...report,
    formattedDate: {
      year: new Date(report.reportDate).getFullYear(),
      month: `${new Date(report.reportDate).getMonth() + 1}月`,
      day: new Date(report.reportDate).getDate().toString()
    }
  }));

// 处理目标展开/折叠
const handleGoalToggle = (goalId: string | number) => {
  const toggleNode = (nodes: GoalNode[]) => {
    for (const node of nodes) {
      if (node.id === goalId) {
        node.isExpanded = !node.isExpanded;
        return true;
      }
      if (toggleNode(node.children as GoalNode[])) return true;
    }
    return false;
  };
  toggleNode(goalTree.value);
};

// 数据获取函数
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
    goals.value = res.rows || [];
    goalTree.value = formatGoalsToTree(goals.value);
  } catch (e) {
    goals.value = [];
    goalTree.value = [];
  }
};

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

// 初始化数据
getList();
getReportList();
getGoalList();
getTaskList();

// 监听目标数据变化
watch(goals, (newGoals) => {
  goalTree.value = formatGoalsToTree(newGoals);
});

// 滑动切换逻辑
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

// Tab点击事件
const handleTabClick = (tabName: string) => {
  activeTab.value = tabName;
};

// 阻止Tab触摸事件冒泡
const onTabTouchStart = (e: TouchEvent) => {
  e.stopPropagation();
  isSwiping = false;
};

const onTabTouchEnd = (e: TouchEvent) => {
  e.stopPropagation();
};

// 滚动到激活的Tab
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

// 组件生命周期
onMounted(() => {
  resetSwipeState();
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
.tabs-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 横向滑动 Tabs 优化 */
.tabs-scroll-wrapper {
  overflow-x: auto;
  scrollbar-width: none; /* 隐藏滚动条 */
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f5f5f5;
}

.tabs-scroll-wrapper::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab 内容区域优化 */
.tab-content {
  overflow: hidden;
  padding: 16px;
  min-height: 300px;
}

.tab-pane {
  width: 100%;
  transition: all 0.3s ease;
}

/* 内容切换动画 */
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

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 感想卡片优化 */
.thought-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.thought-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.thought-title {
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
  line-height: 1.4;
}

.thought-synopsis,
.thought-content,
.thought-source {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #606266;
  font-size: 15px;
}

.thought-synopsis strong,
.thought-content strong,
.thought-source strong {
  color: #303133;
  margin-right: 8px;
}

.thought-link {
  display: inline-block;
  margin-top: 8px;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.thought-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

/* 按钮样式优化 */
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
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.25s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.refresh-btn.small {
  max-width: 160px;
  padding: 8px 0;
  font-size: 14px;
}

.refresh-btn:hover {
  background-color: #66b1ff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.refresh-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 空状态样式 */
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

.empty-state p {
  margin-bottom: 16px;
}

/* 报告、任务、目标通用样式 */
.reports-tab,
.goals-tab,
.tasks-tab {
  padding: 16px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 列表项间距 */
}

.report-item {
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.report-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #f0f0f0;
}

.report-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-day {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.date-month-year {
  display: flex;
  flex-direction: column;
  color: #606266;
}

.date-month-year span:first-child {
  font-size: 14px;
  font-weight: 500;
}

.date-month-year span:last-child {
  font-size: 12px;
  opacity: 0.8;
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
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.4;
}

.report-body {
  color: #606266;
  line-height: 1.8;
  font-size: 15px;
  padding-left: 4px;
  border-left: 2px solid #e0e0e0;
}

.reports-tab .empty-state,
.goals-tab .empty-state,
.tasks-tab .empty-state {
  min-height: 300px;
}

/* 任务状态样式 */
.task-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 16px;
  white-space: nowrap; /* 确保状态文字不换行 */
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

/* 目标树形结构特有样式 */
/* 目标节点层级样式 */
.level-1 {
  border-left: 3px solid #409eff;
}
.level-2 {
  border-left: 3px solid #67c23a;
  margin-left: 24px;
}
.level-3 {
  border-left: 3px solid #e6a23c;
  margin-left: 48px;
}
.level-4 {
  border-left: 3px solid #f56c6c;
  margin-left: 72px;
}

/* 展开/折叠控制 */
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

/* 子目标容器 */
.children-container {
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* 报告头部点击区域优化 */
.report-header {
  cursor: pointer;
}

/* 父目标ID样式调整 */
.goal-parent-id {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
  padding-left: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tab-item {
    padding: 14px 18px;
    font-size: 15px;
  }

  .thought-card {
    padding: 16px;
  }

  .thought-title {
    font-size: 18px;
  }

  .tab-content {
    padding: 12px;
  }

  .level-2 {
    margin-left: 16px;
  }
  .level-3 {
    margin-left: 32px;
  }
  .level-4 {
    margin-left: 48px;
  }
}

@media (max-width: 480px) {
  .tab-item {
    padding: 12px 14px;
    font-size: 14px;
  }

  .refresh-btn {
    font-size: 15px;
  }

  .date-day {
    font-size: 24px;
  }

  .level-2 {
    margin-left: 12px;
  }
  .level-3 {
    margin-left: 24px;
  }
  .level-4 {
    margin-left: 36px;
  }
}
</style>
