// stores/paymentMethods/paymentMethods.js

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const usePaymentMethodsStore = defineStore(
  'paymentMethods',
  () => {
    // ─────────────────────────────────────
    // Snackbar
    // ─────────────────────────────────────

    const snackbar = useSnackbarStore()

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────

    const records = ref([])

    const loading = ref(false)

    const syncLoading = ref(false)

    const updatingId = ref(null)

    const updateLoading = ref(false)

    const error = ref(null)

    const isFetched = ref(false)

    // ─────────────────────────────────────
    // Summary
    // ─────────────────────────────────────

    const summary = reactive({
      total_wallets: 0,
      active_wallets: 0,
      total_confirmed_balance: 0,
    })

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const pagination = reactive({
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    })

    // ─────────────────────────────────────
    // Fetch Payment Methods
    // ─────────────────────────────────────

    const fetchPaymentMethods = (force = false) => {
      if (isFetched.value && !force) return

      loading.value = true

      const successHandler = (res) => {
        records.value = res?.data || []

        Object.assign(summary, {
          total_wallets: records.value.length,
          active_wallets: records.value.filter(
            (item) => item.is_active
          ).length,
          total_confirmed_balance: records.value.reduce(
            (total, item) =>
              total + Number(item?.balance_confirmed || 0),
            0
          ),
        })

        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 10,
          total_items: res?.pagination?.total || 0,
          total_pages: res?.pagination?.pages || 1,
          has_next: res?.pagination?.has_next || false,
          has_prev: res?.pagination?.has_prev || false,
        })

        isFetched.value = true

        loading.value = false
      }

      const failureHandler = (err) => {
        loading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to fetch payment methods.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.paymentMethods.list,
        {
          params: {
            page: pagination.page,
            per_page: pagination.per_page,
          },

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Sync Wallets
    // ─────────────────────────────────────

    const syncWallets = () => {
      syncLoading.value = true

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Wallets synced successfully.',
          'success'
        )

        syncLoading.value = false

        fetchPaymentMethods(true)
      }

      const failureHandler = (err) => {
        syncLoading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to sync wallets.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.POST,
        urls.paymentMethods.syncWallets,
        {
          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Update Payment Method
    // ─────────────────────────────────────

    const updatePaymentMethod = (id, payload) => {
      updatingId.value = id
      updateLoading.value = true

      return new Promise((resolve, reject) => {
        const successHandler = (res) => {
          snackbar.show(
            res?.message || 'Payment method updated successfully.',
            'success'
          )

          updatingId.value = null
          updateLoading.value = false

          fetchPaymentMethods(true)
          resolve(res)
        }

        const failureHandler = (err) => {
          updatingId.value = null
          updateLoading.value = false

          error.value = err

          snackbar.show(
            err?.message || 'Failed to update payment method.',
            'error'
          )
          reject(err)
        }

        apiRequest(
          urls.KEYS.PUT,
          urls.paymentMethods.update,
          {
            look_up_key: id,

            data: payload,

            isTokenRequired: true,

            onSuccess: successHandler,
            onFailure: failureHandler,
          }
        )
      })
    }

    // ─────────────────────────────────────
    // Create Payment Method
    // ─────────────────────────────────────

    const createPaymentMethod = (payload) => {
      updateLoading.value = true

      return new Promise((resolve, reject) => {
        const successHandler = (res) => {
          snackbar.show(
            res?.message || 'Payment method created successfully.',
            'success'
          )

          updateLoading.value = false

          fetchPaymentMethods(true)
          resolve(res)
        }

        const failureHandler = (err) => {
          updateLoading.value = false

          error.value = err

          snackbar.show(
            err?.message || 'Failed to create payment method.',
            'error'
          )
          reject(err)
        }

        apiRequest(
          urls.KEYS.POST,
          urls.paymentMethods.create,
          {
            data: payload,

            isTokenRequired: true,

            onSuccess: successHandler,
            onFailure: failureHandler,
          }
        )
      })
    }

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const setPage = (page) => {
      pagination.page = page

      fetchPaymentMethods(true)
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      records.value = []

      loading.value = false

      syncLoading.value = false

      updatingId.value = null

      error.value = null

      isFetched.value = false

      Object.assign(summary, {
        total_wallets: 0,
        active_wallets: 0,
        total_confirmed_balance: 0,
      })

      Object.assign(pagination, {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
    }

    // ─────────────────────────────────────
    // Return
    // ─────────────────────────────────────

    return {
      // state
      records,

      loading,
      syncLoading,
      updatingId,
      updateLoading,

      error,
      isFetched,

      summary,
      pagination,

      // methods
      fetchPaymentMethods,
      syncWallets,
      updatePaymentMethod,
      createPaymentMethod,

      setPage,

      reset,
    }
  }
)
