import { ref, computed } from "vue";
import authToken from "@/common/authToken";
import { defineStore } from "pinia";
import MatrixTicker from "@/utils/MatrixTicker";
import { useProfileStore } from "@/stores/profile/profile";
import { useClientListStore } from "@/stores/clientList/clientList";
import { useAccountsStore } from "@/stores/tradingAccounts/tradingAccounts";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import { useDashboardStore } from "@/stores/dashboard/dashboard";

export const useTickerStore = defineStore("tickers", () => {
  const profileStore = useProfileStore();
  const clientListStore = useClientListStore();

  let ticker = null;
  let wsStatus = false;

  const lastPrices = ref({});
  const tickerList = ref([]);   

  const token = computed(() => authToken.getToken().accessToken);

  const isConnected = ref(false);

  /* ---------------- Cross Tab Logout ---------------- */
  const channel = new BroadcastChannel("my-channel");

  channel.addEventListener("message", (event) => {
    if (event.data?.type === "logout") {
      stopWebSocket();
    }
  });

  /* ---------------- Add Symbols ---------------- */
  function updateTickerList(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    let newSymbols = [];

    for (let i = 0; i < data.length; i++) {
      const raw = data[i];
      if (!raw) continue;
      const symbol = String(raw).replace(/[^A-Z0-9]/gi, "").toUpperCase();
      if (!symbol) continue;

      if (!tickerList.value.includes(symbol)) {
        tickerList.value.push(symbol);
      }
      newSymbols.push(symbol);
    }

    const uniqueSymbols = [...new Set(newSymbols)];
    const userId = profileStore.user?.user_id || profileStore.user?.id || null;

    if (ticker && isConnected.value && uniqueSymbols.length > 0) {
      subscribe(userId, uniqueSymbols);
    }
  }

  /* ---------------- Handle Incoming Tick ---------------- */
  const onTicks = (tick) => {
    updateLastPrice(tick);
  };

  /* ---------------- Start WS ---------------- */
  const startWebSocket = () => {
    if (wsStatus) return;

    const accountsStore = useAccountsStore();
    const notificationsStore = useNotificationsStore();
    const dashboardStore = useDashboardStore();

    ticker = new MatrixTicker({
      token: token.value,
      reconnect: true,
    });

    ticker.on("connect", () => {
      isConnected.value = true;

      console.log("WebSocket Connected");
      notificationsStore.fetchMyNotifications();

      if (tickerList.value.length > 0) {
        const userId = profileStore.user?.user_id || profileStore.user?.id || null;
        subscribe(userId, tickerList.value);
      }
    });

    ticker.on("disconnect", () => {
      isConnected.value = false;

      console.log("WebSocket Disconnected");
    });

    ticker.on("error", (err) => {
      console.error("WS Error:", err);
    });

    ticker.on("new_user_registered", (data) => {
      clientListStore.fetchClients();
    });

    ticker.on("new_deposit", (data) => {
      accountsStore.fetchAccounts();
    });

    ticker.on("new_withdrawal", (data) => {
      accountsStore.fetchAccounts();
    });

    ticker.on("new_notification", (data) => {
      if (data) {
        notificationsStore.addNotification(data);
      }
    });

    ticker.on("live_user_count_update", (data) => {
      if (data) {
        dashboardStore.updateUserAccountsFromSocket(data);
      }
    });

    /* ---------------- MAIN PRICE EVENT ---------------- */
    ticker.on("price_update", onTicks);

    wsStatus = true;
  };

  /* ---------------- Stop WS ---------------- */
  const stopWebSocket = () => {
    if (!ticker) return;

    ticker.disconnect();

    ticker = null;

    wsStatus = false;

    isConnected.value = false;
  };

  /* ---------------- Subscribe ---------------- */
  const subscribe = (id, symbols = tickerList.value) => {
    const targetUserId = id || profileStore.user?.user_id || profileStore.user?.id || null;
    if (ticker && symbols && symbols.length > 0) {
      ticker.subscribe(symbols, targetUserId);
    }
  };

  /* ---------------- Unsubscribe ---------------- */
  const unsubscribe = (symbols) => {
    if (ticker) {
      ticker.unsubscribe(symbols);
    }
  };

  /* ---------------- Update Latest Price ---------------- */
  function updateLastPrice(data) {

    const symbol = data.symbol;

    lastPrices.value[symbol] = {
      symbol: data.symbol,
      bid: data.bid,
      ask: data.ask,
      last: data.last,
      time: data.time,
      contract: data.contract_size,
    };
  }

  /* ---------------- Get Last Price ---------------- */
  function getLastPrice(symbol) {
    return lastPrices.value[symbol] || null;
  }

  return {
    startWebSocket,
    stopWebSocket,

    subscribe,
    unsubscribe,

    updateTickerList,

    updateLastPrice,
    getLastPrice,

    lastPrices,
    tickerList,

    isConnected,
  };
});
