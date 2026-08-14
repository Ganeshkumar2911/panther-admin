import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useFmTradeBookStore = defineStore("fmTradeBook", () => {
  const snackbar = useSnackbarStore();

  // Context & Mode
  const mode = ref("fm"); // 'fm' | 'follower'
  const contextId = ref(null);
  const accountInfo = ref(null);
  const activeTab = ref("positions"); // 'positions' | 'orders' | 'deals'

  // Tab Data Lists
  const positions = ref([]);
  const orders = ref([]);
  const deals = ref([]);

  // Summary Metrics
  const summary = ref({
    open_positions: 0,
    closed_positions: 0,
    total_positions: 0,
    total_orders: 0,
    total_deals: 0,
    total_lot: 0,
    total_volume: 0,
    total_pnl: 0,
    floating_pnl: 0,
    realized_pnl: 0,
  });

  // Filter options from backend
  const availableFilters = ref({
    symbols: [],
    types: [],
    statuses: [],
    accounts: [],
  });

  // Pagination
  const pagination = ref({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  // Filter State
  const filters = reactive({
    search: "",
    status: "",
    type: "",
    symbol: "",
    start_date: "",
    end_date: "",
    from_date: "",
    to_date: "",
    sort_by: "",
    sort_order: "desc",
  });

  const isLoading = ref(false);
  const isRefreshing = ref(false);
  const followerLoading = ref(false);

  // Set context before fetching
  const setContext = ({ type = "fm", id = null, info = null }) => {
    mode.value = type;
    contextId.value = id;
    if (info) accountInfo.value = info;
  };

  // Fetch Follower specifics if needed
  const fetchFollowerInfo = async (followerId) => {
    if (!followerId) return;
    followerLoading.value = true;
    try {
      const endpoint = `${urls.tradeBook.followerDetails}${followerId}`;
      const res = await apiRequest(urls.KEYS.GET, endpoint, {
        isTokenRequired: true,
      });
      if (res?.data) {
        accountInfo.value = res.data;
      }
    } catch (err) {
      console.warn("Follower trade book details fallback:", err);
    } finally {
      followerLoading.value = false;
    }
  };

  // Fetch Filter Metadata
  const fetchFilters = async () => {
    try {
      const res = await apiRequest(urls.KEYS.GET, urls.tradeBook.filters, {
        isTokenRequired: true,
      });
      if (res?.data) {
        availableFilters.value = {
          symbols: res.data.symbols || [],
          types: res.data.types || [],
          statuses: res.data.statuses || [],
          accounts: res.data.accounts || [],
        };
      }
    } catch (err) {
      console.warn("Could not load trade book filter options:", err);
    }
  };

  // Build Request Parameters
  const buildParams = () => {
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      sort_by: filters.sort_by || undefined,
      sort_order: filters.sort_order || "desc",
    };

    // Attach Context Filter
    if (mode.value === "fm" && contextId.value) {
      params.fm_id = contextId.value;
    } else if (mode.value === "follower" && contextId.value) {
      params.follower_id = contextId.value;
    }

    if (accountInfo.value?.trading_account_id) {
      params.trading_account_id = accountInfo.value.trading_account_id;
    } else if (accountInfo.value?.account_number) {
      params.account_number = accountInfo.value.account_number;
    }

    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }
    if (filters.status && filters.status !== "") {
      params.status = filters.status;
    }
    if (filters.type && filters.type !== "") {
      params.type = filters.type;
    }
    if (filters.symbol && filters.symbol !== "") {
      params.symbol = filters.symbol;
    }
    if (filters.start_date && filters.start_date !== "") {
      params.start_date = filters.start_date;
      params.from_date = filters.start_date;
    }
    if (filters.end_date && filters.end_date !== "") {
      params.end_date = filters.end_date;
      params.to_date = filters.end_date;
    }

    return params;
  };

  // Main Data Fetch for Active Tab
  const fetchTradesData = async (forceRefresh = false) => {
    if (forceRefresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }

    try {
      const params = buildParams();
      let endpoint = urls.tradeBook.positions;

      if (activeTab.value === "orders") {
        endpoint = urls.tradeBook.orders;
      } else if (activeTab.value === "deals") {
        endpoint = urls.tradeBook.deals;
      }

      const res = await apiRequest(urls.KEYS.GET, endpoint, {
        params,
        isTokenRequired: true,
      });

      const wrapper =
        res?.data && Array.isArray(res.data) ? res : res?.data || res;

      const rawItems = Array.isArray(wrapper?.data)
        ? wrapper.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (activeTab.value === "positions") {
        positions.value = rawItems;
      } else if (activeTab.value === "orders") {
        orders.value = rawItems;
      } else if (activeTab.value === "deals") {
        deals.value = rawItems;
      }

      // Update Summary
      if (wrapper?.summary) {
        summary.value = {
          open_positions: wrapper.summary.open_positions ?? wrapper.summary.open_trades ?? 0,
          closed_positions: wrapper.summary.closed_positions ?? wrapper.summary.closed_trades ?? 0,
          total_positions: wrapper.summary.total_positions ?? wrapper.summary.total_trades ?? rawItems.length,
          total_orders: wrapper.summary.total_orders ?? 0,
          total_deals: wrapper.summary.total_deals ?? 0,
          total_lot: wrapper.summary.total_lot ?? wrapper.summary.total_lots ?? wrapper.summary.total_volume ?? 0,
          total_volume: wrapper.summary.total_volume ?? wrapper.summary.total_lot ?? 0,
          total_pnl: wrapper.summary.total_pnl ?? wrapper.summary.pnl ?? 0,
          floating_pnl: wrapper.summary.floating_pnl ?? 0,
          realized_pnl: wrapper.summary.realized_pnl ?? wrapper.summary.total_pnl ?? 0,
        };
      }

      // Update Pagination
      pagination.value = wrapper?.pagination || {
        page: pagination.value.page,
        per_page: pagination.value.per_page,
        total_items: wrapper?.total || rawItems.length,
        total_pages: Math.max(1, Math.ceil((wrapper?.total || rawItems.length) / pagination.value.per_page)),
        has_next: false,
        has_prev: false,
      };
    } catch (err) {
      console.error(`Failed to fetch ${activeTab.value} data:`, err);
      snackbar.show(
        err?.message || `Failed to load ${activeTab.value} data.`,
        "error"
      );
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  };

  // Tab switching
  const setActiveTab = (tab) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    pagination.value.page = 1;
    filters.status = "";
    fetchTradesData();
  };

  let searchTimer = null;
  const setSearch = (searchStr) => {
    filters.search = searchStr;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      pagination.value.page = 1;
      fetchTradesData(true);
    }, 400);
  };

  const setStatusFilter = (statusVal) => {
    filters.status = statusVal;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setTypeFilter = (typeVal) => {
    filters.type = typeVal;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setSymbolFilter = (symVal) => {
    filters.symbol = symVal;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setDateFilter = (startDate, endDate) => {
    filters.start_date = startDate || "";
    filters.end_date = endDate || "";
    filters.from_date = startDate || "";
    filters.to_date = endDate || "";
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setSort = (sortBy, sortOrder) => {
    filters.sort_by = sortBy;
    if (sortOrder) filters.sort_order = sortOrder;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setPage = (newPage) => {
    pagination.value.page = newPage;
    fetchTradesData(true);
  };

  const setPerPage = (newPerPage) => {
    pagination.value.per_page = Number(newPerPage);
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const resetFilters = () => {
    filters.search = "";
    filters.status = "";
    filters.type = "";
    filters.symbol = "";
    filters.start_date = "";
    filters.end_date = "";
    filters.from_date = "";
    filters.to_date = "";
    filters.sort_by = "";
    filters.sort_order = "desc";
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const resetAll = () => {
    positions.value = [];
    orders.value = [];
    deals.value = [];
    contextId.value = null;
    accountInfo.value = null;
    activeTab.value = "positions";
    pagination.value.page = 1;
  };

  return {
    mode,
    contextId,
    accountInfo,
    activeTab,
    positions,
    orders,
    deals,
    summary,
    availableFilters,
    pagination,
    filters,
    isLoading,
    isRefreshing,
    followerLoading,
    setContext,
    fetchFollowerInfo,
    fetchFilters,
    fetchTradesData,
    setActiveTab,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setSymbolFilter,
    setDateFilter,
    setSort,
    setPage,
    setPerPage,
    resetFilters,
    resetAll,
  };
});
