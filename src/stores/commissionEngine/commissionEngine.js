import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useCommissionEngineStore = defineStore("commissionEngine", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  // Referral link search results: { q, total, items: [...] }
  const referralLinks = ref([]);
  const referralLinksTotal = ref(0);
  const selectedReferralLink = ref(null);

  // Rate Matrix Data: { referral_link_id, referral_link_code, referral_link_name, ib_id, method, methods, symbol_groups, tabs, ... }
  const rateGrid = ref(null);
  const activeGroupConfigId = ref(null);

  // Symbol Groups: [ { id, name, code, sort_order, is_active, member_count }, ... ]
  const symbolGroups = ref([]);
  const activeSymbolGroup = ref(null);
  const symbolGroupMembers = ref([]);

  // Symbols Catalog: { total, page, per_page, items: [...] }
  const symbolsList = ref([]);
  const symbolsPagination = ref({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 1,
  });

  // Sync Status: { configured, deals_table, sync_interval_seconds, cursor, totals, ... }
  const syncStatus = ref(null);

  // Workflow Settings: { auto_wallet_credit, commission_workflow_balance_approval, mode, description, ... }
  const workflowSettings = ref(null);

  // Open / Closed Trades: { total, page, per_page, items: [...] }
  const tradesList = ref([]);
  const tradesPagination = ref({
    page: 1,
    per_page: 50,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // Pending / Commissions: { total, page, per_page, items: [...] }
  const commissionsList = ref([]);
  const commissionsPagination = ref({
    page: 1,
    per_page: 50,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // ─── 2. In-Flight Tracking (Prevents Parallel Duplicate Requests) ─
  const inFlight = {
    referralLinks: false,
    rateGrid: false,
    symbolGroups: false,
    symbolGroupMembers: false,
    symbolsList: false,
    syncStatus: false,
    workflowSettings: false,
    tradesList: false,
    commissionsList: false,
  };

  // ─── 3. isFetched Tracking (Prevents Redundant API Calls) ─
  const isFetched = ref({
    referralLinks: false,
    rateGrid: false,
    symbolGroups: false,
    symbolGroupMembers: false,
    symbolsList: false,
    syncStatus: false,
    workflowSettings: false,
    tradesList: false,
    commissionsList: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const ratesLoading = ref(false);
  const searchLoading = ref(false);
  const syncLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      referralLinks: false,
      rateGrid: false,
      symbolGroups: false,
      symbolGroupMembers: false,
      symbolsList: false,
      syncStatus: false,
      workflowSettings: false,
      tradesList: false,
      commissionsList: false,
    };
  };

  // ─── 6. Referral Links Search Action ───────────────────
  const searchReferralLinks = (params = {}, force = false) => {
    if (inFlight.referralLinks) return;
    const isDefault = !params.q && (!params.limit || params.limit === 20);
    if (isFetched.value.referralLinks && !force && isDefault) return;

    inFlight.referralLinks = true;
    searchLoading.value = true;
    error.value = null;

    const queryParams = {
      q: params.q !== undefined ? params.q : "",
      limit: params.limit || 20,
      active_only: params.active_only !== undefined ? params.active_only : true,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        referralLinks.value = Array.isArray(res.data.items) ? res.data.items : [];
        referralLinksTotal.value = res.data.total || referralLinks.value.length;
      } else if (Array.isArray(res?.data)) {
        referralLinks.value = res.data;
        referralLinksTotal.value = res.data.length;
      } else {
        referralLinks.value = [];
        referralLinksTotal.value = 0;
      }
      if (isDefault) {
        isFetched.value.referralLinks = true;
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to search referral links";
      snackbar.show(err?.message || "Failed to search referral links", "error");
    };

    const finallyHandler = () => {
      inFlight.referralLinks = false;
      searchLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.referralLinksSearch, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 7. Rate Grid Fetch Action ─────────────────────────
  const fetchRateGrid = (referralLinkId, method = "per_lot", force = false) => {
    if (!referralLinkId) return;
    if (inFlight.rateGrid) return;

    inFlight.rateGrid = true;
    ratesLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      rateGrid.value = res?.data || null;
      isFetched.value.rateGrid = true;

      // Select first tab if current active tab is not in returned tabs
      if (rateGrid.value?.tabs?.length) {
        const hasActive = rateGrid.value.tabs.some(
          (t) => t.broker_group_config_id === activeGroupConfigId.value
        );
        if (!hasActive || !activeGroupConfigId.value) {
          activeGroupConfigId.value = rateGrid.value.tabs[0].broker_group_config_id;
        }
      } else {
        activeGroupConfigId.value = null;
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load rate matrix";
      snackbar.show(err?.message || "Failed to load rate matrix", "error");
    };

    const finallyHandler = () => {
      inFlight.rateGrid = false;
      ratesLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.rates(referralLinkId), {
      params: { method },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 8. Save Rate Matrix (One Tab) ─────────────────────
  const saveRates = (referralLinkId, payload) => {
    if (!referralLinkId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      const msg = res?.message || "Commission rates saved successfully";
      snackbar.show(msg, "success");
      // Re-fetch rates matrix to guarantee data consistency
      const activeMethod = payload?.method || rateGrid.value?.method || "per_lot";
      fetchRateGrid(referralLinkId, activeMethod, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to save commission rates", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.saveRates(referralLinkId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 9. Symbol Groups Actions ──────────────────────────
  const fetchSymbolGroups = (params = { active_only: false }, force = false) => {
    if (inFlight.symbolGroups) return;
    if (isFetched.value.symbolGroups && !force) return;

    inFlight.symbolGroups = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      symbolGroups.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.symbolGroups = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch symbol groups";
      snackbar.show(err?.message || "Failed to fetch symbol groups", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolGroups = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.symbolGroups, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createSymbolGroup = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbol group created successfully", "success");
      fetchSymbolGroups({ active_only: false }, true);
      // Invalidate symbols cache because mapping might have changed
      isFetched.value.symbolsList = false;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.symbolGroups, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateSymbolGroup = (groupId, payload) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbol group updated successfully", "success");
      fetchSymbolGroups({ active_only: false }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.symbolGroupDetail(groupId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const deleteSymbolGroup = (groupId) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbol group deleted successfully", "success");
      fetchSymbolGroups({ active_only: false }, true);
      isFetched.value.symbolsList = false;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to delete symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.DELETE, urls.ibCommission.symbolGroupDetail(groupId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 10. Symbol Group Members Actions ──────────────────
  const fetchSymbolGroupMembers = (groupId, force = false) => {
    if (!groupId) return;
    if (inFlight.symbolGroupMembers) return;

    inFlight.symbolGroupMembers = true;
    loading.value = true;

    const successHandler = (res) => {
      symbolGroupMembers.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.symbolGroupMembers = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch group members", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolGroupMembers = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.symbolGroupMembers(groupId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const assignSymbolsToGroup = (groupId, payload) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbols assigned successfully", "success");
      fetchSymbolGroupMembers(groupId, true);
      fetchSymbolGroups({ active_only: false }, true);
      fetchSymbols({ page: symbolsPagination.value.page, per_page: symbolsPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to assign symbols", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.symbolGroupMembers(groupId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const unassignSymbols = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbols unassigned successfully", "success");
      fetchSymbolGroups({ active_only: false }, true);
      fetchSymbols({ page: symbolsPagination.value.page, per_page: symbolsPagination.value.per_page }, true);
      if (activeSymbolGroup.value?.id) {
        fetchSymbolGroupMembers(activeSymbolGroup.value.id, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to unassign symbols", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.symbolGroupsUnassign, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 11. Symbols Catalog Actions ───────────────────────
  const fetchSymbols = (params = {}, force = false) => {
    if (inFlight.symbolsList) return;
    const isDefault = !params.q && !params.unmapped_only && (!params.page || params.page === 1);
    if (isFetched.value.symbolsList && !force && isDefault) return;

    inFlight.symbolsList = true;
    loading.value = true;

    const queryParams = {
      q: params.q || undefined,
      unmapped_only: params.unmapped_only !== undefined ? params.unmapped_only : false,
      page: params.page || 1,
      per_page: params.per_page || 50,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total = res.data.total !== undefined ? res.data.total : symbolsList.value.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        symbolsList.value = Array.isArray(res.data.items) ? res.data.items : [];
        symbolsPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        symbolsList.value = res.data;
        symbolsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        symbolsList.value = [];
        symbolsPagination.value = {
          page: 1,
          per_page: 50,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.symbolsList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch symbols catalog", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolsList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.symbols, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 12. Sync Actions ──────────────────────────────────
  const fetchSyncStatus = (force = false) => {
    if (inFlight.syncStatus) return;
    if (isFetched.value.syncStatus && !force) return;

    inFlight.syncStatus = true;
    syncLoading.value = true;

    const successHandler = (res) => {
      syncStatus.value = res?.data || null;
      isFetched.value.syncStatus = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch sync status", "error");
    };

    const finallyHandler = () => {
      inFlight.syncStatus = false;
      syncLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.syncStatus, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const triggerDealsSync = () => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Deals sync triggered successfully", "success");
      fetchSyncStatus(true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to trigger deals sync", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.syncDeals, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 13. Workflow Settings Actions ─────────────────────
  const fetchWorkflowSettings = (force = false) => {
    if (inFlight.workflowSettings) return;
    if (isFetched.value.workflowSettings && !force) return;

    inFlight.workflowSettings = true;
    error.value = null;

    const successHandler = (res) => {
      workflowSettings.value = res?.data || null;
      isFetched.value.workflowSettings = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch commission workflow settings", "error");
    };

    const finallyHandler = () => {
      inFlight.workflowSettings = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.workflowSettings, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateWorkflowSettings = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      workflowSettings.value = res?.data || null;
      const isAuto = res?.data?.auto_wallet_credit;
      snackbar.show(
        res?.message ||
          (isAuto
            ? "Workflow updated: Auto wallet credit enabled (no pending approval required)"
            : "Workflow updated: Commissions will require admin approval before crediting wallet"),
        "success"
      );
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update workflow settings", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.workflowSettings, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 14. Open / Closed Trades Actions ──────────────────
  const fetchTrades = (params = {}, force = false) => {
    if (inFlight.tradesList) return;
    const isDefault =
      !params.status &&
      !params.login &&
      !params.ib_id &&
      !params.symbol &&
      !params.date_from &&
      !params.date_to &&
      (!params.page || params.page === 1);

    if (isFetched.value.tradesList && !force && isDefault) return;

    inFlight.tradesList = true;
    loading.value = true;

    const queryParams = {
      status: params.status || undefined,
      login: params.login || undefined,
      ib_id: params.ib_id || undefined,
      symbol: params.symbol || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      date_field: params.date_field || "close_time",
      page: params.page || 1,
      per_page: params.per_page || 50,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total = res.data.total !== undefined ? res.data.total : res.data.items.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        tradesList.value = Array.isArray(res.data.items) ? res.data.items : [];
        tradesPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        tradesList.value = res.data;
        tradesPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        tradesList.value = [];
        tradesPagination.value = {
          page: 1,
          per_page: 50,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.tradesList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch trades", "error");
    };

    const finallyHandler = () => {
      inFlight.tradesList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.trades, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const rebuildTrades = (payload = { limit: 2000 }) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const d = res?.data || {};
      snackbar.show(
        res?.message ||
          `Trades rebuilt: ${d.positions ?? 0} positions, ${d.upserted ?? 0} upserted, ${d.closed ?? 0} closed.`,
        "success"
      );
      fetchTrades({ page: tradesPagination.value.page, per_page: tradesPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to rebuild trades", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.rebuildTrades, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 15. Pending / Commissions Actions ─────────────────
  const fetchCommissions = (params = {}, force = false) => {
    if (inFlight.commissionsList) return;
    const isDefault =
      !params.status &&
      !params.login &&
      !params.ib_id &&
      !params.trade_id &&
      !params.symbol &&
      !params.date_from &&
      !params.date_to &&
      (!params.page || params.page === 1);

    if (isFetched.value.commissionsList && !force && isDefault) return;

    inFlight.commissionsList = true;
    loading.value = true;

    const queryParams = {
      status: params.status || undefined,
      ib_id: params.ib_id || undefined,
      login: params.login || undefined,
      trade_id: params.trade_id || undefined,
      symbol: params.symbol || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      date_field: params.date_field || "created_at",
      page: params.page || 1,
      per_page: params.per_page || 50,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total = res.data.total !== undefined ? res.data.total : res.data.items.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        commissionsList.value = Array.isArray(res.data.items) ? res.data.items : [];
        commissionsPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        commissionsList.value = res.data;
        commissionsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        commissionsList.value = [];
        commissionsPagination.value = {
          page: 1,
          per_page: 50,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.commissionsList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch commissions", "error");
    };

    const finallyHandler = () => {
      inFlight.commissionsList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.commissions, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const calculateCommissions = (payload = { limit: 500, login: null, reclaim_skipped: true }) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const d = res?.data || {};
      if (d.mode === "auto_wallet" || d.auto_wallet_credit) {
        snackbar.show(
          res?.message ||
            `Calculated ${d.trades_processed ?? 0} trades. ${d.auto_wallet_credited ?? 0} commissions credited directly to IB wallet!`,
          "success"
        );
      } else {
        snackbar.show(
          res?.message ||
            `Calculated ${d.trades_processed ?? 0} trades. ${d.pending_entries ?? 0} pending commissions created awaiting admin approval.`,
          "success"
        );
      }
      fetchCommissions({ page: commissionsPagination.value.page, per_page: commissionsPagination.value.per_page }, true);
      fetchTrades({ page: tradesPagination.value.page, per_page: tradesPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to calculate commissions", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.calculateCommissions, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const approveCommission = (id) => {
    if (!id) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || `Commission #${id} approved and wallet credited successfully.`, "success");
      fetchCommissions({ page: commissionsPagination.value.page, per_page: commissionsPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || `Failed to approve commission #${id}`, "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.approveCommission(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const rejectCommission = (id, reason = "") => {
    if (!id) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || `Commission #${id} rejected successfully.`, "success");
      fetchCommissions({ page: commissionsPagination.value.page, per_page: commissionsPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || `Failed to reject commission #${id}`, "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.rejectCommission(id), {
      data: { reason: reason || undefined },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const bulkApproveCommissions = (ids = []) => {
    if (!ids || ids.length === 0) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      const appCount = res?.data?.approved?.length ?? ids.length;
      const failCount = res?.data?.failed?.length ?? 0;
      snackbar.show(
        res?.message ||
          `Bulk approval complete: ${appCount} approved successfully${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        "success"
      );
      fetchCommissions({ page: commissionsPagination.value.page, per_page: commissionsPagination.value.per_page }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to bulk approve commissions", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.bulkApproveCommissions, {
      data: { ids },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  return {
    // State
    referralLinks,
    referralLinksTotal,
    selectedReferralLink,
    rateGrid,
    activeGroupConfigId,
    symbolGroups,
    activeSymbolGroup,
    symbolGroupMembers,
    symbolsList,
    symbolsPagination,
    syncStatus,
    workflowSettings,
    tradesList,
    tradesPagination,
    commissionsList,
    commissionsPagination,

    // Loading & tracking
    inFlight,
    isFetched,
    loading,
    actionLoading,
    ratesLoading,
    searchLoading,
    syncLoading,
    error,

    // Actions
    resetFetchedFlags,
    searchReferralLinks,
    fetchRateGrid,
    saveRates,
    fetchSymbolGroups,
    createSymbolGroup,
    updateSymbolGroup,
    deleteSymbolGroup,
    fetchSymbolGroupMembers,
    assignSymbolsToGroup,
    unassignSymbols,
    fetchSymbols,
    fetchSyncStatus,
    triggerDealsSync,
    triggerSymbolsSync,
    fetchWorkflowSettings,
    updateWorkflowSettings,
    fetchTrades,
    rebuildTrades,
    fetchCommissions,
    calculateCommissions,
    approveCommission,
    rejectCommission,
    bulkApproveCommissions,
  };
});
