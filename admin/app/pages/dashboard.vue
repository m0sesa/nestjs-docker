<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Redirect to index for dashboard
await navigateTo('/')
</script>