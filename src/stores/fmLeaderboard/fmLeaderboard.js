import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useFmLeaderboardStore = defineStore('fmLeaderboard', () => {
  const data = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const isFetched = ref(false)
  const isSubmitting = ref(false)
  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const snackbar = useSnackbarStore()

  const fetchFmLeaderboard = (force = false,  page = 1,) => {
    if (isFetched.value && !force) return

    isLoading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []
      pagination.value = res?.pagination || pagination.value;
      isLoading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      isLoading.value = false
      error.value = err
      snackbar.show(err?.error || 'Something went wrong.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.fm.list, {
      params: {
        page,
        per_page: pagination.value.per_page,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  const createFundManager = (formData) => {
    return new Promise((resolve) => {
      isSubmitting.value = true

      const successHandler = () => {
        snackbar.show('Fund Manager created successfully', 'success')
        isSubmitting.value = false
        isFetched.value = false
        fetchFmLeaderboard(true)
        resolve()
      }

      const failureHandler = (err) => {
        snackbar.show(err?.error || 'Something went wrong.', 'error')
        isSubmitting.value = false
        resolve()
      }

      apiRequest(urls.KEYS.POST, urls.fm.create, {
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const editFundManager = (id, formData) => {
    return new Promise((resolve) => {
      isSubmitting.value = true

      const successHandler = () => {
        snackbar.show('Fund Manager updated successfully', 'success')
        isSubmitting.value = false
        isFetched.value = false
        fetchFmLeaderboard(true)
        resolve()
      }

      const failureHandler = (err) => {
        snackbar.show(err?.error || 'Something went wrong.', 'error')
        isSubmitting.value = false
        resolve()
      }

      apiRequest(urls.KEYS.POST, urls.fm.edit, {
        look_up_key: id,
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const reset = () => {
    data.value = []
    isLoading.value = false
    error.value = null
    isFetched.value = false
    isSubmitting.value = false
    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    }
  }

  return {
    data,
    isLoading,
    error,
    isFetched,
    isSubmitting,
    pagination,
    fetchFmLeaderboard,
    createFundManager,
    editFundManager,
    reset,
  }
})
