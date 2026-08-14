import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useTickerStore } from "@/stores/ws/ticker";

export const useFmTradeBookStore = defineStore("fmTradeBook", () => {
  const snackbar = useSnackbarStore();
  const tickerStore = useTickerStore();

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
    // Positions
    total_positions: 0,
    open_positions: 0,
    closed_positions: 0,
    winning_positions: 0,
    losing_positions: 0,
    win_rate: null,
    // Orders
    total_orders: 0,
    filled_orders: 0,
    rejected_orders: 0,
    // Deals
    total_deals: 0,
    in_deals: 0,
    out_deals: 0,
    total_commission: 0,
    total_storage: 0,
    // Common / FM Master
    total_volume: 0,
    total_profit: 0,
    total_lot: 0,
    total_pnl: 0,
    total_trades: 0,
    open_trades: 0,
    closed_trades: 0,
    floating_pnl: 0,
    realized_pnl: 0,
  });

  // Filter options from backend
  const availableFilters = ref({
    symbols: [],
    types: [],
    statuses: [],
    order_states: [],
    deal_entries: [],
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
    sort_by: "time_create",
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
          order_states: res.data.order_states || [],
          deal_entries: res.data.deal_entries || [],
          accounts: res.data.accounts || [],
        };

        if (Array.isArray(res.data.symbols) && res.data.symbols.length > 0) {
          tickerStore.updateTickerList(res.data.symbols);
        }
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
      sort_order: filters.sort_order || "desc",
    };

    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
    }

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
      if (activeTab.value === "orders") {
        params.state = filters.status;
        params.status = filters.status;
      } else if (activeTab.value === "deals") {
        params.entry = filters.status;
        params.status = filters.status;
      } else {
        params.status = filters.status;
      }
    }

    if (filters.type && filters.type !== "") {
      params.type = filters.type;
      params.action = filters.type;
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
      let endpoint = urls.tradeBook.positions;
      let params = buildParams();

      // FM Mode uses master-trades endpoint: GET /trade-book/master-trades/:fm_id
      if (mode.value === "fm" && contextId.value) {
        endpoint = `${urls.tradeBook.masterTrades}/${contextId.value}`;
        params = {
          page: pagination.value.page,
          per_page: pagination.value.per_page,
          sort_order: filters.sort_order || "desc",
        };
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.search) params.search = filters.search.trim();
        if (filters.status) params.status = filters.status;
        if (filters.symbol) params.symbol = filters.symbol;
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;
      } else {
        // Follower mode uses positions / orders / deals
        if (activeTab.value === "orders") {
          endpoint = urls.tradeBook.orders;
        } else if (activeTab.value === "deals") {
          endpoint = urls.tradeBook.deals;
        } else {
          endpoint = urls.tradeBook.positions;
        }
      }

      const res = await apiRequest(urls.KEYS.GET, endpoint, {
        params,
        isTokenRequired: true,
      });

      const responseData = res?.data || res || {};
      const items = Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      if (mode.value === "fm") {
        positions.value = items;
      } else if (activeTab.value === "positions") {
        positions.value = items;
      } else if (activeTab.value === "orders") {
        orders.value = items;
      } else if (activeTab.value === "deals") {
        deals.value = items;
      }

      // Automatically subscribe all unique trade symbols to ticker store
      if (items && items.length > 0) {
        const uniqueSymbols = [
          ...new Set(items.map((trade) => trade?.symbol)),
        ].filter(Boolean);

        if (uniqueSymbols.length > 0) {
          tickerStore.updateTickerList(uniqueSymbols);
        }
      }

      // Summary from API
      if (responseData.summary) {
        summary.value = {
          ...summary.value,
          ...responseData.summary,
        };
      }

      // Pagination from API
      if (responseData.pagination) {
        pagination.value = {
          page: responseData.pagination.page || 1,
          per_page: responseData.pagination.per_page || 20,
          total_items: responseData.pagination.total_items ?? items.length,
          total_pages: responseData.pagination.total_pages || 1,
          has_next: responseData.pagination.has_next || false,
          has_prev: responseData.pagination.has_prev || false,
        };
      }

      // Sort from API
      if (responseData.sort) {
        if (responseData.sort.sort_by) {
          filters.sort_by = responseData.sort.sort_by;
        }
        if (responseData.sort.sort_order) {
          filters.sort_order = responseData.sort.sort_order;
        }
      }
    } catch (err) {
      console.error(`Failed to fetch trade book data:`, err);
      snackbar.show(
        err?.message || `Failed to load trade book data.`,
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
    filters.type = "";

    // Set default sort for active tab
    if (tab === "positions") {
      filters.sort_by = "time_create";
    } else if (tab === "orders") {
      filters.sort_by = "time_setup";
    } else if (tab === "deals") {
      filters.sort_by = "time";
    }

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
    if (activeTab.value === "positions") {
      filters.sort_by = "time_create";
    } else if (activeTab.value === "orders") {
      filters.sort_by = "time_setup";
    } else if (activeTab.value === "deals") {
      filters.sort_by = "time";
    } else {
      filters.sort_by = "";
    }
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
