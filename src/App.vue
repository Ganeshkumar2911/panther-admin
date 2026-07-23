<template>
  <div>
    <router-view />
    <Snackbar />
  </div>
</template>

<script setup>
import Snackbar from '@/components/common/snackbar.vue'
import { useIdleLogout } from './composables/useIdleLogout'

useIdleLogout()
</script>