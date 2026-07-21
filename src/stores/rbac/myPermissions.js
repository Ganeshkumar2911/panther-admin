import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiRequest from '@/api/request'
import urls from '@/api/urls'

export const useMyPermissionsStore = defineStore('myPermissions', () => {
  const permissions = ref({})
  const userId = ref(null)
  const loading = ref(false)
  const isFetched = ref(false)
  const error = ref(null)

  // Flattened set of permission codes for fast lookup e.g. 'analytics.view'
  const userCodes = computed(() => {
    const codes = new Set()
    Object.values(permissions.value || {}).forEach((permList) => {
      if (Array.isArray(permList)) {
        permList.forEach((item) => {
          if (item.code) codes.add(item.code)
        })
      }
    })
    return codes
  })

  // Check if user has a specific permission code, an array of codes (ANY), or custom function
  const hasPermission = (codeOrCodes) => {
    if (!codeOrCodes) return true
    if (typeof codeOrCodes === 'string') {
      return userCodes.value.has(codeOrCodes)
    }
    if (Array.isArray(codeOrCodes)) {
      if (codeOrCodes.length === 0) return true
      return codeOrCodes.some((code) => userCodes.value.has(code))
    }
    if (typeof codeOrCodes === 'function') {
      return codeOrCodes(userCodes.value)
    }
    return true
  }

  // Check if user has ANY of the given permission codes
  const hasAnyPermission = (codes = []) => {
    if (!codes || codes.length === 0) return true
    return codes.some((code) => userCodes.value.has(code))
  }

  // Check if user has ALL of the given permission codes
  const hasAllPermissions = (codes = []) => {
    if (!codes || codes.length === 0) return true
    return codes.every((code) => userCodes.value.has(code))
  }

  // Check if user has ANY permission in a given module (e.g. 'client', 'email', 'kyc')
  const hasModulePermission = (moduleName) => {
    if (!moduleName) return true
    const moduleList = permissions.value[moduleName]
    return Array.isArray(moduleList) && moduleList.length > 0
  }

  // Fetch logged-in user permissions
  const fetchMyPermissions = (force = false) => {
    if (isFetched.value && !force) return

    loading.value = true
    error.value = null

    const successHandler = (res) => {
      permissions.value = res?.data?.permissions || res?.data || {}
      userId.value = res?.data?.user_id || null
      loading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err
      console.error('Failed to fetch user permissions:', err)
    }

    apiRequest(urls.KEYS.GET, urls.rbac.userPermissions.me, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  const reset = () => {
    permissions.value = {}
    userId.value = null
    loading.value = false
    isFetched.value = false
    error.value = null
  }

  return {
    permissions,
    userId,
    loading,
    isFetched,
    error,
    userCodes,

    // Helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModulePermission,

    // Actions
    fetchMyPermissions,
    reset,
  }
})
