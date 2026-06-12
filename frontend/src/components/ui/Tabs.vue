<script setup>
import { cn } from "../../lib/utils.js";
defineProps({ class: { type: String, default: "" }, defaultValue: { type: String, default: "" } });
</script>
<template>
  <div :class="cn('', $props.class)"><slot /></div>
</template>
