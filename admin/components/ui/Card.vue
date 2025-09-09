<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow', className)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  className?: string
}

const { className } = defineProps<Props>()
</script>