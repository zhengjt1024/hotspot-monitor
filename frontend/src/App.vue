<template>
  <a-config-provider :theme="themeConfig">
    <div class="app-container">
      <div class="glow-orb glow-orb-left"></div>
      <div class="glow-orb glow-orb-right"></div>

      <Header
        :stats="stats"
        :notify-count="notifyCount"
        :active-tab="activeTab"
        @tab-change="onTabChange"
        @refresh="refreshStats"
        @trigger="handleTrigger"
      />

      <main class="main-content">
        <div v-if="activeTab === 'dashboard'" class="dashboard-grid">
          <div class="col-side">
            <KeywordManager :keywords="keywords" @refresh="refreshStats" />
          </div>
          <div class="col-main">
            <HotTopicsFeed :refresh-key="refreshKey" />
          </div>
          <div class="col-side">
            <NotificationPanel :refresh-key="refreshKey" @refresh="refreshStats" />
          </div>
        </div>

        <KeywordManager v-if="activeTab === 'keywords'" :keywords="keywords" @refresh="refreshStats" :full-width="true" />
        <HotTopicsFeed v-if="activeTab === 'topics'" :full-width="true" :refresh-key="refreshKey" />
        <NotificationPanel v-if="activeTab === 'notifications'" :refresh-key="refreshKey" @refresh="refreshStats" :full-width="true" />
        <Settings v-if="activeTab === 'settings'" :full-width="true" />
      </main>
    </div>
  </a-config-provider>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { theme } from 'ant-design-vue'
import Header from './components/Header.vue'
import KeywordManager from './components/KeywordManager.vue'
import HotTopicsFeed from './components/HotTopicsFeed.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import Settings from './components/Settings.vue'
import { api } from './lib/api'

const activeTab = ref('dashboard')
const stats = reactive({ total: 0, verified: 0, fake: 0, today: 0 })
const keywords = ref([])
const notifyCount = ref(0)
const refreshKey = ref(0)

const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#00f0ff',
    borderRadius: 8,
    colorBgContainer: 'rgba(26,26,46,0.7)',
    colorBgElevated: '#12121a',
    colorText: '#e2e8f0',
    colorTextSecondary: '#8892b0',
    colorBorder: 'rgba(255,255,255,0.06)',
  },
}

function onTabChange(tab) {
  activeTab.value = tab
}

async function refreshStats() {
  try {
    const [s, kw, n] = await Promise.all([
      api.getTopicStats(),
      api.getKeywords(),
      api.getNotifications(true),
    ])
    Object.assign(stats, s)
    keywords.value = kw
    notifyCount.value = n.unreadCount || 0
  } catch (e) { /* silent */ }
}

async function handleTrigger() {
  try {
    await api.triggerMonitor()
    message.success('监控已触发，正在搜集热点...')
    setTimeout(() => { refreshStats(); refreshKey.value++ }, 3000)
  } catch (e) {
    message.error('触发失败: ' + e.message)
  }
}

let timer
onMounted(() => {
  refreshStats()
  timer = setInterval(refreshStats, 30000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}
.glow-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.glow-orb-left {
  top: 80px; left: 40px;
  width: 380px; height: 380px;
  background: rgba(0,240,255,0.04);
}
.glow-orb-right {
  bottom: 80px; right: 40px;
  width: 320px; height: 320px;
  background: rgba(255,0,255,0.04);
}
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px 48px;
  position: relative;
  z-index: 1;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 16px;
}
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .col-side { order: 2; }
  .col-main { order: 1; }
}
</style>