<script setup>
import { cn } from "../../lib/utils.js";
defineProps({ value: { type: String, default: "" }, class: { type: String, default: "" }, disabled: { type: Boolean, default: false } });
</script>
<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      $props.class,
    )"
  >
    <slot />
  </button>
</template>
