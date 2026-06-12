<template>
  <a-card :title="null" :bordered="true" class="settings-card" :style="cardStyle">
    <template #title>
      <span style="display:flex;align-items:center;gap:8px">
        <setting-outlined style="color:#b026ff" />
        <span style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">设置</span>
      </span>
    </template>

    <a-space direction="vertical" :size="20" style="width:100%">
      <!-- Check Interval -->
      <div>
        <label class="setting-label">监控间隔（分钟）</label>
        <a-select v-model:value="checkInterval" style="width:100%">
          <a-select-option value="5">5 分钟（高频）</a-select-option>
          <a-select-option value="15">15 分钟</a-select-option>
          <a-select-option value="30">30 分钟（推荐）</a-select-option>
          <a-select-option value="60">60 分钟</a-select-option>
          <a-select-option value="120">120 分钟（低频）</a-select-option>
        </a-select>
      </div>

      <!-- Browser Notifications -->
      <div>
        <label class="setting-label">浏览器通知</label>
        <a-button size="small" @click="requestNotification">🔔 开启桌面通知</a-button>
        <p class="setting-hint">开启后，发现新热点时会弹出桌面通知</p>
      </div>

      <!-- API Status -->
      <div>
        <label class="setting-label">API 配置状态</label>
        <a-space direction="vertical" :size="4">
          <span class="api-status">
            <span class="api-dot on"></span> OpenRouter: {{ apiStatus.openrouter ? '已配置' : '未配置（使用降级模式）' }}
          </span>
          <span class="api-status">
            <span class="api-dot" :class="apiStatus.twitter ? 'on' : 'warn'"></span>
            Twitter API: {{ apiStatus.twitter ? '已配置' : '未配置' }}
          </span>
        </a-space>
      </div>

      <a-button type="primary" block @click="saveSettings" :loading="saving">保存设置</a-button>
    </a-space>
  </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import { api } from '../lib/api'

const props = defineProps({ fullWidth: Boolean })
const cardStyle = props.fullWidth ? { maxWidth: '500px' } : {}

const checkInterval = ref('30')
const apiStatus = ref({ openrouter: false, twitter: false })
const saving = ref(false)

onMounted(async () => {
  try {
    const s = await api.getSettings()
    if (s.check_interval) checkInterval.value = s.check_interval
  } catch (e) { /* */ }
})

async function requestNotification() {
  if (!('Notification' in window)) {
    message.error('浏览器不支持通知')
    return
  }
  const perm = await Notification.requestPermission()
  if (perm === 'granted') {
    message.success('通知权限已开启')
  } else {
    message.error('通知权限被拒绝')
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await api.updateSettings({ check_interval: checkInterval.value })
    message.success('设置已保存（重启服务后生效）')
  } catch (e) {
    message.error(e.message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-card { border-radius: 12px; }
.setting-label {
  display: block;
  font-size: 12px;
  color: #8892b0;
  margin-bottom: 6px;
}
.setting-hint {
  font-size: 10px;
  color: #555;
  margin-top: 4px;
}
.api-status {
  font-size: 12px;
  color: #8892b0;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 6px;
}
.api-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #555;
}
.api-dot.on { background: #39ff14; box-shadow: 0 0 4px #39ff14; }
.api-dot.warn { background: #faad14; }
</style>