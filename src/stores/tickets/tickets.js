import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useTicketsStore = defineStore("tickets", () => {
  // ─── State ─────────────────────────────────────────────
  const data = ref([]);
  const isLoading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  // ✅ NEW: Ticket Detail
  const detail = ref(null);
  const detailLoading = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Helpers ───────────────────────────────────────────
  const cleanFilters = (filters = {}) =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

  // ─── Fetch List ────────────────────────────────────────
  const fetchTickets = (force = false, page = 1, filters = {}) => {
    if (isFetched.value && !force) return;

    isLoading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];
      pagination.value = res?.pagination || pagination.value;
      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.tickets.list, {
      params: {
        page,
        per_page: pagination.value.per_page,
        ...cleanFilters(filters),
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Create Ticket ─────────────────────────────────────
  const createTicket = (formData, onDone) => {
    actionLoading.value = true;

    const successHandler = () => {
      actionLoading.value = false;
      snackbar.show("Ticket created successfully.", "success");
      fetchTickets(true);
      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.tickets.create, {
      data: formData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch Ticket Detail ───────────────────────────────
  const fetchTicketDetail = (id) => {
    if (!id) return;

    detailLoading.value = true;

    const successHandler = (res) => {
      detail.value = res?.data || null;
      detailLoading.value = false;
    };

    const failureHandler = (err) => {
      detailLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.tickets.detail, {
      look_up_key: id,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Add Comment ───────────────────────────────────────
  const addComment = (id, payload, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const successHandler = () => {
      actionLoading.value = false;
      snackbar.show("Comment added.", "success");
      fetchTicketDetail(id);
      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.tickets.comment, {
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

    const successHandler = () => {
      actionLoading.value = false;
      snackbar.show("Attachment uploaded.", "success");
      fetchTicketDetail(id);
      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.tickets.attachment, {
      look_up_key: id,
      data: formData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value = [];
    isLoading.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };

    // ✅ reset detail also
    detail.value = null;
    detailLoading.value = false;
  };

  // ─── Expose ────────────────────────────────────────────
  return {
    data,
    isLoading,
    actionLoading,
    error,
    isFetched,
    pagination,

    // NEW
    detail,
    detailLoading,

    fetchTickets,
    createTicket,

    // NEW
    fetchTicketDetail,
    addComment,
    addAttachment,

    reset,
  };
});
