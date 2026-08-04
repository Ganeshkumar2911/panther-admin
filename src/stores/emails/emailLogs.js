import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useEmailLogsStore = defineStore("emailLogs", () => {
  // ─────────────────────────────────────
  // Snackbar
  // ─────────────────────────────────────

  const snackbar = useSnackbarStore();

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────

  const logs = ref([]);

  const loading = ref(false);
  const isSyncing = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ─────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  // ─────────────────────────────────────
  // Filters
  // ─────────────────────────────────────

  const filters = reactive({
    email: "",
    event: null,
    startDate: null,
    endDate: null,
    days: null,
    sort: "desc",
  });

  // ─────────────────────────────────────
  // Event Options
  // ─────────────────────────────────────

  const eventOptions = [
    { label: "Delivered", value: "delivered" },
    { label: "Clicks", value: "clicks" },
    { label: "Opened", value: "opened" },
    { label: "Spam", value: "spam" },
    { label: "Requests", value: "requests" },
    { label: "Failed", value: "failed" },
    { label: "Soft Bounced", value: "soft_bounced" },
    { label: "Bounced", value: "bounced" },
    { label: "Hard Bounced", value: "hard_bounced" },
    { label: "Loaded By Proxy", value: "loaded_by_proxy" },
    { label: "Error", value: "error" },
    { label: "Unsubscribed", value: "unsubscribed" },
    { label: "Blocked", value: "blocked" },
    { label: "Deferred", value: "deferred" },
    { label: "Invalid Email", value: "invalid_email" },
    { label: "Complaint", value: "complaint" },
  ];

  const dayOptions = [
    { label: "Today", value: 0 },
    { label: "Last 7 Days", value: 7 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
  ];

  // ─────────────────────────────────────
  // Sync Logs
  // ─────────────────────────────────────

  const syncLogs = () => {
    isSyncing.value = true;

    error.value = null;

    const successHandler = (res) => {
      isSyncing.value = false;
      snackbar.show("Email logs synced successfully.", "success");
      fetchLogs(true);
    };

    const failureHandler = (err) => {
      isSyncing.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to sync email logs.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.emailLogs.sync, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };
  // ─────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────

  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries({
        email: filters.email,
        event: filters.event,
        startDate: filters.startDate,
        endDate: filters.endDate,
        days:
          filters.days !== null && filters.days !== undefined
            ? filters.days
            : null,
        sort: filters.sort,
      }).filter(
        ([, value]) => value !== null && value !== "" && value !== undefined,
      ),
    );

  // ─────────────────────────────────────
  // Fetch Logs
  // ─────────────────────────────────────

  const fetchLogs = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;

    error.value = null;

    const successHandler = (res) => {
      logs.value = res?.data || [];
      Object.assign(pagination, {
        page: res?.pagination?.page || 1,
        per_page: res?.pagination?.per_page || 10,
        total_items: res?.pagination?.total_items || 0,
        total_pages: res?.pagination?.total_pages || 0,
      });

      isFetched.value = true;

      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...cleanFilters(),
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.list, {
      params,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Apply Filters
  // ─────────────────────────────────────

  const applyFilters = (newFilters = null) => {
    if (newFilters) {
      Object.assign(filters, newFilters);
    }

    pagination.page = 1;

    isFetched.value = false;

    fetchLogs(true);
  };

  // ─────────────────────────────────────
  // Reset Filters
  // ─────────────────────────────────────

  const resetFilters = () => {
    Object.assign(filters, {
      email: "",
      event: null,
      startDate: null,
      endDate: null,
      days: null,
      sort: "desc",
    });

    applyFilters();
  };

  // ─────────────────────────────────────
  // Change Page
  // ─────────────────────────────────────

  const changePage = (newPage) => {
    pagination.page = newPage;

    isFetched.value = false;

    fetchLogs(true);
  };

  // ─────────────────────────────────────
  // Update Per Page
  // ─────────────────────────────────────

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage);
    pagination.page = 1;
    isFetched.value = false;
    fetchLogs(true);
  };

  // ─────────────────────────────────────
  // Computed
  // ─────────────────────────────────────

  const hasActiveFilters = computed(() => {
    return (
      filters.email ||
      filters.event ||
      filters.startDate ||
      filters.endDate ||
      (filters.days !== null && filters.days !== undefined)
    );
  });

  // ─────────────────────────────────────
  // Reset
  // ─────────────────────────────────────

  const reset = () => {
    logs.value = [];

    loading.value = false;

    error.value = null;

    isFetched.value = false;

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    });

    Object.assign(filters, {
      email: "",
      event: null,
      startDate: null,
      endDate: null,
      days: null,
      sort: "desc",
    });
  };

  // ─────────────────────────────────────
  // Return
  // ─────────────────────────────────────

  return {
    // state
    logs,

    loading,
    error,
    isFetched,

    pagination,
    perPageOptions,
    filters,
    isSyncing,

    eventOptions,
    dayOptions,

    // computed
    hasActiveFilters,

    // methods
    fetchLogs,

    applyFilters,
    resetFilters,

    syncLogs,

    changePage,
    updatePerPage,

    reset,
  };
});
