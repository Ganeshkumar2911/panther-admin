import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useBannersStore = defineStore('banners', () => {
  const snackbar = useSnackbarStore()

  // State
  const records = ref([])
  const loading = ref(false)
  const updateLoading = ref(false)
  const error = ref(null)
  const isFetched = ref(false)

  // Pagination (even if we don't have it on the mock, good to have)
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })

  // ─────────────────────────────────────
  // Fetch Banners
  // ─────────────────────────────────────
  const fetchBanners = (force = false) => {
    if (isFetched.value && !force) return
    loading.value = true
    const successHandler = (res) => {
      records.value = res || []
      isFetched.value = true
      loading.value = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err
      snackbar.show(err?.message || 'Failed to fetch banners.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.banners.listGroups, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
    
  }

  // ─────────────────────────────────────
  // Group CRUD (Mocked for now)
  // ─────────────────────────────────────
  const createGroup = (payload) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Group created successfully.', 'success')
        fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to create group.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, '/create-groups', {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const updateGroup = (id, payload) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Group updated successfully.', 'success')
        fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to update group.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, '/create-groups', {
        data: { id, ...payload },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const deleteGroup = (id) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Group deleted successfully.', 'success')
        fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to delete group.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.DELETE, urls.banners.deleteGroup, {
        look_up_key: id,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const toggleGroupStatus = (id, isActive) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Group status updated successfully.', 'success')
        const group = records.value.find(g => g.id === id)
        if (group) group.is_active = isActive
                fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to update group status.', 'error')
        reject(err)
      }

      // Using /activate/group API as requested
      apiRequest(urls.KEYS.PUT, '/activate/group', {
        look_up_key: id,
        data: { is_active: isActive },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // ─────────────────────────────────────
  // Banner CRUD
  // ─────────────────────────────────────
  const createBanner = (groupId, payload) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Banner created successfully.', 'success')
        fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to create banner.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, urls.banners.createBanner, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const updateBanner = (groupId, bannerId, payload, skipFetch = false) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Banner updated successfully.', 'success')
         fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to update banner.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.PUT, urls.banners.updateBanner, {
        look_up_key: bannerId,
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const deleteBanner = (groupId, bannerId) => {
    updateLoading.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        updateLoading.value = false
        snackbar.show(res?.message || 'Banner deleted successfully.', 'success')
        fetchBanners(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to delete banner.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.DELETE, urls.banners.deleteBanner, {
        look_up_key: bannerId,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const toggleBannerStatus = (groupId, bannerId, isActive) => {
    const formData = new FormData()
    formData.append('banner_id', bannerId)
    formData.append('is_active', isActive)
    
    return updateBanner(groupId, bannerId, formData, true).then(() => {
      // Update local state directly to avoid API fetch overhead
      const group = records.value.find(g => g.id === groupId)
      if (group) {
        const banner = group.banners.find(b => b.id === bannerId)
        if (banner) banner.is_active = isActive
      }
    })
  }

  const reset = () => {
    records.value = []
    loading.value = false
    updateLoading.value = false
    error.value = null
    isFetched.value = false
  }

  return {
    records,
    loading,
    updateLoading,
    error,
    isFetched,
    pagination,
    fetchBanners,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleGroupStatus,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reset,
  }
})
