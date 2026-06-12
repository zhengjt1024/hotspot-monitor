<template>
  <a-card :title="null" :bordered="true" class="topics-card" :style="cardStyle">
    <template #title>
      <span style="display:flex;align-items:center;gap:8px">
        <fire-outlined style="color:#ff00ff" />
        <span class="card-title-text">热点追踪</span>
        <a-tag color="magenta">{{ total }}</a-tag>
      </span>
    </template>
    <template #extra>
      <a-radio-group v-model:value="filter" size="small" button-style="solid" @change="onFilterChange">
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="verified">已验证</a-radio-button>
      </a-radio-group>
    </template>

    <div class="radar-bar">
      <div class="radar-circle">
        <div class="radar-sweep"></div>
        <span class="radar-label">扫描中</span>
      </div>
      <span class="radar-info">数据源: Web + Twitter &middot; 更新间隔: 30秒</span>
    </div>

    <div v-if="loading" style="text-align:center;padding:40px 0">
      <a-spin size="small" />
      <p style="color:#555;font-size:12px;margin-top:8px">正在加载热点...</p>
    </div>

    <a-empty v-else-if="topics.length === 0" description="暂无热点数据，点击立即扫描或添加关键词" :image-style="{ height: '40px' }" />

    <div v-else class="topics-list">
      <div
        v-for="(topic, i) in topics" :key="topic.id"
        class="topic-item fade-in"
        :style="{ animationDelay: i * 40 + 'ms' }" @click="markTopicRead(topic)"
      >
        <div class="topic-score" :class="scoreClass(topic)">
          {{ topic.relevance_score || '?' }}
        </div>
        <div class="topic-body">
          <div class="topic-meta">
            <a-tag :color="sourceColor(topic.source)" style="font-size:10px">
              {{ sourceIcon(topic.source) }} {{ topic.source_name || topic.source }}
            </a-tag>
            <a-tag v-if="topic.is_verified" color="green" style="font-size:10px">已认证</a-tag>
            <a-tag v-if="topic.is_fake" color="red" style="font-size:10px">疑似虚假</a-tag>
            <a-tag v-if="topic.keyword_name" color="magenta" style="font-size:10px">{{ topic.keyword_name }}</a-tag>
          </div>
          <a class="topic-title" :href="topic.url || '#'" target="_blank" rel="noopener">
            {{ topic.title }}
          </a>
          <p v-if="topic.summary" class="topic-summary">{{ topic.summary }}</p>
          <span class="topic-time">{{ formatTime(topic.published_at || topic.created_at) }}</span>
        </div>
      </div>
    </div>

    <div v-if="total > 20" style="margin-top:12px;text-align:right">
      <a-pagination
        v-model:current="page"
        :total="total"
        :page-size="20"
        size="small"
        show-less-items
        @change="fetchTopics"
      />
    </div>
  </a-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { FireOutlined } from '@ant-design/icons-vue'
import { api } from '../lib/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({ fullWidth: Boolean, refreshKey: Number })
const cardStyle = props.fullWidth ? { maxWidth: '900px' } : {}

const topics = ref([])
const loading = ref(true)
const filter = ref('all')
const page = ref(1)
const total = ref(0)
const readIds = reactive(new Set())

async function fetchTopics() {
  loading.value = true
  try {
    const params = { page: String(page.value), limit: '20' }
    if (filter.value === 'verified') params.verified = '1'
    const data = await api.getTopics(params)
    topics.value = data.topics || []
    total.value = data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  page.value = 1
  fetchTopics()
}

function markTopicRead(topic) {
  readIds.add(topic.id)
  if (topic.url) {
    window.open(topic.url, '_blank')
  }
}

function scoreClass(t) {
  if (t.is_fake) return 'score-fake'
  if (t.relevance_score >= 70) return 'score-high'
  return 'score-normal'
}

function sourceColor(src) {
  return src === 'twitter' ? 'cyan' : src === 'rss' ? 'gold' : 'green'
}

function sourceIcon(src) {
  return src === 'twitter' ? 'X' : src === 'rss' ? 'RSS' : 'WEB'
}

function formatTime(iso) {
  if (!iso) return ''
  return dayjs(iso).fromNow()
}

let timer
onMounted(() => {
  fetchTopics()
  timer = setInterval(fetchTopics, 30000)
})
onUnmounted(() => clearInterval(timer))

watch(() => props.refreshKey, () => { fetchTopics() })
</script>

<style scoped>
.topics-card { border-radius: 12px; }
.card-title-text { font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
.radar-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
  color: #555;
  font-family: monospace;
}
.radar-circle {
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0,240,255,0.1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.radar-sweep {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(0,240,255,0.08), transparent);
  animation: radarSpin 4s linear infinite;
}
@keyframes radarSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.radar-label {
  position: relative;
  font-size: 9px;
  color: #00f0ff;
  z-index: 1;
}
.radar-info { color: #555; }

.topics-list { max-height: 60vh; overflow-y: auto; }
.topic-item {
  display: flex;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;
  transition: background 0.15s;
  border: 1px solid transparent; cursor: pointer;
}
.topic-item:hover { background: rgba(0,240,255,0.02); border-color: rgba(0,240,255,0.08); }
.topic-item.read { opacity: 0.55; }
.topic-score {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
}
.score-high { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.score-normal { background: rgba(255,255,255,0.04); color: #8892b0; border: 1px solid rgba(255,255,255,0.05); }
.score-fake { background: rgba(255,77,79,0.1); color: #ff4d4f; border: 1px solid rgba(255,77,79,0.2); }
.topic-body { flex: 1; min-width: 0; }
.topic-meta { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
.topic-title {
  font-size: 13px;
  color: #e2e8f0;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.topic-title:hover { color: #00f0ff; }
.topic-summary {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.topic-time { font-size: 10px; color: #555; font-family: monospace; margin-top: 4px; display: block; }
</style>