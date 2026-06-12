<template>
  <a-card :title="null" :bordered="true" class="kw-card" :style="cardStyle">
    <template #title>
      <span style="display:flex;align-items:center;gap:8px">
        <tags-outlined style="color:#00f0ff" />
        <span style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">监控关键词</span>
        <a-tag color="cyan">{{ keywords.length }}</a-tag>
      </span>
    </template>

    <!-- Add form -->
    <a-space direction="vertical" :size="8" style="width:100%;margin-bottom:12px">
      <a-input v-model:value="newKeyword" placeholder="输入关键词，如 GPT-5、Claude 4..." @press-enter="handleAdd" />
      <a-space :size="8">
        <a-input v-model:value="newCategory" placeholder="分类（可选）" size="small" style="width:140px" />
        <a-button type="primary" size="small" @click="handleAdd" :loading="adding">+ 添加</a-button>
      </a-space>
    </a-space>

    <!-- Keywords list -->
    <div class="kw-list">
      <a-empty v-if="keywords.length === 0" description="暂无关键词，添加一个开始监控" :image-style="{ height: '40px' }" />
      <div
        v-for="kw in keywords" :key="kw.id"
        class="kw-item"
        :class="{ disabled: !kw.enabled }"
      >
        <div class="kw-info">
          <span class="kw-dot" :class="{ active: kw.enabled }"></span>
          <span class="kw-text">{{ kw.keyword }}</span>
        </div>
        <div class="kw-actions">
          <a-tag v-if="kw.category" color="magenta" style="font-size:10px;margin-right:4px">{{ kw.category }}</a-tag>
          <a-button size="small" type="text" @click="('refresh'); toggleKeyword(kw.id)">
            {{ kw.enabled ? '⏸' : '▶' }}
          </a-button>
          <a-popconfirm title="确定删除？" @confirm="deleteKeyword(kw.id)">
            <a-button size="small" type="text" danger>删除</a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { TagsOutlined } from '@ant-design/icons-vue'
import { api } from '../lib/api'

const props = defineProps({
  keywords: Array,
  fullWidth: Boolean,
})
const emit = defineEmits(['refresh'])

const newKeyword = ref('')
const newCategory = ref('')
const adding = ref(false)

const cardStyle = props.fullWidth ? { maxWidth: '600px' } : {}

async function handleAdd() {
  if (!newKeyword.value.trim()) return
  adding.value = true
  try {
    await api.addKeyword({ keyword: newKeyword.value.trim(), category: newCategory.value.trim() })
    newKeyword.value = ''
    newCategory.value = ''
    message.success('关键词已添加')
    emit('refresh')
  } catch (e) {
    message.error(e.message)
  } finally {
    adding.value = false
  }
}

async function toggleKeyword(id) {
  try {
    await api.toggleKeyword(id)
    emit('refresh')
  } catch (e) {
    message.error(e.message)
  }
}

async function deleteKeyword(id) {
  try {
    await api.deleteKeyword(id)
    message.success('已删除')
    emit('refresh')
  } catch (e) {
    message.error(e.message)
  }
}
</script>

<style scoped>
.kw-card { border-radius: 12px; }
.kw-list { max-height: 380px; overflow-y: auto; }
.kw-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  transition: all 0.15s;
}
.kw-item:hover { border-color: rgba(0,240,255,0.15); background: rgba(0,240,255,0.03); }
.kw-item.disabled { opacity: 0.45; }
.kw-info { display: flex; align-items: center; gap: 8px; min-width: 0; }
.kw-dot { width: 6px; height: 6px; border-radius: 50%; background: #555; flex-shrink: 0; }
.kw-dot.active { background: #39ff14; box-shadow: 0 0 6px #39ff14; }
.kw-text { font-size: 13px; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kw-actions { display: flex; align-items: center; flex-shrink: 0; }
</style>