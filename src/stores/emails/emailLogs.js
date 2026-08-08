import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useEmailLogsStore = defineStore("emailLogs", () => {
  // Snackbar
  // ─────────────────────────────────────
  const snackbar = useSnackbarStore();

  const customEmail = reactive({
    subject: "",
    tag: "",
    type: "",
    body: "",
  });

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────

  const logs = ref([]);
  const tags = ref([]);
  const isLoadingTags = ref(false);
  const isLoadingEmailLogsDetails = ref(false);
  const isLoadingEmailViewLogsDetails = ref(false);
  const isLoadingLogsList = ref(false);
  const logDetails = ref(null);
  const isSending = ref(false);
  const isSyncing = ref(false);

  const activeFetcher = ref(null);
  const setActiveFetcher = (fn) => {
    activeFetcher.value = fn;
  };

  const logLists = ref([]);
  const viewLogsDetaisl = ref([]);

  const loading = ref(false);

  const error = ref(null);
  let onSuccessCallback = null;

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
    // { label: "Clicks", value: "clicks" },
    { label: "Opened", value: "opened" },
    // { label: "Spam", value: "spam" },
    // { label: "Requests", value: "requests" },
    // { label: "Failed", value: "failed" },
    // { label: "Soft Bounced", value: "soft_bounced" },
    // { label: "Bounced", value: "bounced" },
    // { label: "Hard Bounced", value: "hard_bounced" },
    // { label: "Loaded By Proxy", value: "loaded_by_proxy" },
    // { label: "Error", value: "error" },
    // { label: "Unsubscribed", value: "unsubscribed" },
    // { label: "Blocked", value: "blocked" },
    // { label: "Deferred", value: "deferred" },
    // { label: "Invalid Email", value: "invalid_email" },
    // { label: "Complaint", value: "complaint" },
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
  // Synchronization
  // ─────────────────────────────────────

  const syncMail = () => {
    if (
      isSyncing.value ||
      !filters.startDate ||
      !filters.endDate ||
      !filters.tags ||
      filters.tags === "ALL"
    ) {
      return;
    }

    isSyncing.value = true;

    const params = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      tags: filters.tags.toLowerCase(),
    };

    const successHandler = () => {
      isSyncing.value = false;
      snackbar.show("Email logs synced successfully.", "success");
      fetchLogsList(true);
    };

    const failureHandler = (err) => {
      isSyncing.value = false;
      snackbar.show(err?.message || "Failed to sync email logs.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.emailLogs.sync, {
      isTokenRequired: true,
      params,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Resend Mail
  // ─────────────────────────────────────

  const sendMailAgain = (id = null) => {
    // if (isFetched.value && !force) return;

    isSending.value = true;

    error.value = null;

    const successHandler = (res) => {
      isSending.value = false;
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      snackbar.show("Message Send Successfully.", "success");
    };

    const failureHandler = (err) => {
      isSending.value = false;
      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.emailLogs.sendMail, {
      look_up_key: id,
      data: customEmail,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

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
      tags.value = convertTagIntoOptions(res?.tags || []);
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
    isLoadingEmailLogsDetails.value = true;

    error.value = null;

    const successHandler = (res) => {
      logDetails.value = res;
      isLoadingEmailLogsDetails.value = false;
    };

    const failureHandler = (err) => {
      isLoadingEmailLogsDetails.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    const params = {
      campaign_id: id,
      ...cleanFilters(),
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.logDetails, {
      isTokenRequired: true,
      params: params,
      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  const fetchViewLogsDetails = async (id = null) => {
    isLoadingEmailViewLogsDetails.value = true;

    error.value = null;

    const successHandler = (res) => {
      viewLogsDetaisl.value = res.data;
      isLoadingEmailViewLogsDetails.value = false;
    };

    const failureHandler = (err) => {
      isLoadingEmailViewLogsDetails.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.viewLogDetails, {
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

  const fetchLogsList = async (force = false) => {
    isLoadingLogsList.value = true;

    error.value = null;
    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...cleanFilters(),
    };

    const successHandler = (res) => {
      logLists.value = res.tags || [];
      isLoadingLogsList.value = false;
    };

    const failureHandler = (err) => {
      isLoadingLogsList.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch email logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailLogs.logList, {
      isTokenRequired: true,
      params: params,
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

    if (typeof activeFetcher.value === "function") {
      activeFetcher.value();
    } else {
      fetchLogsList(true); // default fallback
    }
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
      tags: "ALL",
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
      (filters.tags && filters.tags !== "ALL") ||
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
    logLists.value = [];
    logDetails.value = null;
    viewLogsDetaisl.value = [];

    customEmail.subject = "";
    customEmail.tag = "";
    customEmail.type = "";
    customEmail.body = "";

    isLoadingTags.value = false;
    isLoadingEmailLogsDetails.value = false;
    isLoadingEmailViewLogsDetails.value = false;
    isLoadingLogsList.value = false;
    isSending.value = false;
    isSyncing.value = false;
    loading.value = false;
    error.value = null;
    isFetched.value = false;
    activeFetcher.value = null;
    onSuccessCallback = null;

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
      tags: "ALL",
    });
  };

  let setOnSuccessCallback = (callback) => {
    onSuccessCallback = callback;
  };

  // ─────────────────────────────────────
  // Reset Log Details
  // ─────────────────────────────────────
  function resetLogDetails() {
    logDetails.value = null;
  }

  const parseVariables = (html = "") => {
    const matches =
      html
        .match(/{{(.*?)}}/g)
        ?.map((item) => item.replace("{{", "").replace("}}", "").trim()) || [];

    return [...new Set(matches)];
  };

  // ─────────────────────────────────────
  // Return
  // ─────────────────────────────────────

  return {
    // Shared request state
    loading,
    error,
    isFetched,

    // Log list state
    logs,
    logLists,
    isLoadingLogsList,
    pagination,
    perPageOptions,
    fetchLogs,
    fetchLogsList,
    changePage,
    updatePerPage,

    // Filter state
    filters,
    hasActiveFilters,
    applyFilters,
    resetFilters,

    // Tag state
    tags,
    isLoadingTags,
    fetchTags,

    // Log detail state
    logDetails,
    viewLogsDetaisl,
    isLoadingEmailLogsDetails,
    isLoadingEmailViewLogsDetails,
    fetchLogsDetails,
    fetchViewLogsDetails,
    resetLogDetails,

    // Synchronization state
    isSyncing,
    syncMail,
    activeFetcher,
    setActiveFetcher,

    // Email sending state
    customEmail,
    isSending,
    sendMailAgain,
    setOnSuccessCallback,
    onSuccessCallback,

    // Shared options and utilities
    eventOptions,
    dayOptions,
    parseVariables,

    // Store lifecycle
    reset,
  };
});
