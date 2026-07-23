import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useAccountTradesStore = defineStore('accountTrades', () => {
  const snackbar = useSnackbarStore()

  // ─── State ─────────────────────────────────────────────
  const data        = ref([])
  const loading     = ref(false)
  const error       = ref(null)
  const side        = ref(null) // null | 'open' | 'close'

  const summary = ref({
    total_lots: 0,
    total_pnl:  0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  const accountId = ref(null)

  // ─── Fetch Trades ──────────────────────────────────────
  const fetchTrades = (id, sideParam = side.value) => {
    if (!id) return

    accountId.value = id
    loading.value   = true

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
      snackbar.show(err?.message || 'Failed to fetch trades', 'error')
    }

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
    }

    if (sideParam) {
      params.side = sideParam
    }

    apiRequest('get', urls.tradingAccounts.accountTrades, {
      look_up_key: id,
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Pagination ────────────────────────────────────────
  const setPage = (page) => {
    pagination.page = page
    fetchTrades(accountId.value, side.value)
  }

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    fetchTrades(accountId.value, side.value)
  }

  const setSide = (nextSide) => {
    side.value = nextSide || null
    pagination.page = 1
    fetchTrades(accountId.value, side.value)
  }

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value      = []
    loading.value   = false
    error.value     = null
    side.value      = null

    summary.value = {
      total_lots: 0,
      total_pnl:  0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    accountId.value = null
  }

  return {
    data,
    loading,
    error,
    pagination,
    summary,
    side,
    perPageOptions,

    fetchTrades,
    setPage,
    updatePerPage,
    setSide,
    reset,
  }
})

