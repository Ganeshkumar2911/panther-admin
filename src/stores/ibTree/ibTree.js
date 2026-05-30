// /stores/ibTree/ibTree.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useIbTreeStore = defineStore('ibTree', () => {
  const data = ref([])
  const isLoading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)
  const isFetched = ref(false)

  const snackbar = useSnackbarStore()

  // ─── Fetch Tree
  const fetchIbTree = (force = false) => {
    if (isFetched.value && !force) return

    isLoading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []
      isLoading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      isLoading.value = false
      error.value = err
      snackbar.show(err?.error || 'Something went wrong.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.ibTree.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Create / Edit IB or SubIB
  const saveIb = ({ email, password, split_percentage, parent_ib_id = null, ib_id = null }) => {
    actionLoading.value = true

    const payload = {
      email,
      split_percentage,
    }

    if (password) payload.password = password
    if (parent_ib_id) payload.parent_ib_id = parent_ib_id
    if (ib_id) payload.ib_id = ib_id

    const successHandler = () => {
      actionLoading.value = false
      fetchIbTree(true) // force refresh
    }

    const failureHandler = (err) => {
      actionLoading.value = false
      snackbar.show(err?.error || 'Something went wrong.', 'error')
    }

    apiRequest(
      ib_id ? urls.KEYS.PUT : urls.KEYS.POST,
      ib_id ? urls.ibTree.update : urls.ibTree.create,
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      }
    )
  }

  const reset = () => {
    data.value = []
    isLoading.value = false
    actionLoading.value = false
    error.value = null
    isFetched.value = false
  }

  return {
    data,
    isLoading,
    actionLoading,
    error,
    isFetched,
    fetchIbTree,
    saveIb,
    reset,
  }
})
