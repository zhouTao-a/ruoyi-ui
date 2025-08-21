<template>
  <div class="tab-container">
    <div class="tabs-wrapper">
      <div class="tabs">
        <div v-for="tab in tabs" :key="tab.key" :class="['tab', { active: tab.key === activeTab }]" @click="switchTab(tab.key)">
          {{ tab.label }}
        </div>
      </div>
    </div>

    <div class="tab-content">
      <slot :active="activeTab" :data="tabData[activeTab] || []" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

interface Tab {
  key: string;
  label: string;
}

const props = defineProps<{
  tabs: Tab[];
  fetchData: (key: string) => Promise<any>;
}>();

const activeTab = ref(props.tabs[0]?.key || '');
const tabData = reactive<Record<string, any>>({});

const switchTab = (key: string) => {
  activeTab.value = key;
};

watch(
  activeTab,
  async (key) => {
    if (!tabData[key]) {
      tabData[key] = await props.fetchData(key);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.tab-container {
  border: 1px solid #eee;
}

/* 横向滑动 wrapper */
.tabs-wrapper {
  overflow-x: auto;
}

.tabs {
  display: flex;
  min-width: max-content; /* 保证宽度根据内容撑开 */
  border-bottom: 1px solid #ccc;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap; /* 防换行 */
}

.tab.active {
  font-weight: bold;
  border-bottom: 2px solid #409eff;
}

.tab-content {
  padding: 16px;
}
</style>
