<script setup>
import { cn } from "../../lib/utils.js";
defineProps({ class: { type: String, default: "" } });
</script>
<template>
  <div :class="cn('p-5 pt-0', $props.class)"><slot /></div>
</template>
