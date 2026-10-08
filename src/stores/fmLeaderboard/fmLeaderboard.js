import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useFmLeaderboardStore = defineStore("fmLeaderboard", () => {
  const data = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);
  const isSubmitting = ref(false);
  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const snackbar = useSnackbarStore();

  const currentTab = ref("real");
  const sortBy = ref(null);

  const fetchFmLeaderboard = (
    force = false,
    page = 1,
    tab = currentTab.value,
    sort = undefined
  ) => {
    let activeTabName = currentTab.value;
    if (typeof tab === "string" && (tab === "real" || tab === "dummy")) {
      activeTabName = tab;
    } else if (
      tab !== undefined &&
      tab !== null &&
      typeof tab === "string" &&
      tab !== "real" &&
      tab !== "dummy"
    ) {
      sortBy.value = tab || null;
    }

    if (sort !== undefined) {
      sortBy.value = sort || null;
    }

    const tabChanged = currentTab.value !== activeTabName;
    currentTab.value = activeTabName;

    if (isFetched.value && !force && !tabChanged) return;

    isLoading.value = true;

    const successHandler = (res) => {
      data.value = Array.isArray(res?.data) ? res.data : [];
      if (res?.pagination) {
        pagination.value = res.pagination;
      } else {
        pagination.value = {
          page: page || 1,
          per_page: pagination.value.per_page || 10,
          total_items: (res?.data || []).length,
          total_pages: 1,
        };
      }
      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;
      snackbar.show(err?.error || err?.message || "Something went wrong.", "error");
    };

    const endpoint =
      currentTab.value === "dummy" ? urls.dummyFm.list : urls.fm.list;

    const params = {
      page: page || 1,
      per_page: pagination.value.per_page || 10,
    };

    if (sortBy.value) {
      params.sort_by = sortBy.value;
    }

    apiRequest(urls.KEYS.GET, endpoint, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updateSortBy = (val) => {
    const newSortBy = val && typeof val === "object" && val.value ? val.value : val;
    sortBy.value = newSortBy || null;
    pagination.value.page = 1;
    isFetched.value = false;
    fetchFmLeaderboard(true, 1);
  };

  const updatePerPage = (newPerPage) => {
    pagination.value.per_page = Number(newPerPage);
    pagination.value.page = 1;
    isFetched.value = false;
    fetchFmLeaderboard(true, 1, currentTab.value);
  };

  const createFundManager = (formData) => {
    return new Promise((resolve) => {
      isSubmitting.value = true;

      const successHandler = () => {
        snackbar.show("Fund Manager created successfully", "success");
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true);
        resolve(true);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        snackbar.show(err?.error || err?.message || "Something went wrong.", "error");
        resolve(false);
      };

      apiRequest(urls.KEYS.POST, urls.fm.create, {
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const editFundManager = (id, formData) => {
    return new Promise((resolve) => {
      isSubmitting.value = true;

      const successHandler = () => {
        snackbar.show("Fund Manager updated successfully", "success");
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true);
        resolve(true);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        snackbar.show(
          err?.message || err?.error || "Failed to update fund manager.",
          "error",
        );
        resolve(false);
      };

      apiRequest(urls.KEYS.PATCH, urls.fm.edit, {
        look_up_key: id,
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const toggleFundManagerType = (item) => {
    return new Promise((resolve, reject) => {
      const fmId =
        item?.fm_id ||
        item?.dummy_fm?.fm_id ||
        item?.fund_manager?.id ||
        item?.id;

      if (!fmId) {
        snackbar.show("Fund Manager ID not found.", "error");
        reject(new Error("Fund Manager ID not found"));
        return;
      }

      let currentIsDummy = false;
      if (item?.dummy_fm && typeof item.dummy_fm.enabled !== "undefined") {
        currentIsDummy = Boolean(item.dummy_fm.enabled);
      } else if (typeof item?.is_dummy !== "undefined") {
        currentIsDummy = Boolean(item.is_dummy);
      } else if (typeof item?.enabled !== "undefined") {
        currentIsDummy = Boolean(item.enabled);
      }

      const targetIsDummy = !currentIsDummy;
      const endpoint = urls.dummyFm?.toggle
        ? urls.dummyFm.toggle(fmId)
        : `/dummy-fm/${fmId}`;

      apiRequest(urls.KEYS.PATCH, endpoint, {
        data: { enabled: targetIsDummy, is_dummy: targetIsDummy },
        params: { fm_id: fmId },
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(
            res?.message ||
              (targetIsDummy
                ? "Switched to Dummy Fund Manager successfully"
                : "Switched to Real Fund Manager successfully"),
            "success"
          );
          isFetched.value = false;
          fetchFmLeaderboard(true, pagination.value.page, currentTab.value);
          resolve(res);
        },
        onFailure: (err) => {
          snackbar.show(
            err?.error ||
              err?.message ||
              "Failed to toggle fund manager type.",
            "error"
          );
          reject(err);
        },
      });
    });
  };

  const createDummyFundManager = (fmId, formData) => {
    return new Promise((resolve, reject) => {
      isSubmitting.value = true;
      error.value = null;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy Fund Manager created successfully",
          "success",
        );
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true, pagination.value.page);
        resolve(res);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        error.value = err;
        snackbar.show(
          err?.error || err?.message || "Failed to create dummy fund manager.",
          "error",
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.create(fmId);

      apiRequest(urls.KEYS.POST, endpoint, {
        data: formData,
        params: { fm_id: fmId },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const editDummyFundManager = (fmId, formData) => {
    return new Promise((resolve, reject) => {
      isSubmitting.value = true;
      error.value = null;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy Fund Manager updated successfully",
          "success",
        );
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true, pagination.value.page);
        resolve(res);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        error.value = err;
        snackbar.show(
          err?.error || err?.message || "Failed to update dummy fund manager.",
          "error",
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.edit(fmId);

      apiRequest(urls.KEYS.PATCH, endpoint, {
        data: formData,
        params: { fm_id: fmId },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const deleteDummyFundManager = (fmId) => {
    return new Promise((resolve, reject) => {
      isSubmitting.value = true;
      error.value = null;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy Fund Manager deleted successfully",
          "success",
        );
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true, pagination.value.page, currentTab.value);
        resolve(res);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        error.value = err;
        snackbar.show(
          err?.error || err?.message || "Failed to delete dummy fund manager.",
          "error",
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.delete
        ? urls.dummyFm.delete(fmId)
        : `/dummy-fm/${fmId}`;

      apiRequest(urls.KEYS.DELETE, endpoint, {
        params: { fm_id: fmId },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const importDummyTrades = (fmId, file) => {
    return new Promise((resolve, reject) => {
      isSubmitting.value = true;
      error.value = null;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy trades imported successfully",
          "success",
        );
        isSubmitting.value = false;
        isFetched.value = false;
        fetchFmLeaderboard(true, pagination.value.page, currentTab.value);
        resolve(res);
      };

      const failureHandler = (err) => {
        isSubmitting.value = false;
        error.value = err;
        snackbar.show(
          err?.error || err?.message || "Failed to import dummy trades.",
          "error",
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.importTrades
        ? urls.dummyFm.importTrades(fmId)
        : `/import/dummy_trades/${fmId}`;

      const formData = new FormData();
      formData.append("file", file);

      apiRequest(urls.KEYS.POST, endpoint, {
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─── Dummy Trades State & Actions ─────────────────────────
  const dummyTrades = ref([]);
  const dummyTradesPagination = ref({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 1,
  });
  const dummyTradesLoading = ref(false);
  const dummyTradesActionLoading = ref(false);

  const fetchDummyTrades = (fmId, params = {}) => {
    return new Promise((resolve, reject) => {
      if (!fmId) {
        dummyTrades.value = [];
        return resolve([]);
      }

      dummyTradesLoading.value = true;

      const successHandler = (res) => {
        const payload = res?.data || {};
        if (Array.isArray(payload)) {
          dummyTrades.value = payload;
          dummyTradesPagination.value = {
            page: params.page || 1,
            per_page: params.per_page || 50,
            total: payload.length,
            pages: 1,
          };
        } else {
          dummyTrades.value = Array.isArray(payload.trades) ? payload.trades : [];
          dummyTradesPagination.value = {
            page: payload.page || params.page || 1,
            per_page: payload.per_page || params.per_page || 50,
            total: payload.total ?? (dummyTrades.value.length),
            pages: payload.pages || 1,
          };
        }
        dummyTradesLoading.value = false;
        resolve(dummyTrades.value);
      };

      const failureHandler = (err) => {
        dummyTradesLoading.value = false;
        snackbar.show(
          err?.error || err?.message || "Failed to fetch dummy trades.",
          "error"
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.trades(fmId);

      apiRequest(urls.KEYS.GET, endpoint, {
        params,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const updateDummyTrade = (tradeId, formData) => {
    return new Promise((resolve, reject) => {
      dummyTradesActionLoading.value = true;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy trade updated successfully",
          "success"
        );
        dummyTradesActionLoading.value = false;
        resolve(res?.data || res);
      };

      const failureHandler = (err) => {
        dummyTradesActionLoading.value = false;
        snackbar.show(
          err?.error || err?.message || "Failed to update dummy trade.",
          "error"
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.updateTrade(tradeId);

      apiRequest(urls.KEYS.PUT, endpoint, {
        data: formData,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const deleteDummyTrades = (fmId, payload = {}) => {
    return new Promise((resolve, reject) => {
      dummyTradesActionLoading.value = true;

      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Dummy trade(s) deleted successfully",
          "success"
        );
        dummyTradesActionLoading.value = false;
        resolve(res);
      };

      const failureHandler = (err) => {
        dummyTradesActionLoading.value = false;
        snackbar.show(
          err?.error || err?.message || "Failed to delete dummy trade(s).",
          "error"
        );
        reject(err);
      };

      const endpoint = urls.dummyFm.deleteTrades(fmId);

      apiRequest(urls.KEYS.DELETE, endpoint, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  const reset = () => {
    data.value = [];
    isLoading.value = false;
    error.value = null;
    isFetched.value = false;
    isSubmitting.value = false;
    sortBy.value = null;
    dummyTrades.value = [];
    dummyTradesLoading.value = false;
    dummyTradesActionLoading.value = false;
    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };
    dummyTradesPagination.value = {
      page: 1,
      per_page: 50,
      total: 0,
      pages: 1,
    };
  };

  return {
    data,
    isLoading,
    error,
    isFetched,
    isSubmitting,
    currentTab,
    pagination,
    perPageOptions,
    sortBy,
    dummyTrades,
    dummyTradesPagination,
    dummyTradesLoading,
    dummyTradesActionLoading,
    updateSortBy,
    fetchFmLeaderboard,
    updatePerPage,
    createFundManager,
    editFundManager,
    toggleFundManagerType,
    createDummyFundManager,
    editDummyFundManager,
    deleteDummyFundManager,
    importDummyTrades,
    fetchDummyTrades,
    updateDummyTrade,
    deleteDummyTrades,
    reset,
  };
});


