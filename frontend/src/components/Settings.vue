<template>
  <Card :class="fullWidth ? 'max-w-lg' : ''">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <SettingsIcon :size="14" class="text-violet-400" /> Settings
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-5">
      <div>
        <label class="text-xs text-muted-foreground block mb-1.5">Monitor Interval (minutes)</label>
        <select v-model="checkInterval" class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all">
          <option value="5">5 min (high)</option>
          <option value="15">15 min</option>
          <option value="30">30 min (recommended)</option>
          <option value="60">60 min</option>
          <option value="120">120 min (low)</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-muted-foreground block mb-1.5">Browser Notifications</label>
        <Button variant="outline" size="sm" @click="requestNotification">Enable Desktop Alerts</Button>
        <p class="text-[10px] text-muted-foreground mt-1">Receive desktop notifications for new hot topics</p>
      </div>
      <div>
        <label class="text-xs text-muted-foreground block mb-1.5">API Status</label>
        <div class="text-xs text-muted-foreground space-y-1 font-mono">
          <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> OpenRouter: Configured</div>
          <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Twitter API: Not configured</div>
        </div>
      </div>
      <Button class="w-full" @click="saveSettings">Save Settings</Button>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Settings as SettingsIcon } from 'lucide-vue-next'
import Card from './ui/Card.vue'; import CardHeader from './ui/CardHeader.vue'; import CardTitle from './ui/CardTitle.vue'; import CardContent from './ui/CardContent.vue'
import Button from './ui/Button.vue'
import { api } from '../lib/api'

const props = defineProps({ fullWidth: Boolean })
const checkInterval = ref('30')
onMounted(async () => { try { const s = await api.getSettings(); if (s.check_interval) checkInterval.value = s.check_interval } catch (e) {} })
async function requestNotification() {
  if (!('Notification' in window)) return
  await Notification.requestPermission()
}
async function saveSettings() {
  try { await api.updateSettings({ check_interval: checkInterval.value }) } catch (e) {}
}
</script>
