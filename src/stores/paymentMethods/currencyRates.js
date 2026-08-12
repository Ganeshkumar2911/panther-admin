import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useCurrencyRatesStore = defineStore('currencyRates', () => {
  const snackbar = useSnackbarStore()

  // State
  const records = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const deactivatingId = ref(null)
  const error = ref(null)
  const isFetched = ref(false)

  // Fetch Currency Rates
  const fetchCurrencyRates = (filterActive = null, force = false) => {
    if (isFetched.value && !force && filterActive === null) return

    loading.value = true
    error.value = null

    const params = {}
    if (filterActive !== null && filterActive !== undefined && filterActive !== '') {
      params.is_active = filterActive
    }

    const successHandler = (res) => {
      records.value = res?.data || []
      isFetched.value = true
      loading.value = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err
      snackbar.show(err?.message || 'Failed to fetch currency rates.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.currencyRates.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Create Currency Rate
  const createCurrencyRate = (payload) => {
    submitting.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate created successfully.', 'success')
        submitting.value = false
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        submitting.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to create currency rate.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, urls.currencyRates.create, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Update Currency Rate
  const updateCurrencyRate = (id, payload) => {
    submitting.value = true
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate updated successfully.', 'success')
        submitting.value = false
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        submitting.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to update currency rate.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.PUT, urls.currencyRates.update, {
        look_up_key: id,
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Deactivate Currency Rate (soft delete)
  const deactivateCurrencyRate = (id) => {
    deactivatingId.value = id
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate deactivated successfully.', 'success')
        deactivatingId.value = null
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        deactivatingId.value = null
        error.value = err
        snackbar.show(err?.message || 'Failed to deactivate currency rate.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.DELETE, urls.currencyRates.delete, {
        look_up_key: id,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const reset = () => {
    records.value = []
    loading.value = false
    submitting.value = false
    deactivatingId.value = null
    error.value = null
    isFetched.value = false
  }

  return {
    records,
    loading,
    submitting,
    deactivatingId,
    error,
    isFetched,
    fetchCurrencyRates,
    createCurrencyRate,
    updateCurrencyRate,
    deactivateCurrencyRate,
    reset,
  }
})
