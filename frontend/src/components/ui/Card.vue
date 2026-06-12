<script setup>
import { cn } from "../../lib/utils.js";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow-sm glass-hover', $props.class)">
    <slot />
  </div>
</template>
