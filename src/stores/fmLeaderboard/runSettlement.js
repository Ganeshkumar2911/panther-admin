import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useRunSettlementStore = defineStore(
  'runSettlement',
  () => {
    const snackbar = useSnackbarStore()

    const route = useRoute()

    // ─────────────────────────────────────
    // STATE
    // ─────────────────────────────────────

    const settlement = ref(null)

    const loading = ref(false)

    const runLoading = ref(false)

    const error = ref(null)

    // ─────────────────────────────────────
    // FETCH SETTLEMENT PREVIEW
    // ─────────────────────────────────────

    const fetchSettlement = () => {
      loading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.GET,
        `${urls.settlement.run}/${route.params.id}`,
        {
          isTokenRequired: true,

          onSuccess: (res) => {
            settlement.value = res?.data || null

            loading.value = false
          },

          onFailure: (err) => {
            loading.value = false

            error.value = err

            snackbar.show(
              err?.message || 'Failed to fetch settlement preview.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // RUN SETTLEMENT
    // ─────────────────────────────────────

    const runSettlement = () => {
      runLoading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.POST,
        `${urls.settlement.run}/${route.params.id}`,
        {
          isTokenRequired: true,

          onSuccess: (res) => {
            snackbar.show(
              res?.message || 'Settlement executed successfully.',
              'success'
            )

            runLoading.value = false

            fetchSettlement()
          },

          onFailure: (err) => {
            runLoading.value = false

            error.value = err

            snackbar.show(
              err?.message || 'Failed to run settlement.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // RESET
    // ─────────────────────────────────────

    const reset = () => {
      settlement.value = null

      loading.value = false

      runLoading.value = false

      error.value = null
    }

    // ─────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────

    return {
      // state
      settlement,
      loading,
      runLoading,
      error,

      // methods
      fetchSettlement,
      runSettlement,
      reset,
    }
  }
)