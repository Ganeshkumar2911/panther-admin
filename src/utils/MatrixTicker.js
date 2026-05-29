import { io } from "socket.io-client";

class MatrixTicker {
  constructor({ token, reconnect = true, max_retry = 50, max_delay = 60 }) {
    this.root = "https://w2llv2cm-5000.inc1.devtunnels.ms/";
    this.token = token;

    this.auto_reconnect = reconnect;
    this.reconnect_max_tries = max_retry;
    this.reconnect_max_delay = max_delay;

    this.ws = null;

    this.triggers = {
      connect: [],
      disconnect: [],
      error: [],

      price_update: [],

      superadmin_test: [],
      new_client: [],
      kyc_uploaded: [],
      new_broker: [],
      payment_received: [],
      settlement: [],
      new_user_registered: [],
      new_deposit: [],
      new_withdrawal: [],
    };

    this.current_reconnection_count = 0;
    this.last_reconnect_interval = 0;

    this.connect();
  }

  /* ---------------- Connect ---------------- */
  connect() {
    if (this.ws) return;

    const url = `${this.root}?token=${this.token}`;

    this.ws = io(url, {
      transports: ["websocket"],
      reconnection: false,
    });

    this.ws.on("connect", () => {
      console.log("Socket connected");

      this.current_reconnection_count = 0;

      this.trigger("connect");
    });

    this.ws.on("disconnect", (reason) => {
      console.log("Socket disconnected");

      this.trigger("disconnect", [reason]);

      if (this.auto_reconnect) {
        this.reconnect();
      }
    });

    this.ws.on("connect_error", (err) => {
      console.error("Socket error:", err);

      this.trigger("error", [err]);
    });

    /* ---------------- PRICE UPDATE ---------------- */
    this.ws.on("price_update", (data) => {
      this.trigger("price_update", [data]);
    });

    /* ---------------- OTHER EVENTS ---------------- */
    this.ws.on("superadmin_test", (data) => {
      this.trigger("superadmin_test", [data]);
    });

    this.ws.on("new_user_registered", (data) => {
      this.trigger("new_user_registered", [data]);
    });

    this.ws.on("kyc_uploaded", (data) => {
      this.trigger("kyc_uploaded", [data]);
    });

    this.ws.on("new_broker", (data) => {
      this.trigger("new_broker", [data]);
    });

    this.ws.on("payment_received", (data) => {
      this.trigger("payment_received", [data]);
    });

    this.ws.on("settlement", (data) => {
      this.trigger("settlement", [data]);
    });

    this.ws.on("new_deposit", (data) => {
      this.trigger("new_deposit", [data]);
    });

    this.ws.on("new_withdrawal", (data) => {
      this.trigger("new_withdrawal", [data]);
    });
  }

  /* ---------------- Disconnect ---------------- */
  disconnect() {
    if (!this.ws) return;

    this.auto_reconnect = false;

    this.ws.disconnect();

    this.ws = null;
  }

  /* ---------------- Event Binding ---------------- */
  on(event, callback) {
    if (!this.triggers[event]) {
      this.triggers[event] = [];
    }

    this.triggers[event].push(callback);
  }

  trigger(event, args = []) {
    this.triggers[event]?.forEach((cb) => cb(...args));
  }

  /* ---------------- Subscribe ---------------- */
  subscribe(symbols, id) {
    if (this.ws && symbols.length > 0) {
      this.ws.emit("subscribe_symbol", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  unsubscribe(symbols, id) {
    if (this.ws) {
      this.ws.emit("unsubscribe", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  /* ---------------- Reconnect ---------------- */
  reconnect() {
    if (this.current_reconnection_count > this.reconnect_max_tries) {
      return;
    }

    this.last_reconnect_interval = Math.min(
      2 ** this.current_reconnection_count,
      this.reconnect_max_delay,
    );

    this.current_reconnection_count++;

    setTimeout(() => {
      this.connect();
    }, this.last_reconnect_interval * 1000);
  }
}

export default MatrixTicker;
