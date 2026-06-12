<script setup>
import { cn } from "../../lib/utils.js";
defineProps({
  variant: { type: String, default: "default" },
  class: { type: String, default: "" },
});
</script>
<template>
  <div
    :class="cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
      {
        'border-transparent bg-primary text-primary-foreground shadow': variant === 'default',
        'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
        'border-transparent bg-destructive text-destructive-foreground': variant === 'destructive',
        'border-transparent bg-emerald-500/10 text-emerald-400': variant === 'success',
        'border-transparent bg-amber-500/10 text-amber-400': variant === 'warning',
        'border-transparent bg-violet-500/10 text-violet-400': variant === 'accent',
        'text-foreground': variant === 'outline',
      },
      $props.class,
    )"
  >
    <slot />
  </div>
</template>
