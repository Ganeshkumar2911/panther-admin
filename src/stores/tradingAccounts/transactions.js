import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useAccountTransactionsStore = defineStore('accountTransactions', () => {
  const data = ref([])

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  })

  const summary = ref({
    net_flow: 0,
    total_credits: 0,
    total_debits: 0,
    total_deposit: 0,
    total_withdrawal: 0,
    total_transactions: 0,
  })

  const filters = ref({
    search: '',
    page: 1,
    per_page: 10,
  })

  const isLoading = ref(false)

  const snackbar = useSnackbarStore()

  // ─── Fetch Transactions ─────────────────────────────────────
  const fetchTransactions = (accountId, page = filters.value.page) => {
    filters.value.page = page

    isLoading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      pagination.value = res?.pagination || {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      }

      summary.value = res?.summary || {
        net_flow: 0,
        total_credits: 0,
        total_debits: 0,
        total_deposit: 0,
        total_withdrawal: 0,
        total_transactions: 0,
      }

      isLoading.value = false
    }

    const failureHandler = (err) => {
      data.value = []

      pagination.value = {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      }

      summary.value = {
        net_flow: 0,
        total_credits: 0,
        total_debits: 0,
        total_deposit: 0,
        total_withdrawal: 0,
        total_transactions: 0,
      }

      isLoading.value = false

      snackbar.show(
        err?.message || 'Failed to fetch transactions.',
        'error'
      )
    }

    apiRequest(
      urls.KEYS.GET,
      urls.tradingAccounts.transactions,
      {
        look_up_key: accountId,

        params: {
          page: filters.value.page,
          per_page: filters.value.per_page,
          // search: filters.value.search || undefined,
        },

        isTokenRequired: true,

        onSuccess: successHandler,
        onFailure: failureHandler,
      }
    )
  }

  // ─── Apply Filters ─────────────────────────────────────
  const applyFilters = (accountId) => {
    filters.value.page = 1
    fetchTransactions(accountId, 1)
  }

  const updatePerPage = (accountId, newPerPage) => {
    filters.value.per_page = Number(newPerPage)
    pagination.value.per_page = Number(newPerPage)
    filters.value.page = 1
    fetchTransactions(accountId, 1)
  }

  // ─── Reset Store ─────────────────────────────────────
  const reset = () => {
    data.value = []

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    }

    summary.value = {
      net_flow: 0,
      total_credits: 0,
      total_debits: 0,
      total_deposit: 0,
      total_withdrawal: 0,
      total_transactions: 0,
    }

    filters.value = {
      search: '',
      page: 1,
      per_page: 10,
    }

    isLoading.value = false
  }

  return {
    data,
    pagination,
    summary,
    perPageOptions,

    filters,

    isLoading,

    fetchTransactions,
    applyFilters,
    updatePerPage,
    reset,
  }
})