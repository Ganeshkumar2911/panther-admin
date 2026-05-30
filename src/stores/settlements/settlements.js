import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useSettlementsStore = defineStore('settlement', () => {
  // ─── Snackbar ─────────────────────────────────────────
  const snackbar = useSnackbarStore()

  // ─── State ────────────────────────────────────────────
  const records = ref([])
  const loading = ref(false)
  const isFetched = ref(false)
  const error = ref(null)

  const summary = reactive({
    broker_net: 0,
    ib_pool: 0,
    total_fees: 0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  })

  // ─── Filters ──────────────────────────────────────────
  const filters = reactive({
    fm_id: null,
    status: null,
    from_date: null,
    to_date: null,
  })

  // ─── Helpers ──────────────────────────────────────────
  const cleanFilters = (payload = {}) => {
    return Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ''
      )
    )
  }

  const buildParams = () => {
    return cleanFilters({
      page: pagination.page,
      per_page: pagination.per_page,

      fm_id: filters.fm_id,
      status: filters.status,
      from_date: filters.from_date,
      to_date: filters.to_date,
    })
  }

  // ─── Fetch Settlements ────────────────────────────────
  const fetchSettlements = (force = false) => {
    if (isFetched.value && !force) return

    loading.value = true

    const successHandler = (res) => {
      const payload = res?.data || {}

      records.value = payload?.records || []

      Object.assign(summary, {
        broker_net: payload?.summary?.broker_net || 0,
        ib_pool: payload?.summary?.ib_pool || 0,
        total_fees: payload?.summary?.total_fees || 0,
      })

      Object.assign(pagination, {
        page: res?.pagination?.page || 1,
        per_page: res?.pagination?.per_page || 10,
        total_items: res?.pagination?.total_items || 0,
        total_pages: res?.pagination?.total_pages || 1,
      })

      loading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err

      snackbar.show(
        err?.message || 'Failed to fetch settlements.',
        'error'
      )
    }

    apiRequest(urls.KEYS.GET, urls.settlements.list, {
      params: buildParams(),
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Pagination ──────────────────────────────────────
  const setPage = (page) => {
    pagination.page = page
    isFetched.value = false

    fetchSettlements(true)
  }

  // ─── Apply Filters ───────────────────────────────────
  const applyFilters = () => {
    pagination.page = 1
    isFetched.value = false

    fetchSettlements(true)
  }

  // ─── Reset ───────────────────────────────────────────
  const reset = () => {
    records.value = []
    loading.value = false
    isFetched.value = false
    error.value = null

    Object.assign(summary, {
      broker_net: 0,
      ib_pool: 0,
      total_fees: 0,
    })

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    })

    Object.assign(filters, {
      fm_id: null,
      status: null,
      from_date: null,
      to_date: null,
    })
  }

  // ─── Expose ──────────────────────────────────────────
  return {
    records,
    loading,
    isFetched,
    error,

    summary,
    pagination,
    filters,

    fetchSettlements,
    setPage,
    applyFilters,
    reset,
  }
})