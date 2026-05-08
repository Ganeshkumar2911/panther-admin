import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiRequest from '@/api/request'
import urls from '@/api/urls'

export const useProfileStore = defineStore('user', () => {
  const user             = ref(null)
  const loading          = ref(false)

  const dashboard        = ref(null)
  const dashboardLoading = ref(false)

  // ─── Fetch User ────────────────────────────────────
  function fetchUserProfile() {
    loading.value = true

    const successHandler = (res) => {
      const data = res?.data || res
      user.value = data
    }

    const failureHandler = (err) => {
      console.error('User fetch error:', err)
    }

    const finallyHandler = () => {
      loading.value = false
    }

    apiRequest('get', urls.auth.profile, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    })
  }

  // ─── Fetch Dashboard ───────────────────────────────
  function fetchDashboard() {
    dashboardLoading.value = true

    const successHandler = (res) => {
      const data = res?.data || res
      dashboard.value = data
    }

    const failureHandler = (err) => {
      console.error('Dashboard fetch error:', err)
    }

    const finallyHandler = () => {
      dashboardLoading.value = false
    }

    apiRequest('get', urls.dashboard.stats, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    })
  }

  // ─── Submit FM Registration Request ───────────────
  /**
   * @param {Object} payload
   * @param {number|string} payload.performance_fee
   * @param {number|string} payload.fm_share
   * @param {number|string} payload.broker_share
   * @param {number|string} payload.ib_pool_percentage
   * @param {string}        payload.settlement_type   - 'daily' | 'monthly'
   * @param {string}        payload.settlement_time   - 'HH:MM'
   * @returns {Promise<void>} resolves on success, rejects on failure
   */
  function submitFmRequest(payload) {
    return new Promise((resolve, reject) => {
      const body = {
        performance_fee:    Number(payload.performance_fee),
        fm_share:           Number(payload.fm_share),
        broker_share:       Number(payload.broker_share),
        ib_pool_percentage: Number(payload.ib_pool_percentage),
        settlement_type:    payload.settlement_type,
        settlement_time:    payload.settlement_time,
      }

      const successHandler = (res) => {
        resolve(res?.data || res)
      }

      const failureHandler = (err) => {
        console.error('FM request submission error:', err)
        reject(err)
      }

      apiRequest('post', urls.auth.fmRequest, {
        data: body,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  return {
    user,
    loading,
    fetchUserProfile,
    dashboard,
    dashboardLoading,
    fetchDashboard,
    submitFmRequest,
  }
})