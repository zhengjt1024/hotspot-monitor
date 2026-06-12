<template>
  <a-card :title="null" :bordered="true" class="notif-card" :style="cardStyle">
    <template #title>
      <span style="display:flex;align-items:center;gap:8px">
        <bell-outlined style="color:#ffe600" />
        <span style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">通知中心</span>
        <a-badge v-if="unreadCount > 0" :count="unreadCount" :overflow-count="99" />
      </span>
    </template>
    <template #extra>
      <a-button v-if="unreadCount > 0" size="small" type="text" @click="markAllRead">全部已读</a-button>
    </template>

    <div v-if="loading" style="text-align:center;padding:20px 0">
      <a-spin size="small" />
    </div>

    <a-empty v-else-if="notifications.length === 0" description="暂无通知" :image-style="{ height: '40px' }" />

    <div v-else class="notif-list">
      <div
        v-for="(n, i) in notifications" :key="n.id"
        class="notif-item fade-in"
        :class="{ read: n.is_read }"
        :style="{ animationDelay: i * 40 + 'ms' }"
        @click="handleNotifClick(n)"
      >
        <span class="notif-icon">{{ n.type === 'hot_topic' ? '🔥' : n.type === 'fake_alert' ? '⚠️' : '📢' }}</span>
        <div class="notif-body">
          <p class="notif-msg">{{ n.message }}</p>
          <div class="notif-footer">
            <a-tag color="gold" style="font-size:10px">{{ n.keyword }}</a-tag>
            <span class="notif-time">{{ formatTime(n.created_at) }}</span>
            <span v-if="!n.is_read" class="unread-dot"></span>
            <span v-if="n.topic_url" class="jump-hint">↗</span>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { BellOutlined } from '@ant-design/icons-vue'
import { api } from '../lib/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({ fullWidth: Boolean, refreshKey: Number })
const emit = defineEmits(['refresh'])
const cardStyle = props.fullWidth ? { maxWidth: '600px' } : {}

const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(true)

async function fetchNotifications() {
  try {
    const data = await api.getNotifications()
    notifications.value = (data.notifications || []).slice(0, 30)
    unreadCount.value = data.unreadCount || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function markRead(id) {
  try {
    await api.markRead(id)
    fetchNotifications()
  } catch (e) { message.error(e.message) }
}

async function markAllRead() {
  try {
    await api.markAllRead()
    fetchNotifications()
    message.success('全部已读')
  } catch (e) { message.error(e.message) }
}

function handleNotifClick(n) {
  if (!n.is_read) markRead(n.id)
  if (n.topic_url) {
    window.open(n.topic_url, '_blank')
  }
}

function formatTime(iso) {
  if (!iso) return ''
  return dayjs(iso).fromNow()
}

let timer
onMounted(() => {
  fetchNotifications()
  timer = setInterval(fetchNotifications, 20000)
})
onUnmounted(() => clearInterval(timer))

watch(() => props.refreshKey, () => { fetchNotifications() })
</script>

<style scoped>
.notif-card { border-radius: 12px; }
.notif-list { max-height: 60vh; overflow-y: auto; }
.notif-item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  margin-bottom: 4px;
}
.notif-item:not(.read) {
  background: rgba(255,230,0,0.03);
  border-color: rgba(255,230,0,0.08);
}
.notif-item:not(.read):hover { border-color: rgba(255,230,0,0.2); }
.notif-item.read { opacity: 0.5; }
.notif-icon { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
.notif-body { flex: 1; min-width: 0; }
.notif-msg { font-size: 12px; color: #e2e8f0; line-height: 1.4; margin: 0; }
.notif-footer { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.notif-time { font-size: 10px; color: #555; font-family: monospace; }
.unread-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff00ff; }
.jump-hint { font-size: 10px; color: #00f0ff; margin-left: 2px; }
</style>