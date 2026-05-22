import { ref, computed } from "vue";
import authToken from "@/common/authToken";
import { defineStore } from "pinia";
import MatrixTicker from "@/utils/MatrixTicker";
import { useProfileStore } from "@/stores/profile/profile";

export const useTickerStore = defineStore("tickers", () => {
  const profileStore = useProfileStore();

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
    let newSymbols = [];

    for (let i = 0; i < data.length; i++) {
      const symbol = String(data[i]).replace(/[^A-Z0-9]/g, "");

      if (!tickerList.value.includes(symbol)) {
        tickerList.value.push(symbol);
        newSymbols.push(symbol);
      }
    }

    if (ticker && newSymbols.length > 0) {
      subscribe(profileStore.user?.user_id, newSymbols);
    }
  }

  /* ---------------- Handle Incoming Tick ---------------- */
  const onTicks = (tick) => {
    updateLastPrice(tick);
  };

  /* ---------------- Start WS ---------------- */
  const startWebSocket = () => {
    if (wsStatus) return;

    ticker = new MatrixTicker({
      token: token.value,
      reconnect: true,
    });

    ticker.on("connect", () => {
      isConnected.value = true;

      console.log("WebSocket Connected");
    });

    ticker.on("disconnect", () => {
      isConnected.value = false;

      console.log("WebSocket Disconnected");
    });

    ticker.on("error", (err) => {
      console.error("WS Error:", err);
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
    if (ticker && symbols.length > 0) {
      ticker.subscribe(symbols, id);
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