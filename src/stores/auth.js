import { defineStore } from 'pinia'
import router from '@/router'
import authToken from '@/common/authToken'

export const useAuthStore = defineStore('auth', () => {
  const logout = () => {
    // Clear auth credentials
    authToken.removeToken()
    
    // Clear inactivity tracking key
    localStorage.removeItem('lastActivityTimestamp')
    
    // Redirect to login page and reload to reset all Pinia states
    router.push({ name: 'login' }).then(() => {
      window.location.reload()
    })
  }

  return {
    logout
  }
})
