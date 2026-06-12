<template>
  <div class="min-h-screen bg-background relative isolation-auto">
    <canvas ref="pc" id="particles-canvas"></canvas>

    <Header
      :stats="stats" :notify-count="notifyCount" :active-tab="activeTab"
      @tab-change="onTabChange" @refresh="refreshStats" @trigger="handleTrigger"
    />

    <main class="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 pt-6 relative z-10">
      <!-- Dashboard 3-col -->
      <div v-if="activeTab === 'dashboard'" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
          <KeywordManager :keywords="keywords" @refresh="refreshStats" />
        </div>
        <div class="lg:col-span-6">
          <HotTopicsFeed :refresh-key="refreshKey" />
        </div>
        <div class="lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
          <NotificationPanel :refresh-key="refreshKey" @refresh="refreshStats" />
        </div>
      </div>

      <KeywordManager v-if="activeTab === 'keywords'" :keywords="keywords" @refresh="refreshStats" full-width />
      <HotTopicsFeed v-if="activeTab === 'topics'" :refresh-key="refreshKey" full-width />
      <NotificationPanel v-if="activeTab === 'notifications'" :refresh-key="refreshKey" @refresh="refreshStats" full-width />
      <SettingsPanel v-if="activeTab === 'settings'" full-width />
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import KeywordManager from './components/KeywordManager.vue'
import HotTopicsFeed from './components/HotTopicsFeed.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import SettingsPanel from './components/Settings.vue'
import { api } from './lib/api'

const activeTab = ref('dashboard')
const stats = reactive({ total: 0, verified: 0, fake: 0, today: 0 })
const keywords = ref([])
const notifyCount = ref(0)
const refreshKey = ref(0)
const pc = ref(null)

function onTabChange(tab) { activeTab.value = tab }

async function refreshStats() {
  try {
    const [s, kw, n] = await Promise.all([
      api.getTopicStats(), api.getKeywords(), api.getNotifications(true),
    ])
    Object.assign(stats, s); keywords.value = kw; notifyCount.value = n.unreadCount || 0
  } catch (e) {}
}

async function handleTrigger() {
  try {
    await api.triggerMonitor()
    setTimeout(() => { refreshStats(); refreshKey.value++ }, 3000)
  } catch (e) {}
}

// Particles
function initParticles() {
  const c = pc.value; if (!c) return
  const ctx = c.getContext('2d')
  let ps = [], rid
  function rs() { c.width = innerWidth; c.height = innerHeight }
  rs(); addEventListener('resize', rs)
  const n = Math.min(70, Math.floor(innerWidth / 18))
  for (let i = 0; i < n; i++) ps.push({
    x: Math.random()*c.width, y: Math.random()*c.height,
    r: Math.random()*1+0.3, vx: (Math.random()-.5)*.12, vy: (Math.random()-.5)*.12,
    a: Math.random()*.35+.08,
  })
  function dr() {
    ctx.clearRect(0,0,c.width,c.height)
    for (const p of ps) {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
      ctx.fillStyle = 'rgba(34,211,238,'+p.a+')'; ctx.fill()
      p.x+=p.vx; p.y+=p.vy
      if(p.x<0||p.x>c.width)p.vx*=-1
      if(p.y<0||p.y>c.height)p.vy*=-1
      for(const q of ps){const dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<100){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)
        ctx.strokeStyle='rgba(34,211,238,'+(.035*(1-d/100))+')';ctx.lineWidth=.5;ctx.stroke()}}
    }
    rid=requestAnimationFrame(dr)
  }
  dr()
  return ()=>{cancelAnimationFrame(rid);removeEventListener('resize',rs)}
}

let t, cp
onMounted(()=>{refreshStats();t=setInterval(refreshStats,30000);cp=initParticles()})
onUnmounted(()=>{clearInterval(t);if(cp)cp()})
</script>
