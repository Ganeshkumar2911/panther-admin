import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

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

  // ─── Actions ──────────────────────────────────────────
  const fetchSettlements = (page = pagination.page) => {
    pagination.page = page
    loading.value = true
    error.value = null

    apiRequest(urls.KEYS.GET, urls.settlements.list, {
      params: buildParams(),
      isTokenRequired: true,
      onSuccess: (res) => {
        const dataObj = res?.data

        if (Array.isArray(dataObj)) {
          records.value = dataObj
        } else if (dataObj && Array.isArray(dataObj.records)) {
          records.value = dataObj.records
        } else {
          records.value = []
        }

        const summaryData = dataObj?.summary || res?.summary
        if (summaryData) {
          Object.assign(summary, summaryData)
        }

        const paginationData = res?.pagination || dataObj?.pagination
        if (paginationData) {
          Object.assign(pagination, paginationData)
        }

        loading.value = false
        isFetched.value = true
      },
      onFailure: (err) => {
        loading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to fetch settlements', 'error')
      },
    })
  }

  const setPage = (page) => {
    fetchSettlements(page)
  }

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    fetchSettlements(1)
  }

  const applyFilters = () => {
    fetchSettlements(1)
  }

  // ─── Reset ────────────────────────────────────────────
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
    perPageOptions,

    fetchSettlements,
    setPage,
    updatePerPage,
    applyFilters,
    reset,
  }
})