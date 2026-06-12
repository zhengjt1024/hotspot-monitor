<template>
  <header class="app-header">
    <div class="scan-line"></div>
    <div class="header-inner">
      <div class="header-top">
        <!-- Logo -->
        <div class="logo-area">
          <div class="logo-icon">
            <radar-chart-outlined :style="{ fontSize: '20px', color: '#00f0ff' }" />
          </div>
          <div>
            <h1 class="logo-title">
              AI <span class="neon-text">Hot</span> Monitor
            </h1>
            <p class="logo-sub">智能热点监控系统</p>
          </div>
        </div>

        <!-- Stats + Trigger -->
        <div class="stats-area">
          <span class="status-dot"><span class="glow-dot"></span> 在线</span>
          <a-tag color="cyan">总计 {{ stats.total }}</a-tag>
          <a-tag color="green">已验证 {{ stats.verified }}</a-tag>
          <a-tag color="red">疑似虚假 {{ stats.fake }}</a-tag>
          <a-tag color="gold">今日新增 {{ stats.today }}</a-tag>
          <a-button type="primary" size="small" @click="('trigger')">
            <reload-outlined /> 立即扫描
          </a-button>
        </div>
      </div>

      <!-- Navigation -->
      <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" class="nav-menu" @click="onMenuClick">
        <a-menu-item key="dashboard">
          <appstore-outlined /> 控制台
        </a-menu-item>
        <a-menu-item key="keywords">
          <tags-outlined /> 关键词
        </a-menu-item>
        <a-menu-item key="topics">
          <fire-outlined /> 热点
        </a-menu-item>
        <a-menu-item key="notifications">
          <a-badge :count="notifyCount" :overflow-count="99" size="small">
            <bell-outlined /> 通知
          </a-badge>
        </a-menu-item>
        <a-menu-item key="settings">
          <setting-outlined /> 设置
        </a-menu-item>
      </a-menu>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  RadarChartOutlined, ReloadOutlined, AppstoreOutlined,
  TagsOutlined, FireOutlined, BellOutlined, SettingOutlined,
} from '@ant-design/icons-vue'

const props = defineProps({
  stats: Object,
  notifyCount: Number,
  activeTab: String,
})
const emit = defineEmits(['tab-change', 'refresh', 'trigger'])

const selectedKeys = ref([props.activeTab])

watch(() => props.activeTab, (val) => {
  selectedKeys.value = [val]
})

function onMenuClick({ key }) {
  emit('tab-change', key)
}
</script>

<style scoped>
.app-header {
  position: relative;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(18,18,26,0.6);
  backdrop-filter: blur(16px);
  z-index: 10;
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0 4px;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: rgba(0,240,255,0.1);
  border: 1px solid rgba(0,240,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.logo-sub {
  font-size: 11px;
  color: #555;
  font-family: monospace;
}
.stats-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #8892b0;
}
.status-dot {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #39ff14;
  font-family: monospace;
}
.nav-menu {
  margin-top: 4px;
  background: transparent !important;
}
</style>