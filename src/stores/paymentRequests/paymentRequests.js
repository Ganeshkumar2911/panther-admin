import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const usePaymentRequestsStore = defineStore(
  'paymentRequests',
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

    const approveLoading = ref(false)

    const rejectLoading = ref(false)

    const error = ref(null)

    const isFetched = ref(false)

    // ─────────────────────────────────────
    // Summary
    // ─────────────────────────────────────

    const summary = reactive({
      pending_deposits: 0,
      approved_deposits: 0,
      rejected_deposits: 0,

      pending_withdrawals: 0,
      approved_withdrawals: 0,
      rejected_withdrawals: 0,
    })

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const pagination = reactive({
      page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
    })

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const filters = reactive({
      type: null,
      approval_status: null,

      user_id: null,
      trading_account_id: null,

      from_date: '',
      to_date: '',
    })

    // ─────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────

    const cleanFilters = () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) =>
            value !== null &&
            value !== '' &&
            value !== undefined
        )
      )

    // ─────────────────────────────────────
    // Fetch Requests
    // ─────────────────────────────────────

    const fetchRequests = (force = false) => {
      if (isFetched.value && !force) return

      loading.value = true

      error.value = null

      const successHandler = (res) => {
        records.value = res?.data || []

        Object.assign(summary, {
          pending_deposits:
            res?.summary?.pending_deposits || 0,

          approved_deposits:
            res?.summary?.approved_deposits || 0,

          rejected_deposits:
            res?.summary?.rejected_deposits || 0,

          pending_withdrawals:
            res?.summary?.pending_withdrawals || 0,

          approved_withdrawals:
            res?.summary?.approved_withdrawals || 0,

          rejected_withdrawals:
            res?.summary?.rejected_withdrawals || 0,
        })

        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 20,
          total_items:
            res?.pagination?.total_items || 0,
          total_pages:
            res?.pagination?.total_pages || 1,
        })

        isFetched.value = true

        loading.value = false
      }

      const failureHandler = (err) => {
        loading.value = false

        error.value = err

        snackbar.show(
          err?.message ||
            'Failed to fetch payment requests.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.paymentRequests.list,
        {
          params: {
            page: pagination.page,
            per_page: pagination.per_page,

            ...cleanFilters(),
          },

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Approve Request
    // ─────────────────────────────────────

    const approveRequest = (id) => {
      approveLoading.value = true

      error.value = null

      const successHandler = (res) => {
        snackbar.show(
          res?.message ||
            'Payment request approved successfully.',
          'success'
        )

        fetchRequests(true)
      }

      const failureHandler = (err) => {
        error.value = err

        snackbar.show(
          err?.message ||
            'Failed to approve payment request.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.POST,
        urls.paymentRequests.approve,
        {
          look_up_key: id,

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: () => {
            approveLoading.value = false
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Reject Request
    // ─────────────────────────────────────

    const rejectRequest = (id) => {
      rejectLoading.value = true

      error.value = null

      const successHandler = (res) => {
        snackbar.show(
          res?.message ||
            'Payment request rejected successfully.',
          'success'
        )

        fetchRequests(true)
      }

      const failureHandler = (err) => {
        error.value = err

        snackbar.show(
          err?.message ||
            'Failed to reject payment request.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.POST,
        urls.paymentRequests.reject,
        {
          look_up_key: id,

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: () => {
            rejectLoading.value = false
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const applyFilters = (newFilters) => {
      if (newFilters) {
        Object.assign(filters, newFilters)
      }

      pagination.page = 1

      isFetched.value = false

      fetchRequests(true)
    }

    const resetFilters = () => {
      Object.assign(filters, {
        type: null,
        approval_status: null,

        user_id: null,
        trading_account_id: null,

        from_date: '',
        to_date: '',
      })

      applyFilters()
    }

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const setPage = (page) => {
      pagination.page = page

      isFetched.value = false

      fetchRequests(true)
    }

    // ─────────────────────────────────────
    // Search Clients
    // ─────────────────────────────────────

    const fetchAllClients = (
      searchQuery = ''
    ) => {
      return new Promise((resolve, reject) => {
        const successHandler = (res) => {
          const clients = (res?.data || []).map(
            (client) => ({
              label: client.name,
              value: client.id,
            })
          )

          resolve(clients)
        }

        const failureHandler = (err) => {
          snackbar.show(
            err?.message ||
              'Failed to fetch clients.',
            'error'
          )

          reject(err)
        }

        apiRequest(
          urls.KEYS.GET,
          urls.clientLedger.allClients,
          {
            params: searchQuery
              ? { search: searchQuery }
              : {},

            isTokenRequired: true,

            onSuccess: successHandler,
            onFailure: failureHandler,
          }
        )
      })
    }

    // ─────────────────────────────────────
    // Search Accounts
    // ─────────────────────────────────────

    const fetchAllAccounts = (
      searchQuery = '',
      clientId = null
    ) => {
      return new Promise((resolve, reject) => {
        const successHandler = (res) => {
          const accounts = (res?.data || []).map(
            (account) => ({
              label: `#${account.account_number}`,
              value: account.account_id,
            })
          )

          resolve(accounts)
        }

        const failureHandler = (err) => {
          snackbar.show(
            err?.message ||
              'Failed to fetch accounts.',
            'error'
          )

          reject(err)
        }

        const params = {}

        if (searchQuery) {
          params.search = searchQuery
        }

        if (clientId) {
          params.client_id = clientId
        }

        apiRequest(
          urls.KEYS.GET,
          urls.clientLedger.allAccounts,
          {
            params,

            isTokenRequired: true,

            onSuccess: successHandler,
            onFailure: failureHandler,
          }
        )
      })
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      records.value = []

      loading.value = false

      approveLoading.value = false

      rejectLoading.value = false

      error.value = null

      isFetched.value = false

      Object.assign(summary, {
        pending_deposits: 0,
        approved_deposits: 0,
        rejected_deposits: 0,

        pending_withdrawals: 0,
        approved_withdrawals: 0,
        rejected_withdrawals: 0,
      })

      Object.assign(pagination, {
        page: 1,
        per_page: 20,
        total_items: 0,
        total_pages: 1,
      })

      Object.assign(filters, {
        type: null,
        approval_status: null,

        user_id: null,
        trading_account_id: null,

        from_date: '',
        to_date: '',
      })
    }

    return {
      // state
      records,

      loading,
      approveLoading,
      rejectLoading,

      error,
      isFetched,

      summary,
      pagination,
      filters,

      // methods
      fetchRequests,

      approveRequest,
      rejectRequest,

      applyFilters,
      resetFilters,

      setPage,

      fetchAllClients,
      fetchAllAccounts,

      reset,
    }
  }
)
