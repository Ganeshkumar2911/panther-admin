// stores/clientDepth/clientDepth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useClientDepthStore = defineStore("clientDepth", () => {
  const overviewData = ref(null);
  const activeClient = ref(null);
  const loading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

  const setActiveClient = (client) => {
    if (!client) return;
    activeClient.value = { ...(activeClient.value || {}), ...client };
    try {
      localStorage.setItem("active_client", JSON.stringify(activeClient.value));
    } catch {}
  };

  const kycData = ref(null);
  const kycLoading = ref(false);
  const kycFetched = ref(false);
  const kycError = ref(null);

  const isSubmittingProfile = ref(false);
  const isSubmittingKyc = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Fetch Client Overview ────────────────────────────────
  const fetchClientOverview = (userId, force = false) => {
    if (!userId) return;
    if (isFetched.value && !force) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      overviewData.value = res?.data || res || null;
      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(
        err?.message || "Failed to fetch client overview.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.overview, {
      look_up_key: userId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch Client KYC ─────────────────────────────────────
  const fetchClientKyc = (userId, force = false) => {
    if (!userId) return;
    if (kycFetched.value && !force) return;

    kycLoading.value = true;
    kycError.value = null;

    const successHandler = (res) => {
      kycData.value = res?.data || res || null;
      kycLoading.value = false;
      kycFetched.value = true;
    };

    const failureHandler = (err) => {
      kycLoading.value = false;
      kycError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch client KYC.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.kyc, {
      look_up_key: userId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Update Client Profile ────────────────────────────────
  const updateClientProfile = (userId, profileData, callback) => {
    if (!userId) return;

    isSubmittingProfile.value = true;

    const successHandler = (res) => {
      isSubmittingProfile.value = false;
      snackbar.show(
        res?.message || "Profile details updated successfully.",
        "success",
      );
      if (res?.data || profileData) {
        const merged = {
          ...(activeClient.value || {}),
          ...profileData,
          ...(res?.data || {}),
        };
        setActiveClient(merged);
      }
      fetchClientOverview(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingProfile.value = false;
      snackbar.show(
        err?.message || "Failed to update profile details.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.PATCH,
      urls.clientDepth.userUpdate || urls.clientList.update,
      {
        isTokenRequired: true,
        params: { user_id: userId },
        data: profileData,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── Update Client KYC ────────────────────────────────────
  const updateClientKyc = (userId, kycPayload, callback) => {
    if (!userId) return;

    isSubmittingKyc.value = true;

    const successHandler = (res) => {
      isSubmittingKyc.value = false;
      snackbar.show(
        res?.message || "KYC verification updated successfully.",
        "success",
      );
      fetchClientKyc(userId, true);
      fetchClientOverview(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingKyc.value = false;
      snackbar.show(
        err?.message || "Failed to update KYC status.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.PATCH,
      urls.clientDepth.updateKyc || urls.clientDepth.kyc,
      {
        isTokenRequired: true,
        look_up_key: userId,
        data: kycPayload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── Upload Client KYC Document ───────────────────────────
  const isUploadingDoc = ref(false);

  const uploadClientDocument = (userId, payload, callback) => {
    if (!userId) return;

    isUploadingDoc.value = true;

    const formData = new FormData();
    formData.append("user_id", userId);
    if (payload.doc_type) {
      formData.append("doc_type", payload.doc_type);
    }
    if (payload.front) {
      formData.append("front", payload.front);
    }
    if (payload.back) {
      formData.append("back", payload.back);
    }

    const successHandler = (res) => {
      isUploadingDoc.value = false;
      snackbar.show(
        res?.message || "KYC document uploaded successfully.",
        "success",
      );
      fetchClientKyc(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isUploadingDoc.value = false;
      snackbar.show(
        err?.message || "Failed to upload KYC document.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.POST,
      urls.clientDepth.uploadDocument || "/user-document-upload",
      {
        isTokenRequired: true,
        // params: { user_id: userId },
        data: formData,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── User Charts State & Action ───────────────────────────
  const userChartsData = ref(null);
  const userChartsLoading = ref(false);
  const userChartsFetched = ref(false);
  const userChartsError = ref(null);

  const fetchUserCharts = (userId, params = {}, force = false) => {
    if (!userId) return;
    if (userChartsFetched.value && !force && Object.keys(params).length === 0) return;

    userChartsLoading.value = true;
    userChartsError.value = null;

    const successHandler = (res) => {
      userChartsData.value = res?.data || res || null;
      userChartsLoading.value = false;
      userChartsFetched.value = true;
    };

    const failureHandler = (err) => {
      userChartsLoading.value = false;
      userChartsError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch user charts data.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.userCharts, {
      // look_up_key: userId,
      params: { user_id: userId, ...params },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Account Details State & Action ───────────────────────
  const accountDetailsData = ref(null);
  const accountDetailsLoading = ref(false);
  const accountDetailsFetched = ref(false);
  const accountDetailsError = ref(null);

  const fetchAccountDetails = (userId, params = {}, force = false) => {
    if (!userId) return;
    if (accountDetailsFetched.value && !force && Object.keys(params).length === 0) return;

    accountDetailsLoading.value = true;
    accountDetailsError.value = null;

    const successHandler = (res) => {
      accountDetailsData.value = res?.data || res || null;
      accountDetailsLoading.value = false;
      accountDetailsFetched.value = true;
    };

    const failureHandler = (err) => {
      accountDetailsLoading.value = false;
      accountDetailsError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch account details.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.accountDetails, {
      // look_up_key: userId,
      params: { user_id: userId, ...params },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Reset Store ──────────────────────────────────────────
  const reset = () => {
    overviewData.value = null;
    loading.value = false;
    isFetched.value = false;
    error.value = null;

    kycData.value = null;
    kycLoading.value = false;
    kycFetched.value = false;
    kycError.value = null;

    userChartsData.value = null;
    userChartsLoading.value = false;
    userChartsFetched.value = false;
    userChartsError.value = null;

    accountDetailsData.value = null;
    accountDetailsLoading.value = false;
    accountDetailsFetched.value = false;
    accountDetailsError.value = null;

    isSubmittingProfile.value = false;
    isSubmittingKyc.value = false;
    isUploadingDoc.value = false;
  };

  return {
    overviewData,
    activeClient,
    loading,
    isLoading: loading,
    isFetched,
    error,

    kycData,
    kycLoading,
    kycFetched,
    kycError,

    userChartsData,
    userChartsLoading,
    userChartsFetched,
    userChartsError,

    accountDetailsData,
    accountDetailsLoading,
    accountDetailsFetched,
    accountDetailsError,

    isSubmittingProfile,
    isSubmittingKyc,
    isUploadingDoc,

    setActiveClient,
    fetchClientOverview,
    fetchClientKyc,
    fetchUserCharts,
    fetchAccountDetails,
    updateClientProfile,
    updateClientKyc,
    uploadClientDocument,
    reset,
  };
});
