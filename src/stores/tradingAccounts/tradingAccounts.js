import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useAccountsStore = defineStore('accounts', () => {
  const snackbar = useSnackbarStore()

  // ─── State ─────────────────────────────────────────────
  const data        = ref([])
  const loading     = ref(false)
  const error       = ref(null)

  const summary = ref({
    total_accounts: 0,
    total_balance:  0,
    total_pnl:      0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  // Tabs filter (all | client | fm)
  const activeType = ref('all')

  // ─── Fetch Accounts ────────────────────────────────────
  const fetchAccounts = () => {
    loading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      if (res?.pagination) {
        Object.assign(pagination, res.pagination)
      }

      if (res?.summary) {
        summary.value = res.summary
      }

      loading.value   = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value   = err
      snackbar.show(err?.message || 'Failed to fetch accounts', 'error')
    }

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...(activeType.value !== 'all' ? { account_type: activeType.value } : {}),
    }

    apiRequest('get', urls.tradingAccounts.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Change Tab (client / fm) ──────────────────────────
  const setType = (type) => {
    activeType.value = type
    pagination.page  = 1
    fetchAccounts()
  }

  // ─── Pagination ────────────────────────────────────────
  const setPage = (page) => {
    pagination.page = page
    fetchAccounts()
  }

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value      = []
    loading.value   = false
    error.value     = null

    summary.value = {
      total_accounts: 0,
      total_balance:  0,
      total_pnl:      0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    activeType.value = 'all'
  }

  return {
    data,
    loading,
    error,
    pagination,
    summary,
    activeType,

    fetchAccounts,
    setType,
    setPage,
    reset,
  }
})
