import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useAccountsStore = defineStore("accounts", () => {
  const clientTypes = [
    { label: "Client", value: "client" },
    { label: "IB", value: "ib" },
    { label: "FM", value: "fm" },
  ];

  const accountStatus = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  const snackbar = useSnackbarStore();

  const data = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const isExporting = ref(false);

  const summary = ref({
    total_accounts: 0,
    total_balance: 0,
    total_pnl: 0,
  });

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const filters = reactive({
    account_type: "all",
    trading_type: "all",
    account_subtype: "all",
    search_query: "",
    client_type: "client",
    status: "active",
  });

  const activeType = computed(() => filters.account_type);

  const exportAccounts = () => {
    isExporting.value = true;

    apiRequest("get", urls.tradingAccounts.export, {
      params: {
        client_type: filters.client_type,
        status: filters.status,
        ...(filters.account_type !== "all"
          ? { account_type: filters.account_type }
          : {}),
        ...(filters.trading_type !== "all"
          ? { trading_type: filters.trading_type }
          : {}),
        ...(filters.account_subtype !== "all"
          ? { account_subtype: filters.account_subtype }
          : {}),
        ...(filters.search_query?.trim()
          ? { search_query: filters.search_query.trim() }
          : {}),
      },

      responseType: "blob",
      isTokenRequired: true,

      onSuccess: (res) => {
        const blob = new Blob([res], {
          type: "text/csv",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "trading-accounts.csv";
        link.click();

        window.URL.revokeObjectURL(url);
      },

      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to export accounts.", "error");
      },

      onFinally: () => {
        isExporting.value = false;
      },
    });
  };

  const fetchAccounts = () => {
    loading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];

      if (res?.pagination) {
        const currentPerPage = pagination.per_page;
        Object.assign(pagination, res.pagination);
        if (!pagination.per_page) {
          pagination.per_page = Number(currentPerPage) || 10;
        } else {
          pagination.per_page = Number(pagination.per_page);
        }
      }

      if (res?.summary) {
        summary.value = res.summary;
      }

      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch accounts", "error");
    };

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...(filters.account_type !== "all"
        ? { account_type: filters.account_type }
        : {}),
      ...(filters.trading_type !== "all"
        ? { trading_type: filters.trading_type }
        : {}),
      ...(filters.account_subtype !== "all"
        ? { account_subtype: filters.account_subtype }
        : {}),
      ...(filters.search_query?.trim()
        ? { search_query: filters.search_query.trim() }
        : {}),
    };

    apiRequest("get", urls.tradingAccounts.list, {
      params,
      isTokenRequired: true,
      cancelPrevious: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const setType = (type) => {
    filters.account_type = type;
    pagination.page = 1;
    fetchAccounts();
  };

  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters);
    pagination.page = 1;
    fetchAccounts();
  };

  const setPage = (page) => {
    pagination.page = page;
    fetchAccounts();
  };

  const reset = () => {
    data.value = [];
    loading.value = false;
    error.value = null;

    summary.value = {
      total_accounts: 0,
      total_balance: 0,
      total_pnl: 0,
    };

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    });

    filters.account_type = "all";
    filters.trading_type = "all";
    filters.account_subtype = "all";
    filters.search_query = "";
  };

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage);
    pagination.page = 1;
    fetchAccounts();
  };

  return {
    data,
    loading,
    error,
    pagination,
    summary,
    filters,
    activeType,
    perPageOptions,
    isExporting,
    clientTypes,
    accountStatus,

    fetchAccounts,
    setType,
    setFilters,
    setPage,
    updatePerPage,
    reset,

    exportAccounts,
  };
});
