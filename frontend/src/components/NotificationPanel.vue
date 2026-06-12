<template>
  <Card :class="fullWidth ? 'max-w-lg' : ''">
    <CardHeader class="flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Bell :size="14" class="text-amber-400" /> Alerts
        <Badge v-if="unreadCount > 0" variant="destructive">{{ unreadCount }}</Badge>
      </CardTitle>
      <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-muted-foreground hover:text-foreground transition-colors">Mark all</button>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex justify-center py-8 text-muted-foreground text-xs">Loading...</div>
      <p v-else-if="notifications.length === 0" class="text-xs text-muted-foreground text-center py-6">暂无通知</p>
      <div v-else class="space-y-1.5 max-h-[65vh] overflow-y-auto">
        <div v-for="(n, i) in notifications" :key="n.id"
          @click="handleClick(n)"
          :class="['flex gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in-up border border-transparent hover:border-border hover:bg-accent/30', !n.is_read && 'bg-primary/5 border-primary/10']"
          :style="{ animationDelay: i * 40 + 'ms' }">
          <span class="text-sm mt-0.5 shrink-0">{{ n.type === 'hot_topic' ? '🔥' : n.type === 'fake_alert' ? '⚠️' : '📢' }}</span>
          <div class="flex-1 min-w-0">
            <p :class="['text-xs leading-relaxed', n.is_read ? 'text-muted-foreground' : 'text-foreground']">{{ n.message }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <Badge variant="warning" class="text-[10px]">{{ n.keyword }}</Badge>
              <span class="text-[10px] text-muted-foreground font-mono">{{ fmt(n.created_at) }}</span>
              <span v-if="!n.is_read" class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow"></span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Bell } from 'lucide-vue-next'
import Card from './ui/Card.vue'; import CardHeader from './ui/CardHeader.vue'; import CardTitle from './ui/CardTitle.vue'; import CardContent from './ui/CardContent.vue'
import Badge from './ui/Badge.vue'
import { api } from '../lib/api'
import dayjs from 'dayjs'; import relativeTime from 'dayjs/plugin/relativeTime'; import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime); dayjs.locale('zh-cn')

const props = defineProps({ fullWidth: Boolean, refreshKey: Number })
const emit = defineEmits(['refresh'])
const notifications = ref([]); const unreadCount = ref(0); const loading = ref(true)

async function fetchNotifications() {
  try {
    const d = await api.getNotifications(); notifications.value = (d.notifications || []).slice(0, 30); unreadCount.value = d.unreadCount || 0
  } catch (e) {} finally { loading.value = false }
}
async function handleClick(n) {
  if (!n.is_read) { try { await api.markRead(n.id); fetchNotifications() } catch (e) {} }
  if (n.topic_url) window.open(n.topic_url, '_blank')
}
async function markAllRead() { try { await api.markAllRead(); fetchNotifications() } catch (e) {} }
function fmt(iso) { return iso ? dayjs(iso).fromNow() : '' }

let timer
onMounted(() => { fetchNotifications(); timer = setInterval(fetchNotifications, 20000) })
onUnmounted(() => clearInterval(timer))
watch(() => props.refreshKey, () => fetchNotifications())
</script>
