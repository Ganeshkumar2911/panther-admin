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
  const fetchFollowerInfo = (followerId) => {
    if (!followerId) return;
    followerLoading.value = true;

    const successHandler = (res) => {
      if (res?.data) {
        accountInfo.value = res.data;
      }
    };

    const failureHandler = (err) => {
      console.warn("Follower trade book details fallback:", err);
    };

    const finallyHandler = () => {
      followerLoading.value = false;
    };

    apiRequest(urls.KEYS.GET, urls.tradeBook.followerDetails, {
      look_up_key: followerId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // Fetch Filter Metadata
  const fetchFilters = () => {
    const successHandler = (res) => {
      if (res?.data) {
        availableFilters.value = res.data;

        if (Array.isArray(res.data.symbols) && res.data.symbols.length > 0) {
          tickerStore.updateTickerList(res.data.symbols);
        }
      }
    };

    const failureHandler = (err) => {
      console.warn("Could not load trade book filter options:", err);
    };

    apiRequest(urls.KEYS.GET, urls.tradeBook.filters, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
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
  const fetchTradesData = (forceRefresh = false) => {
    if (forceRefresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }

    let endpoint = urls.tradeBook.positions;
    let lookUpKey = null;
    let params = buildParams();

    // FM Mode uses master-trades endpoint: GET /trade-book/master-trades/:fm_id
    if (mode.value === "fm" && contextId.value) {
      endpoint = urls.tradeBook.masterTrades;
      lookUpKey = contextId.value;
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

    const successHandler = (res) => {
      const items = res?.data || [];

      if (mode.value === "fm") {
        positions.value = items;
      } else if (activeTab.value === "positions") {
        positions.value = items;
      } else if (activeTab.value === "orders") {
        orders.value = items;
      } else if (activeTab.value === "deals") {
        deals.value = items;
      }

      // Automatically subscribe all unique trade symbols to ticker store right after API response
      if (items.length > 0) {
        const uniqueSymbols = [
          ...new Set(items.map((trade) => trade?.symbol)),
        ].filter(Boolean);

        if (uniqueSymbols.length > 0) {
          tickerStore.updateTickerList(uniqueSymbols);
        }
      }

      // Directly assign summary, pagination, and sort/filters from API response
      summary.value = res?.summary || {};

      if (res?.pagination) {
        pagination.value = res.pagination;
      }

      if (res?.sort?.sort_by) {
        filters.sort_by = res.sort.sort_by;
      }
      if (res?.sort?.sort_order) {
        filters.sort_order = res.sort.sort_order;
      }
      if (res?.filters?.sort_by) {
        filters.sort_by = res.filters.sort_by;
      }
      if (res?.filters?.sort_order) {
        filters.sort_order = res.filters.sort_order;
      }
    };

    const failureHandler = (err) => {
      console.error(`Failed to fetch trade book data:`, err);
      snackbar.show(
        err?.message || `Failed to load trade book data.`,
        "error"
      );
    };

    const finallyHandler = () => {
      isLoading.value = false;
      isRefreshing.value = false;
    };

    apiRequest(urls.KEYS.GET, endpoint, {
      ...(lookUpKey ? { look_up_key: lookUpKey } : {}),
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // Tab switching
  const setActiveTab = (tab) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    summary.value = {};
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
