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
  const tags = ref([]);
  const isLoadingTags = ref(false);
  const isLoadingLogs = ref(false);
  const isLoadingLogsList = ref(false);
  const logDetails = ref(null);

  const logLists = ref([]);

  const loading = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ─────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────

  const pagination = reactive({
    page: 1,
    per_page: 10,
    hasNext: false,
    hasPrev: false,
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
    tags: "ALL",
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
  // Helpers
  // ─────────────────────────────────────

  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries({
        email: filters.email,
        event: filters.event,
        startDate: filters.startDate,
        endDate: filters.endDate,
        tags: filters.tags === "ALL" ? null : filters.tags,
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

  const fetchLogs = async (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;

    error.value = null;

    const successHandler = (res) => {
      logs.value = res?.results || [];
      Object.assign(pagination, {
        page: res?.page ?? 1,
        per_page: res?.per_page ?? 10,
        hasNext: res?.hasNext ?? false,
        hasPrev: res?.hasPrev ?? false,
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
  // Fetch Tags
  // ─────────────────────────────────────

  const convertTagIntoOptions = (tagsArray) => {
    return tagsArray.map((tag) => ({
      label: tag,
      value: tag,
    }));
  };

  const fetchTags = async (query = "", force = false) => {
    isLoadingTags.value = true;

    error.value = null;

    const successHandler = (res) => {
      tags.value = convertTagIntoOptions(res?.codes || []);
      isLoadingTags.value = false;
    };

    const failureHandler = (err) => {
      isLoadingTags.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.tags, {
      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Fetch Logs Details
  // ─────────────────────────────────────

  const fetchLogsDetails = async (id = null) => {
    isLoadingLogs.value = true;

    error.value = null;

    const successHandler = (res) => {
      logDetails.value = res?.data;
      isLoadingLogs.value = false;
    };

    const failureHandler = (err) => {
      isLoadingLogs.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.logDetails, {
      isTokenRequired: true,
      params: {
        messageId: id,
      },
      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Fetch LogsList Details
  // ─────────────────────────────────────

  const fetchLogsList = async () => {
    isLoadingLogsList.value = true;

    error.value = null;

    const successHandler = (res) => {
      logLists.value = res;
      isLoadingLogsList.value = false;
    };

    const failureHandler = (err) => {
      isLoadingLogsList.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.logList, {
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
      tags: null,
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
      filters.tags ||
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
    tags.value = [];

    isLoadingTags.value = false;

    loading.value = false;

    error.value = null;

    isFetched.value = false;

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      hasNext: false,
      hasPrev: false,
    });

    Object.assign(filters, {
      email: "",
      event: null,
      startDate: null,
      endDate: null,
      days: null,
      sort: "desc",
      tags: null,
    });
  };

  // ─────────────────────────────────────
  // Reset Log Details
  // ─────────────────────────────────────
  function resetLogDetails() {
    logDetails.value = null;
  }

  // ─────────────────────────────────────
  // Return
  // ─────────────────────────────────────

  return {
    // state
    logs,
    tags,

    loading,
    error,
    isFetched,
    isLoadingTags,
    isLoadingLogsList,

    pagination,
    perPageOptions,
    filters,
    logLists,
    logDetails,

    eventOptions,
    dayOptions,
    isLoadingLogs,

    // computed
    hasActiveFilters,

    // methods
    fetchLogs,

    applyFilters,
    resetFilters,
    fetchLogsDetails,
    fetchLogsList,

    fetchTags,

    resetLogDetails,

    changePage,
    updatePerPage,

    reset,
  };
});
