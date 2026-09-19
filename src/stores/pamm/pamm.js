import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const usePAMMStore = defineStore("pamm", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State ────────────
  const pamms = ref([]);
  const activePAMM = ref(null);
  const activeParticipants = ref([]);
  const pendingWithdrawals = ref([]);
  const accountingEntries = ref([]);
  const trades = ref([]);
  const activeTrade = ref(null);
  const tradeAllocations = ref([]);
  const reconcileReport = ref(null);

  // Pagination for lists (defaults, as PAMM doesn't have cursor pagination yet but capped to 200)
  const pagination = ref({
    page: 1,
    per_page: 200,
    total: 0,
    pages: 1,
  });

  // ─── 2. In-Flight Tracking ─
  const inFlight = {
    pamms: false,
    activePAMM: false,
    pendingWithdrawals: false,
    accountingEntries: false,
    trades: false,
    tradeAllocations: false,
    reconcile: false,
  };

  // ─── 3. isFetched Tracking ─
  const isFetched = ref({
    pamms: false,
    activePAMM: false,
    pendingWithdrawals: false,
    accountingEntries: false,
    trades: false,
    tradeAllocations: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      pamms: false,
      activePAMM: false,
      pendingWithdrawals: false,
      accountingEntries: false,
      trades: false,
      tradeAllocations: false,
    };
  };

  // ─── Fetch Actions ──────────────────────────────────────

  const fetchPAMMs = (params = {}, force = false) => {
    if (inFlight.pamms) return;
    if (isFetched.value.pamms && !force) return;

    inFlight.pamms = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      pamms.value = Array.isArray(res?.data) ? res.data : [];
      if (res?.pagination) {
        pagination.value = res.pagination;
      }
      isFetched.value.pamms = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch PAMMs";
      snackbar.show(err?.message || "Failed to fetch PAMMs", "error");
    };

    const finallyHandler = () => {
      inFlight.pamms = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchPAMMDetail = (id, force = false) => {
    if (inFlight.activePAMM) return;
    if (isFetched.value.activePAMM && activePAMM.value?.id === Number(id) && !force) return;

    inFlight.activePAMM = true;
    detailLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      activePAMM.value = res?.data?.pamm || null;
      activeParticipants.value = Array.isArray(res?.data?.participants) ? res.data.participants : [];
      isFetched.value.activePAMM = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch PAMM details";
      snackbar.show(err?.message || "Failed to fetch PAMM details", "error");
    };

    const finallyHandler = () => {
      inFlight.activePAMM = false;
      detailLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.detail(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchPendingWithdrawals = (id, force = false) => {
    if (inFlight.pendingWithdrawals) return;
    if (isFetched.value.pendingWithdrawals && !force) return;

    inFlight.pendingWithdrawals = true;
    loading.value = true;

    const successHandler = (res) => {
      pendingWithdrawals.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.pendingWithdrawals = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch pending withdrawals", "error");
    };

    const finallyHandler = () => {
      inFlight.pendingWithdrawals = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.pendingWithdrawals(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchAccountingEntries = (id, force = false) => {
    if (inFlight.accountingEntries) return;
    if (isFetched.value.accountingEntries && !force) return;

    inFlight.accountingEntries = true;
    loading.value = true;

    const successHandler = (res) => {
      accountingEntries.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.accountingEntries = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch accounting entries", "error");
    };

    const finallyHandler = () => {
      inFlight.accountingEntries = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.accountingEntries(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchTrades = (id, force = false) => {
    if (inFlight.trades) return;
    if (isFetched.value.trades && !force) return;

    inFlight.trades = true;
    loading.value = true;

    const successHandler = (res) => {
      trades.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.trades = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch pool trades", "error");
    };

    const finallyHandler = () => {
      inFlight.trades = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.trades(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchTradeAllocations = (pammId, tradeId, force = false) => {
    if (inFlight.tradeAllocations) return;
    if (isFetched.value.tradeAllocations && activeTrade.value?.id === tradeId && !force) return;

    inFlight.tradeAllocations = true;
    detailLoading.value = true;

    const successHandler = (res) => {
      activeTrade.value = res?.data?.trade || null;
      tradeAllocations.value = Array.isArray(res?.data?.allocations) ? res.data.allocations : [];
      isFetched.value.tradeAllocations = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch trade allocations", "error");
    };

    const finallyHandler = () => {
      inFlight.tradeAllocations = false;
      detailLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.pamm.tradeAllocations(pammId, tradeId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Mutation Actions ───────────────────────────────────

  const approveWithdrawal = (opId, pammId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Withdrawal approved successfully", "success");
      fetchPendingWithdrawals(pammId, true); // force refresh
      fetchPAMMDetail(pammId, true); // force refresh active PAMM / participants
      fetchAccountingEntries(pammId, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to approve withdrawal", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.pamm.approveWithdrawal(opId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const rejectWithdrawal = (opId, pammId, rejectReason) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Withdrawal rejected", "success");
      fetchPendingWithdrawals(pammId, true); // force refresh
      fetchPAMMDetail(pammId, true); // force refresh active PAMM
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to reject withdrawal", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.pamm.rejectWithdrawal(opId), {
      data: { reject_reason: rejectReason },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const reconcilePAMM = (id) => {
    if (inFlight.reconcile) return;
    inFlight.reconcile = true;
    actionLoading.value = true;
    reconcileReport.value = null;

    const successHandler = (res) => {
      reconcileReport.value = res?.data || null;
      snackbar.show("Reconciliation completed", "success");
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to reconcile PAMM", "error");
    };

    const finallyHandler = () => {
      inFlight.reconcile = false;
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.pamm.reconcile(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const runSettlement = (id, settlementKey = null) => {
    actionLoading.value = true;

    const data = {};
    if (settlementKey) {
      data.settlement_key = settlementKey;
    }

    const successHandler = (res) => {
      snackbar.show(res?.message || "Settlement triggered successfully", "success");
      fetchPAMMDetail(id, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to run settlement", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.pamm.settlements(id), {
      data,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  return {
    // State
    pamms,
    activePAMM,
    activeParticipants,
    pendingWithdrawals,
    accountingEntries,
    trades,
    activeTrade,
    tradeAllocations,
    reconcileReport,
    pagination,
    loading,
    actionLoading,
    detailLoading,
    error,
    // Actions
    resetFetchedFlags,
    fetchPAMMs,
    fetchPAMMDetail,
    fetchPendingWithdrawals,
    fetchAccountingEntries,
    fetchTrades,
    fetchTradeAllocations,
    approveWithdrawal,
    rejectWithdrawal,
    reconcilePAMM,
    runSettlement,
  };
});
