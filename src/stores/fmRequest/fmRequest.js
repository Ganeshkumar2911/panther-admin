// /stores/fmRequest/fmRequest.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useFmRequestStore = defineStore("fmRequest", () => {
  const data = ref([]);
  const filters = ref({});
  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const search = ref("");
  let debounceTimer = null;

  const isLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);
  const isSubmitting = ref(false);

  const snackbar = useSnackbarStore();

  const fetchFmRequests = (
    force = false,
    page = 1,
    status = null,
    searchQuery = "",
  ) => {
    if (isFetched.value && !force) return;

    isLoading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];
      filters.value = res?.filters || {};
      pagination.value = res?.pagination || pagination.value;

      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;
      snackbar.show(err?.error || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.fm.requestList, {
      params: {
        page,
        per_page: pagination.value.per_page,
        status,
        search: searchQuery,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Replace acceptRequest with this
  const acceptRequest = (id, formData, message = null) => {
    isSubmitting.value = true;

    const successHandler = () => {
      snackbar.show("Request accepted", "success");
      isSubmitting.value = false;
      fetchFmRequests(true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.error || "Something went wrong.", "error");
      isSubmitting.value = false;
    };

    // Build payload: include all form data even if empty
    const payload = {
      ...formData,
    };
    
    // Only add message if it exists
    if (message) {
      payload.message = message;
    }

    apiRequest("post", urls.fm.acceptRequest, {
      look_up_key: id,
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const rejectRequest = (id, reason) => {
    isSubmitting.value = true;

    const successHandler = () => {
      snackbar.show("Request rejected", "success");
      isSubmitting.value = false;
      fetchFmRequests(true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.error || "Something went wrong.", "error");
      isSubmitting.value = false;
    };

    apiRequest("post", urls.fm.rejectRequest, {
      look_up_key: id,
      data: {
        reason,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const setSearch = (val, status = null) => {
    search.value = val;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      isFetched.value = false;
      fetchFmRequests(true, 1, status, search.value);
    }, 400);
  };

  const reset = () => {
    data.value = [];
    filters.value = {};
    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };
    search.value = "";
    isLoading.value = false;
    error.value = null;
    isFetched.value = false;
    isSubmitting.value = false;
  };

  return {
    data,
    filters,
    pagination,
    search,
    isLoading,
    error,
    isFetched,
    isSubmitting,
    fetchFmRequests,
    setSearch,
    reset,
    acceptRequest,
    rejectRequest,
  };
});
