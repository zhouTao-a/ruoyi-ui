<template>
  <div class="app-container home">
    <el-calendar v-model="value" />
  </div>
</template>

<script setup name="Index" lang="ts">
onMounted(() => {});
const value = ref(new Date());
</script>

<style scoped lang="scss">
::v-deep {
  .el-table .el-table__header-wrapper th,
  .el-table .el-table__fixed-header-wrapper th {
    word-break: break-word;
    background-color: #fff !important;
    color: #6f6f6f;
    height: 40px !important;
    font-size: 14px;
    font-weight: 500;
    font-family: Source Han Sans;
  }

  //避免单元格之间出现白色边框
  .el-table__row > td {
    border: none;
  }

  //修改表格边框颜色
  .el-table {
    --el-table-border-color: #ffffff;
  }

  .el-table__body tr:nth-child(odd) {
    background-color: #fafafa; /* 偶数行（斑马线）的默认背景色 */
  }

  .el-table__body tr:nth-child(even) {
    background-color: #fff !important; /* 偶数行（斑马线）的默认背景色 */
  }
}
.home {
  width: 100%;
  min-height: calc(100vh - 84px);
  padding: 16px;
  background: #f7f7f7;
  overflow-y: auto;
  .home-box {
    width: 100%;
    padding: 20px;
    background: #ffffff;
    border-radius: 10px;
    width: 100%;
    height: 100%;
    border: 1px solid red;
  }
}
</style>
