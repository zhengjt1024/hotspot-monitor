<template>
  <Card :class="fullWidth ? 'max-w-4xl' : ''">
    <CardHeader class="flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Flame :size="14" class="text-amber-400" /> Feed
        <Badge variant="accent">{{ total }}</Badge>
      </CardTitle>
      <div class="flex rounded-md bg-muted p-0.5">
        <button v-for="f in filters" :key="f.id" @click="setFilter(f.id)"
          :class="['px-2.5 py-1 rounded-sm text-xs font-medium transition-all', filter === f.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']">
          {{ f.label }}
        </button>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading...</div>
      <p v-else-if="topics.length === 0" class="text-xs text-muted-foreground text-center py-8">暂无热点，添加关键词后点击 Scan</p>
      <div v-else class="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        <div v-for="(t, i) in topics" :key="t.id"
          @click="markRead(t)"
          :class="['group flex gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/30 cursor-pointer transition-all duration-200 animate-fade-in-up', readIds.has(t.id) && 'opacity-50']"
          :style="{ animationDelay: i * 40 + 'ms' }">
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 border',
            t.is_fake ? 'bg-destructive/10 text-destructive border-destructive/20' :
            t.relevance_score >= 70 ? 'bg-primary/10 text-primary border-primary/20' :
            'bg-muted text-muted-foreground border-border']">
            {{ t.relevance_score || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap mb-1">
              <Badge :variant="t.source === 'twitter' ? 'default' : 'secondary'" class="text-[10px]">{{ t.source_name || t.source }}</Badge>
              <Badge v-if="t.is_verified" variant="success" class="text-[10px]">Verified</Badge>
              <Badge v-if="t.is_fake" variant="destructive" class="text-[10px]">Fake</Badge>
              <Badge v-if="t.keyword_name" variant="accent" class="text-[10px]">{{ t.keyword_name }}</Badge>
            </div>
            <p class="text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{{ t.title }}</p>
            <p v-if="t.summary" class="text-xs text-muted-foreground mt-1 line-clamp-1">{{ t.summary }}</p>
            <span class="text-[10px] text-muted-foreground font-mono mt-1.5 block">{{ fmt(t.published_at || t.created_at) }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Flame } from 'lucide-vue-next'
import Card from './ui/Card.vue'; import CardHeader from './ui/CardHeader.vue'; import CardTitle from './ui/CardTitle.vue'; import CardContent from './ui/CardContent.vue'
import Badge from './ui/Badge.vue'
import { api } from '../lib/api'
import dayjs from 'dayjs'; import relativeTime from 'dayjs/plugin/relativeTime'; import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime); dayjs.locale('zh-cn')

const props = defineProps({ fullWidth: Boolean, refreshKey: Number })
const topics = ref([]); const loading = ref(true); const filter = ref('all'); const total = ref(0)
const readIds = reactive(new Set())
const filters = [{ id: 'all', label: 'All' }, { id: 'verified', label: 'Verified' }]

async function fetchTopics() {
  loading.value = true
  try {
    const p = { limit: '20' }; if (filter.value === 'verified') p.verified = '1'
    const d = await api.getTopics(p); topics.value = d.topics || []; total.value = d.total || 0
  } catch (e) {} finally { loading.value = false }
}
function setFilter(f) { filter.value = f; fetchTopics() }
function markRead(t) { readIds.add(t.id); if (t.url) window.open(t.url, '_blank') }
function fmt(iso) { return iso ? dayjs(iso).fromNow() : '' }

let timer
onMounted(() => { fetchTopics(); timer = setInterval(fetchTopics, 30000) })
onUnmounted(() => clearInterval(timer))
watch(() => props.refreshKey, () => fetchTopics())
</script>
