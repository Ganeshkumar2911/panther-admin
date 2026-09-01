// stores/clientDepth/clientDepth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useClientDepthStore = defineStore("clientDepth", () => {
  const overviewData = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const kycData = ref(null);
  const kycLoading = ref(false);
  const kycError = ref(null);

  const snackbar = useSnackbarStore();

  // ─── Fetch Client Overview ────────────────────────────────
  const fetchClientOverview = (userId) => {
    if (!userId) return Promise.resolve(null);

    isLoading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        overviewData.value = res?.data || res || null;
        isLoading.value = false;
        resolve(overviewData.value);
      };

      const failureHandler = (err) => {
        isLoading.value = false;
        error.value = err;
        console.warn("Failed to fetch client overview:", err);
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.clientDepth.overview, {
        isTokenRequired: true,
        look_up_key: userId,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─── Fetch Client KYC ─────────────────────────────────────
  const fetchClientKyc = (userId) => {
    if (!userId) return Promise.resolve(null);

    kycLoading.value = true;
    kycError.value = null;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        kycData.value = res?.data || res || null;
        kycLoading.value = false;
        resolve(kycData.value);
      };

      const failureHandler = (err) => {
        kycLoading.value = false;
        kycError.value = err;
        console.warn("Failed to fetch client KYC:", err);
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.clientDepth.kyc, {
        isTokenRequired: true,
        look_up_key: userId,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─── Reset ────────────────────────────────────────────────
  const reset = () => {
    overviewData.value = null;
    isLoading.value = false;
    error.value = null;

    kycData.value = null;
    kycLoading.value = false;
    kycError.value = null;
  };

  return {
    overviewData,
    isLoading,
    error,

    kycData,
    kycLoading,
    kycError,

    fetchClientOverview,
    fetchClientKyc,
    reset,
  };
});
