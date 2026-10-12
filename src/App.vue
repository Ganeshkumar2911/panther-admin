<template>
  <div>
    <router-view />
    <Snackbar />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Snackbar from '@/components/common/snackbar.vue'
import { useIdleLogout } from './composables/useIdleLogout'
import { useAuthStore } from '@/stores/auth'
import authToken from '@/common/authToken'
import router from '@/router'
import { useRoute } from 'vue-router'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'

useIdleLogout()
const route = useRoute()

const handleKeydown = (e) => {
  if (e.metaKey || e.ctrlKey) {
    const key = e.key.toLowerCase()
    if (key === 'l' || key === 'd') {
      e.preventDefault()
      const isLoggedIn = !!authToken.getToken().accessToken
      const targetRoute = key === 'l' ? 'login' : 'dev-login'
      
      if (isLoggedIn) {
        const authStore = useAuthStore()
        authStore.logout(targetRoute)
      } else {
        router.push({ name: targetRoute })
      }
    }
  }

  if (e.key === 'Escape') {
    if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return
    }

    const visibleDialog = document.querySelector('[role="dialog"]:not([style*="display: none"])')
    if (visibleDialog) {
      return
    }

    const token = authToken.getToken()?.accessToken
    if (token) {
      const myPermissionsStore = useMyPermissionsStore()
      const dashboardPath = myPermissionsStore.firstAllowedPath || '/'
      
      if (route.path === dashboardPath) {
         return
      }

      if (window.history.state && window.history.state.back) {
        router.back()
      } else {
        router.push(dashboardPath)
      }
    } else {
      if (window.history.state && window.history.state.back) {
        router.back()
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>