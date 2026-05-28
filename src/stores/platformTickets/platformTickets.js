import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const usePlatfromTicketsStore = defineStore("platfromTickets", () => {
  // ─── List State ────────────────────────────────────────
  const data = ref([]);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  // ✅ Persist filters between route/tab changes
  const filters = reactive({
    filter: "all",
    status: "",
    priority: "",
    search: "",
    sort: "desc",
  });

  // ─── Detail State ──────────────────────────────────────
  const detail = ref(null);
  const detailLoading = ref(false);

  const isLoading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Static Filter Options ─────────────────────────────
  const filterOptions = {
    dateFilters: [
      { label: "All", value: "all" },
      { label: "Today", value: "today" },
      { label: "Last 7 Days", value: "last_7_days" },
      { label: "Last 30 Days", value: "last_30_days" },
      { label: "Latest", value: "latest" },
    ],

    statuses: [
      { label: "Open", value: "open" },
      { label: "Pending", value: "pending" },
      { label: "Closed", value: "closed" },
      { label: "Resolved", value: "resolved" },
    ],

    priorities: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],

    sorts: [
      { label: "Newest First", value: "desc" },
      { label: "Oldest First", value: "asc" },
    ],
  };

  // ─── Helpers ───────────────────────────────────────────
  const buildParams = (page = pagination.value.page || 1) => {
    const params = {
      page,
      per_page: pagination.value.per_page,
      sort: filters.sort,
    };

    if (filters.filter) {
      params.filter = filters.filter;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.priority) {
      params.priority = filters.priority;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return params;
  };

  // ─── Fetch Tickets List ────────────────────────────────
  const fetchTickets = (force = false, page = pagination.value.page || 1) => {
    if (isFetched.value && !force && page === pagination.value.page) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    apiRequest(urls.KEYS.GET, urls.platformTickets.list, {
      params: buildParams(page),
      isTokenRequired: true,

      onSuccess: (res) => {
        data.value = res?.data || [];

        pagination.value = res?.pagination || {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 0,
        };

        pagination.value.page = page;

        isLoading.value = false;
        isFetched.value = true;
      },

      onFailure: (err) => {
        isLoading.value = false;
        error.value = err;

        snackbar.show(err?.message || "Something went wrong.", "error");
      },
    });
  };

  // ─── Fetch Ticket Detail ───────────────────────────────
  // ✅ No isFetched check
  // API should call every time page mounts
  const fetchTicketDetail = (id) => {
    if (!id) return;

    detailLoading.value = true;
    detail.value = null;

    apiRequest(urls.KEYS.GET, urls.platformTickets.detail, {
      look_up_key: id,
      isTokenRequired: true,

      onSuccess: (res) => {
        detail.value = res?.data || null;
        detailLoading.value = false;
      },

      onFailure: (err) => {
        detailLoading.value = false;

        snackbar.show(err?.message || "Something went wrong.", "error");
      },
    });
  };

  // ─── Add Comment ───────────────────────────────────────
  const addComment = (id, payload, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    apiRequest(urls.KEYS.POST, urls.platformTickets.comment, {
      look_up_key: id,
      data: payload,
      isTokenRequired: true,

      onSuccess: () => {
        actionLoading.value = false;

        snackbar.show("Comment added successfully.", "success");

        // refresh detail
        fetchTicketDetail(id);

        onDone?.();
      },

      onFailure: (err) => {
        actionLoading.value = false;

        snackbar.show(err?.message || "Something went wrong.", "error");
      },
    });
  };
  // ─── Update Ticket Status ───────────────────────────────
  const updateTicketStatus = (id, payload, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const successHandler = () => {
      actionLoading.value = false;

      snackbar.show("Ticket status updated.", "success");

      // refresh detail page data
      fetchTicketDetail(id);

      // refresh listing if needed
      fetchTickets(true);

      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.PATCH, urls.platformTickets.updateStatus, {
      look_up_key: id,
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Add Attachment ────────────────────────────────────
  const addAttachment = (id, formData, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    apiRequest(urls.KEYS.POST, urls.platformTickets.attachment, {
      look_up_key: id,
      data: formData,
      isTokenRequired: true,

      onSuccess: () => {
        actionLoading.value = false;

        snackbar.show("Attachment uploaded successfully.", "success");

        // refresh detail
        fetchTicketDetail(id);

        onDone?.();
      },

      onFailure: (err) => {
        actionLoading.value = false;

        snackbar.show(err?.message || "Something went wrong.", "error");
      },
    });
  };

  // ─── Filters ───────────────────────────────────────────
  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters);
  };

  const applyFilters = () => {
    pagination.value.page = 1;
    isFetched.value = false;

    fetchTickets(true, 1);
  };

  const resetFilters = () => {
    filters.filter = "all";
    filters.status = "";
    filters.priority = "";
    filters.search = "";
    filters.sort = "desc";

    pagination.value.page = 1;
    isFetched.value = false;

    fetchTickets(true, 1);
  };

  // ─── Pagination ────────────────────────────────────────
  const changePage = (page) => {
    pagination.value.page = page;
    fetchTickets(true, page);
  };

  // ─── Reset ─────────────────────────────────────────────
  // ❌ Filters intentionally NOT reset
  // so state persists between tabs/routes
  const reset = () => {
    data.value = [];

    detail.value = null;
    detailLoading.value = false;

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };

    isLoading.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;
  };

  return {
    // state
    data,
    detail,
    pagination,
    filters,
    filterOptions,

    isLoading,
    detailLoading,
    actionLoading,
    error,
    isFetched,

    // list
    fetchTickets,
    changePage,

    // detail
    fetchTicketDetail,
    addComment,
    addAttachment,
    updateTicketStatus,


    // filters
    setFilters,
    applyFilters,
    resetFilters,

    // reset
    reset,
  };
});
