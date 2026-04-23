<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{ trigger: number }>()

const { fitView } = useVueFlow()

watch(
  () => props.trigger,
  () => nextTick(() => fitView({ padding: 0.1 })),
)
</script>

<template></template>
