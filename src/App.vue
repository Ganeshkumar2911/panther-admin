<template>
  <div>
    <router-view />
    <Snackbar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Snackbar from '@/components/common/snackbar.vue'
import { useIdleLogout } from './composables/useIdleLogout'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import authToken from '@/common/authToken'

useIdleLogout()

const myPermissionsStore = useMyPermissionsStore()

onMounted(() => {
  const { accessToken } = authToken.getToken()
  if (accessToken) {
    myPermissionsStore.fetchMyPermissions()
  }
})
</script>