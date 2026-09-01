// stores/clientDepth/clientDepth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useClientDepthStore = defineStore("clientDepth", () => {
  const overviewData = ref(null);
  const loading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

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

    isSubmittingProfile.value = false;
    isSubmittingKyc.value = false;
    isUploadingDoc.value = false;
  };

  return {
    overviewData,
    loading,
    isLoading: loading,
    isFetched,
    error,

    kycData,
    kycLoading,
    kycFetched,
    kycError,

    isSubmittingProfile,
    isSubmittingKyc,
    isUploadingDoc,

    fetchClientOverview,
    fetchClientKyc,
    updateClientProfile,
    updateClientKyc,
    uploadClientDocument,
    reset,
  };
});
