// stores/vendorWallets/vendorWallets.js

import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useVendorWalletsStore = defineStore("vendorWallets", () => {
  const snackbar = useSnackbarStore();

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────
  const activeWallet = ref(null);
  const transactions = ref([]);
  const loadingTransactions = ref(false);
  const submittingBalance = ref(false);
  const submittingCredit = ref(false);
  const error = ref(null);

  const pagination = reactive({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  const filterBalanceType = ref(""); // '' | 'deposit' | 'withdrawal'

  // ─────────────────────────────────────
  // Exact Balance Adjustment (PATCH)
  // ─────────────────────────────────────
  const adjustBalances = (paymentMethodId, payload) => {
    submittingBalance.value = true;
    error.value = null;

    // Submit only defined/changed fields as per API conventions
    const data = {};
    if (payload.deposit_balance !== undefined && payload.deposit_balance !== null && payload.deposit_balance !== "") {
      data.deposit_balance = Number(payload.deposit_balance);
    }
    if (payload.withdrawal_balance !== undefined && payload.withdrawal_balance !== null && payload.withdrawal_balance !== "") {
      data.withdrawal_balance = Number(payload.withdrawal_balance);
    }
    if (payload.remarks !== undefined && payload.remarks !== null && String(payload.remarks).trim() !== "") {
      data.remarks = String(payload.remarks).trim();
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        submittingBalance.value = false;
        if (res?.data) {
          activeWallet.value = res.data;
        }
        snackbar.show(
          res?.message || "Vendor wallet balances updated successfully.",
          "success"
        );
        // Refresh transaction ledger to reflect adjustment
        fetchTransactions(paymentMethodId, true);
        resolve(res);
      };

      const failureHandler = (err) => {
        submittingBalance.value = false;
        error.value = err;
        snackbar.show(
          err?.message || "Failed to update vendor wallet balances.",
          "error"
        );
        reject(err);
      };

      apiRequest(
        urls.KEYS.PATCH,
        urls.vendor.wallets.balances(paymentMethodId),
        {
          data,
          isTokenRequired: true,
          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      );
    });
  };

  // ─────────────────────────────────────
  // Top-Up / Credit (POST)
  // ─────────────────────────────────────
  const creditWallet = (paymentMethodId, payload) => {
    submittingCredit.value = true;
    error.value = null;

    const data = {
      balance_type: payload.balance_type || "deposit",
      amount: Number(payload.amount),
    };
    if (payload.remarks && String(payload.remarks).trim()) {
      data.remarks = String(payload.remarks).trim();
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        submittingCredit.value = false;
        if (res?.data) {
          activeWallet.value = res.data;
        }
        snackbar.show(
          res?.message || "Vendor wallet credited successfully.",
          "success"
        );
        fetchTransactions(paymentMethodId, true);
        resolve(res);
      };

      const failureHandler = (err) => {
        submittingCredit.value = false;
        error.value = err;
        snackbar.show(
          err?.message || "Failed to credit vendor wallet.",
          "error"
        );
        reject(err);
      };

      apiRequest(
        urls.KEYS.POST,
        urls.vendor.wallets.credit(paymentMethodId),
        {
          data,
          isTokenRequired: true,
          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      );
    });
  };

  // ─────────────────────────────────────
  // Fetch Transactions Ledger (GET)
  // ─────────────────────────────────────
  const fetchTransactions = (paymentMethodId, force = false) => {
    if (!paymentMethodId) return Promise.resolve();

    loadingTransactions.value = true;
    error.value = null;

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
    };
    if (filterBalanceType.value) {
      params.balance_type = filterBalanceType.value;
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        transactions.value = res?.data || [];
        if (res?.wallet) {
          activeWallet.value = res.wallet;
        }

        const pg = res?.pagination || res?.meta || {};
        Object.assign(pagination, {
          page: pg.page || pagination.page,
          per_page: pg.per_page || pagination.per_page,
          total_items: pg.total || pg.total_items || transactions.value.length,
          total_pages:
            pg.pages ||
            pg.total_pages ||
            (pg.total ? Math.ceil(pg.total / (pg.per_page || 20)) : 1),
          has_next: Boolean(pg.has_next),
          has_prev: Boolean(pg.has_prev),
        });

        loadingTransactions.value = false;
        resolve(res);
      };

      const failureHandler = (err) => {
        loadingTransactions.value = false;
        error.value = err;
        transactions.value = [];
        snackbar.show(
          err?.message || "Failed to fetch vendor wallet transactions.",
          "error"
        );
        reject(err);
      };

      apiRequest(
        urls.KEYS.GET,
        urls.vendor.wallets.transactions(paymentMethodId),
        {
          params,
          cancelPrevious: true,
          isTokenRequired: true,
          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      );
    });
  };

  // ─────────────────────────────────────
  // Pagination & Filter Helpers
  // ─────────────────────────────────────
  const setPage = (paymentMethodId, page) => {
    pagination.page = page;
    return fetchTransactions(paymentMethodId, true);
  };

  const updatePerPage = (paymentMethodId, per_page) => {
    pagination.per_page = Number(per_page);
    pagination.page = 1;
    return fetchTransactions(paymentMethodId, true);
  };

  const setBalanceType = (paymentMethodId, type) => {
    filterBalanceType.value = type;
    pagination.page = 1;
    return fetchTransactions(paymentMethodId, true);
  };

  const reset = () => {
    activeWallet.value = null;
    transactions.value = [];
    loadingTransactions.value = false;
    submittingBalance.value = false;
    submittingCredit.value = false;
    error.value = null;
    filterBalanceType.value = "";
    Object.assign(pagination, {
      page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });
  };

  return {
    // state
    activeWallet,
    transactions,
    loadingTransactions,
    submittingBalance,
    submittingCredit,
    error,
    pagination,
    filterBalanceType,

    // methods
    adjustBalances,
    creditWallet,
    fetchTransactions,
    setPage,
    updatePerPage,
    setBalanceType,
    reset,
  };
});
