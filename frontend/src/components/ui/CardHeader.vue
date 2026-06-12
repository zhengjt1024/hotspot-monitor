<script setup>
import { cn } from "../../lib/utils.js";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div :class="cn('flex flex-col space-y-1.5 p-5 pb-0', $props.class)"><slot /></div>
</template>
