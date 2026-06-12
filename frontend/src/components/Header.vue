<template>
  <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
    <div class="scan-line absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan"></div>
    <div class="max-w-[1440px] mx-auto flex items-center justify-between h-14 px-4 sm:px-6 gap-4">
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
          <span class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60"></span>
        </div>
        <h1 class="text-base font-bold tracking-tight">
          Hotspot<span class="text-primary">Monitor</span>
        </h1>
        <div class="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px] shadow-emerald-400/60 animate-pulse-glow"></span>
          <span class="text-[10px] font-semibold text-emerald-400 tracking-wider font-mono">LIVE</span>
        </div>
      </div>

      <nav class="flex items-center gap-1">
        <button v-for="tab in tabs" :key="tab.id" @click="$emit('tab-change', tab.id)"
          :class="['px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent']">
          {{ tab.label }}
          <span v-if="tab.badge && tab.badge > 0" class="ml-1.5 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">{{ tab.badge > 99 ? '99+' : tab.badge }}</span>
        </button>
      </nav>

      <div class="flex items-center gap-3 shrink-0">
        <div class="hidden md:flex items-center gap-3">
          <div class="flex flex-col items-center"><span class="text-sm font-bold font-mono">{{ stats.today }}</span><span class="text-[10px] text-muted-foreground uppercase">Today</span></div>
          <div class="flex flex-col items-center"><span class="text-sm font-bold font-mono">{{ stats.verified }}</span><span class="text-[10px] text-muted-foreground uppercase">Verified</span></div>
        </div>
        <button @click="$emit('trigger')" class="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm">
          <span class="text-base">⟳</span> Scan
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({ stats: Object, notifyCount: Number, activeTab: String })
const emit = defineEmits(['tab-change', 'refresh', 'trigger'])
const tabs = [
  { id: 'dashboard', label: '控制台' },
  { id: 'keywords', label: '关键词' },
  { id: 'topics', label: '热点' },
  { id: 'notifications', label: '通知', badge: props.notifyCount },
  { id: 'settings', label: '设置' },
]
</script>
