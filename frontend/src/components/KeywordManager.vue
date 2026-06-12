<template>
  <Card :class="fullWidth ? 'max-w-lg' : ''">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Hash :size="14" class="text-primary" /> Keywords
        <Badge variant="secondary" class="ml-auto">{{ keywords.length }}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <form @submit.prevent="handleAdd" class="flex gap-2">
        <Input v-model="kw" placeholder="输入关键词，如 GPT-5、AI编程..." class="flex-1" />
        <Button type="submit" size="sm" :disabled="!kw.trim()">+</Button>
      </form>
      <div class="space-y-1 max-h-72 overflow-y-auto">
        <p v-if="keywords.length === 0" class="text-xs text-muted-foreground text-center py-4">暂无关键词</p>
        <div v-for="k in keywords" :key="k.id"
          :class="['flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-border hover:bg-accent/50', !k.enabled && 'opacity-40']">
          <div class="flex items-center gap-2 min-w-0">
            <span :class="['w-1.5 h-1.5 rounded-full shrink-0', k.enabled ? 'bg-emerald-400 shadow-[0_0_4px] shadow-emerald-400/60' : 'bg-muted-foreground']"></span>
            <span class="text-sm truncate">{{ k.keyword }}</span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button @click="toggleKeyword(k.id)" class="p-1 rounded text-muted-foreground hover:text-foreground text-xs transition-colors">{{ k.enabled ? '⏸' : '▶' }}</button>
            <button @click="deleteKeyword(k.id, k.keyword)" class="p-1 rounded text-muted-foreground hover:text-destructive text-xs transition-colors">✕</button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { Hash } from 'lucide-vue-next'
import Card from './ui/Card.vue'; import CardHeader from './ui/CardHeader.vue'; import CardTitle from './ui/CardTitle.vue'; import CardContent from './ui/CardContent.vue'
import Button from './ui/Button.vue'; import Input from './ui/Input.vue'; import Badge from './ui/Badge.vue'
import { api } from '../lib/api'

const props = defineProps({ keywords: Array, fullWidth: Boolean })
const emit = defineEmits(['refresh'])
const kw = ref('')

async function handleAdd() {
  if (!kw.value.trim()) return
  try { await api.addKeyword({ keyword: kw.value.trim() }); kw.value = ''; emit('refresh') } catch (e) {}
}
async function toggleKeyword(id) { try { await api.toggleKeyword(id); emit('refresh') } catch (e) {} }
async function deleteKeyword(id, name) {
  if (!confirm('删除关键词 "' + name + '"？')) return
  try { await api.deleteKeyword(id); emit('refresh') } catch (e) {}
}
</script>
