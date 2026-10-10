import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const usePAMMSettlementStore = defineStore("pammSettlement", () => {
  const snackbar = useSnackbarStore();

  const settlements = ref([]);
  const activeSettlement = ref(null);
  
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);
  
  const activeRunController = ref(null);

  const fetchSettlements = (pammId, params = {}, force = false) => {
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      settlements.value = Array.isArray(res?.data) ? res.data : [];
      if (res?.pagination) {
        pagination.value = res.pagination;
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch settlements";
      snackbar.show(err?.message || "Failed to fetch settlements", "error");
    };

    const finallyHandler = () => {
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pammSettlement.list(pammId), {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchSettlementDetail = (pammId, settlementId) => {
    detailLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      activeSettlement.value = res?.data || null;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch settlement details";
      snackbar.show(err?.message || "Failed to fetch settlement details", "error");
    };

    const finallyHandler = () => {
      detailLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pammSettlement.detail(pammId, settlementId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const runSettlement = (pammId, settlementKey = null) => {
    actionLoading.value = true;
    activeRunController.value = new AbortController();

    const data = {};
    if (settlementKey) {
      data.settlement_key = settlementKey;
    }

    const successHandler = (res) => {
      snackbar.show(res?.message || "Settlement triggered successfully", "success");
      fetchSettlements(pammId, { page: 1, per_page: pagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      if (err.code !== "ERR_CANCELED" && err.name !== "CanceledError") {
        snackbar.show(err?.message || "Failed to run settlement", "error");
      }
    };

    const finallyHandler = () => {
      actionLoading.value = false;
      activeRunController.value = null;
    };

    return apiRequest(urls.KEYS.POST, urls.pammSettlement.run(pammId), {
      data,
      isTokenRequired: true,
      signal: activeRunController.value.signal,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const runAllSettlements = (prefix = null) => {
    actionLoading.value = true;
    return new Promise((resolve, reject) => {
      const data = {};
      if (prefix) {
        data.settlement_key_prefix = prefix;
      }

      const successHandler = (res) => {
        snackbar.show(res?.message || "Run all active PAMMs settlements initiated", "success");
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to run all settlements", "error");
        reject(err);
      };

      const finallyHandler = () => {
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.pammSettlement.runAll, {
        data,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  const rerunParticipant = (pammId, settlementId, participantId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Participant checkpoint refreshed", "success");
      // Optionally update local state
      if (activeSettlement.value && activeSettlement.value.batches) {
        for (let batch of activeSettlement.value.batches) {
          const pIndex = batch.participants.findIndex((p) => p.participant_id === participantId);
          if (pIndex !== -1) {
             batch.participants[pIndex] = res.data.participant;
             break;
          }
        }
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to rerun participant checkpoint", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.pammSettlement.rerunParticipant(pammId, settlementId, participantId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const cancelRunSettlement = () => {
    if (activeRunController.value) {
      activeRunController.value.abort();
      activeRunController.value = null;
    }
  };

  return {
    settlements,
    activeSettlement,
    pagination,
    loading,
    actionLoading,
    detailLoading,
    error,
    fetchSettlements,
    fetchSettlementDetail,
    runSettlement,
    runAllSettlements,
    rerunParticipant,
    cancelRunSettlement,
  };
});
