import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useLeadStore = defineStore('lead', () => {
  const snackbar = useSnackbarStore()

  // State
  const leads = ref([])
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0,
  })

  const filters = reactive({
    search: '',
    stage: '',
    staff: '',
    source: '',
    priority: '',
    country: '',
  })

  const currentLead = ref(null)
  const leadHistory = ref([])
  const dashboardMetrics = ref(null)
  const stageCounts = ref({})

  const loading = ref(false)
  const actionLoading = ref(false)
  const detailLoading = ref(false)
  const historyLoading = ref(false)
  const metricsLoading = ref(false)
  const countsLoading = ref(false)
  const error = ref(null)

  // ─── Actions ────────────────────────────────────────────────────────

  // 1. Get All Leads (Paginated & Filtered)
  const fetchLeads = (page = pagination.value.page || 1) => {
    loading.value = true
    error.value = null

    const params = {
      page,
      per_page: pagination.value.per_page,
    }

    if (filters.search) params.search = filters.search
    if (filters.stage) params.stage = filters.stage
    if (filters.staff) params.staff = filters.staff
    if (filters.source) params.source = filters.source
    if (filters.priority) params.priority = filters.priority
    if (filters.country) params.country = filters.country

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.lead.list, {
        isTokenRequired: true,
        params,
        onSuccess: (res) => {
          loading.value = false
          const resData = res?.data || res || {}
          leads.value = Array.isArray(resData.items) ? resData.items : (Array.isArray(resData) ? resData : [])
          pagination.value = {
            page: resData.page || page,
            per_page: resData.per_page || pagination.value.per_page,
            total: resData.total || leads.value.length,
            pages: resData.pages || Math.ceil((resData.total || leads.value.length) / (resData.per_page || 10)) || 1,
          }
          resolve(resData)
        },
        onFailure: (err) => {
          loading.value = false
          error.value = err
          snackbar.show(err?.message || err?.response?.data?.message || 'Failed to fetch leads', 'error')
          reject(err)
        },
      })
    })
  }

  // 2. Create Lead
  const createLead = (payload) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.lead.list, {
        isTokenRequired: true,
        data: payload,
        onSuccess: (res) => {
          actionLoading.value = false
          snackbar.show(res?.message || res?.data?.message || 'Lead created successfully', 'success')
          fetchLeads(1)
          fetchDashboardMetrics()
          fetchStageCounts()
          resolve(res)
        },
        onFailure: (err) => {
          actionLoading.value = false
          snackbar.show(err?.response?.data?.message || err?.message || 'Failed to create lead', 'error')
          reject(err)
        },
      })
    })
  }

  // 3. Get Lead by ID
  const fetchLeadById = (leadId) => {
    detailLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.lead.detail, {
        look_up_key: leadId,
        isTokenRequired: true,
        onSuccess: (res) => {
          detailLoading.value = false
          currentLead.value = res?.data || res
          resolve(currentLead.value)
        },
        onFailure: (err) => {
          detailLoading.value = false
          snackbar.show(err?.response?.data?.message || err?.message || 'Failed to fetch lead details', 'error')
          reject(err)
        },
      })
    })
  }

  // 4. Update Lead
  const updateLead = (leadId, payload) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PATCH, urls.lead.detail, {
        look_up_key: leadId,
        isTokenRequired: true,
        data: payload,
        onSuccess: (res) => {
          actionLoading.value = false
          snackbar.show(res?.message || res?.data?.message || 'Lead updated successfully', 'success')
          fetchLeads()
          if (currentLead.value?.id === leadId) {
            fetchLeadById(leadId)
          }
          fetchDashboardMetrics()
          fetchStageCounts()
          resolve(res)
        },
        onFailure: (err) => {
          actionLoading.value = false
          snackbar.show(err?.response?.data?.message || err?.message || 'Failed to update lead', 'error')
          reject(err)
        },
      })
    })
  }

  // 5. Assign Lead
  const assignLead = (leadId, staffId) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PATCH, urls.lead.assign, {
        look_up_key: leadId,
        isTokenRequired: true,
        data: { assigned_staff_id: staffId },
        onSuccess: (res) => {
          actionLoading.value = false
          snackbar.show(res?.message || res?.data?.message || 'Lead assigned successfully', 'success')
          fetchLeads()
          if (currentLead.value?.id === leadId) {
            fetchLeadById(leadId)
          }
          resolve(res)
        },
        onFailure: (err) => {
          actionLoading.value = false
          snackbar.show(err?.response?.data?.message || err?.message || 'Failed to assign lead', 'error')
          reject(err)
        },
      })
    })
  }

  // 6. Get Lead History
  const fetchLeadHistory = (leadId) => {
    historyLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.lead.history, {
        look_up_key: leadId,
        isTokenRequired: true,
        onSuccess: (res) => {
          historyLoading.value = false
          leadHistory.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          resolve(leadHistory.value)
        },
        onFailure: (err) => {
          historyLoading.value = false
          snackbar.show(err?.response?.data?.message || err?.message || 'Failed to fetch lead history', 'error')
          reject(err)
        },
      })
    })
  }

  // 7. Get Dashboard Metrics
  const fetchDashboardMetrics = () => {
    metricsLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.lead.dashboard, {
        isTokenRequired: true,
        onSuccess: (res) => {
          metricsLoading.value = false
          dashboardMetrics.value = res?.data || res || {}
          resolve(dashboardMetrics.value)
        },
        onFailure: (err) => {
          metricsLoading.value = false
          reject(err)
        },
      })
    })
  }

  // 8. Get Stage Counts
  const fetchStageCounts = () => {
    countsLoading.value = true

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.lead.stageCounts, {
        isTokenRequired: true,
        onSuccess: (res) => {
          countsLoading.value = false
          stageCounts.value = res?.data || res || {}
          resolve(stageCounts.value)
        },
        onFailure: (err) => {
          countsLoading.value = false
          reject(err)
        },
      })
    })
  }

  // Reset Filters
  const resetFilters = () => {
    filters.search = ''
    filters.stage = ''
    filters.staff = ''
    filters.source = ''
    filters.priority = ''
    filters.country = ''
    fetchLeads(1)
  }

  return {
    leads,
    pagination,
    filters,
    currentLead,
    leadHistory,
    dashboardMetrics,
    stageCounts,
    loading,
    actionLoading,
    detailLoading,
    historyLoading,
    metricsLoading,
    countsLoading,
    error,
    fetchLeads,
    createLead,
    fetchLeadById,
    updateLead,
    assignLead,
    fetchLeadHistory,
    fetchDashboardMetrics,
    fetchStageCounts,
    resetFilters,
  }
})
