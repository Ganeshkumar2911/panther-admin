// stores/clientList/clientList.js
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { downloadFile } from "@/utils/downloadFile";

export const useClientListStore = defineStore("clientList", () => {
  const data = ref([]);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const filters = reactive({
    search: "",
    ib_id: "",
    user_type: "client",
    user_status: "active",
  });

  const perPageOptions = [
    { label: "10", value: 10 },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
  ];

  const userType = [
    { label: "Client", value: "client" },
    { label: "IB", value: "ib" },
    { label: "FM", value: "fm" },
  ];

  const userStatus = [
    { label: "Active", value: "active" },
    { label: "In Active", value: "inactive" },
  ];

  const ibOptions = ref([]);
  const searchLoading = ref(false);

  const isLoading = ref(false);
  const error = ref(null);
  const isExporting = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Build Params ──────────────────────────────────
  const buildParams = (page = 1) => {
    const params = {
      page,
      per_page: pagination.value.per_page,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.ib_id) {
      params.ib_id = filters.ib_id;
    }

    if (filters.user_type) {
      params.user_type = filters.user_type;
    }

    if (filters.user_status) {
      params.user_status = filters.user_status;
    }

    return params;
  };

  // ─── Fetch Clients ─────────────────────────────────
  const fetchClients = (page = pagination.value.page || 1) => {
    isLoading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];

      pagination.value = res?.pagination || pagination.value;

      isLoading.value = false;
    };

    const failureHandler = (err) => {
      isLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch clients.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.clientList.list, {
      params: buildParams(page),

      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Search IBs ────────────────────────────────────
  const searchIbs = (query = "") => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      ibOptions.value = [];
      searchLoading.value = false;

      return Promise.resolve([]);
    }

    searchLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const options = (res?.data || []).map((ib) => ({
          label:
            ib.label_name ??
            ib.name ??
            ib.ib_name ??
            ib.email ??
            `IB ${ib.ib_id ?? ib.id}`,

          value: ib.user_id ?? ib.ib_id ?? ib.id,

          email: ib.email,
        }));

        ibOptions.value = options;

        searchLoading.value = false;

        resolve(options);
      };

      const failureHandler = (err) => {
        ibOptions.value = [];

        searchLoading.value = false;

        snackbar.show(err?.message || "Failed to fetch IBs.", "error");

        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
        params: {
          search: searchQuery,
        },

        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─── Filters ───────────────────────────────────────
  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters);
  };

  const applyFilters = () => {
    pagination.value.page = 1;

    fetchClients(1);
  };

  const resetFilters = () => {
    filters.search = "";
    filters.ib_id = "";

    ibOptions.value = [];

    applyFilters();
  };

  // ─── Reset ─────────────────────────────────────────
  const reset = () => {
    data.value = [];

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };

    filters.search = "";
    filters.ib_id = "";

    ibOptions.value = [];

    searchLoading.value = false;

    isLoading.value = false;
    error.value = null;
  };

  const exportClients = () => {
    isExporting.value = true;

    apiRequest(urls.KEYS.GET, urls.clientList.export, {
      params: {
        status: filters.user_status,
        client_type: filters.user_type,
      },

      isTokenRequired: true,

      onSuccess: (res) => {
        const downloaded = downloadFile(res?.download_url);
        if (!downloaded) {
          snackbar.show("Download URL not found.", "error");
          return;
        }

        snackbar.show(
          res?.message || "Export completed successfully.",
          "success",
        );
      },

      onFailure: (err) => {
        snackbar.show(
          err?.message || "Failed to export admin ledger.",
          "error",
        );
      },

      onFinally: () => {
        isExporting.value = false;
      },
    });
  };

  const updatePerPage = (newPerPage) => {
    pagination.value.per_page = newPerPage;
    pagination.value.page = 1;
    fetchClients(1);
  };

  return {
    data,

    pagination,
    filters,

    perPageOptions,
    ibOptions,
    searchLoading,
    userType,
    userStatus,

    isLoading,
    error,

    fetchClients,
    updatePerPage,

    searchIbs,

    setFilters,
    applyFilters,
    resetFilters,

    reset,
    exportClients,
  };
});
