import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useSettlementTradesStore = defineStore('settlementTrades', () => {
  // ─── Snackbar ────────────────────────────────────────
  const snackbar = useSnackbarStore()

  // ─── State ───────────────────────────────────────────
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)

  const settlement = reactive({
    settlement_id: null,
    fm_id: null,
    total_fee: 0,
    total_pnl: 0,
    created_at: null,
  })

  const summary = reactive({
    total_trades: 0,
    total_pnl: 0,
    net_pnl: 0,
    total_fee: 0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  })

  // ─── Fetch Trades ────────────────────────────────────
  const fetchTrades = (id) => {
    if (!id) return

    loading.value = true

    const successHandler = (res) => {
      records.value = res?.records || []

      Object.assign(settlement, {
        settlement_id: res?.settlement?.settlement_id || null,
        fm_id: res?.settlement?.fm_id || null,
        total_fee: res?.settlement?.total_fee || 0,
        total_pnl: res?.settlement?.total_pnl || 0,
        created_at: res?.settlement?.created_at || null,
      })

      Object.assign(summary, {
        total_trades: res?.summary?.total_trades || 0,
        total_pnl: res?.summary?.total_pnl || 0,
        net_pnl: res?.summary?.net_pnl || 0,
        total_fee: res?.summary?.total_fee || 0,
      })

      Object.assign(pagination, {
        page: res?.pagination?.page || 1,
        per_page: res?.pagination?.per_page || 10,
        total_items: res?.pagination?.total_items || 0,
        total_pages: res?.pagination?.total_pages || 1,
      })

      loading.value = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err

      snackbar.show(
        err?.message || 'Failed to fetch settlement trades.',
        'error'
      )
    }

    apiRequest(urls.KEYS.GET, urls.settlements.trades, {
      look_up_key: id,
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Pagination ──────────────────────────────────────
  const setPage = (id, page) => {
    pagination.page = page
    fetchTrades(id)
  }

  const updatePerPage = (id, newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    fetchTrades(id)
  }

  // ─── Reset ───────────────────────────────────────────
  const reset = () => {
    records.value = []
    loading.value = false
    error.value = null

    Object.assign(settlement, {
      settlement_id: null,
      fm_id: null,
      total_fee: 0,
      total_pnl: 0,
      created_at: null,
    })

    Object.assign(summary, {
      total_trades: 0,
      total_pnl: 0,
      net_pnl: 0,
      total_fee: 0,
    })

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    })
  }

  return {
    records,
    loading,
    error,

    settlement,
    summary,
    pagination,
    perPageOptions,

    fetchTrades,
    setPage,
    updatePerPage,
    reset,
  }
})

