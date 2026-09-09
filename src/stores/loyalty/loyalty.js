import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useLoyaltyStore = defineStore("loyalty", () => {
  const snackbar = useSnackbarStore();

  // ─── State ─────────────────────────────────────────────
  const program = ref(null);
  const tiers = ref([]);
  const rewards = ref([]);
  const enrollments = ref([]);
  const enrollmentDetail = ref(null);
  const deals = ref([]);
  const backfillJobs = ref([]);
  const activeBackfillJob = ref(null);

  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  // ─── Program Actions ───────────────────────────────────
  const fetchProgram = (programId = null) => {
    loading.value = true;
    error.value = null;

    const params = programId ? { program_id: programId } : {};

    const successHandler = (res) => {
      program.value = res?.data || null;
      if (program.value?.id) {
        fetchTiers(program.value.id);
        fetchRewards(program.value.id);
      }
    };

    const failureHandler = (err) => {
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch loyalty program", "error");
    };

    const finallyHandler = () => {
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.program, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateProgram = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      if (res?.data) {
        program.value = res.data;
      }
      snackbar.show(res?.message || "Program updated successfully", "success");
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update program", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateProgram(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Tiers Actions ─────────────────────────────────────
  const fetchTiers = (programId) => {
    if (!programId) return;

    const successHandler = (res) => {
      tiers.value = Array.isArray(res?.data) ? res.data : [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch tiers", "error");
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.tiers(programId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const createTier = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Tier created successfully", "success");
      fetchTiers(programId);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create tier", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createTier(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateTier = (tierId, payload, programId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Tier updated successfully", "success");
      if (programId) {
        fetchTiers(programId);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update tier", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateTier(tierId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Rewards Actions ───────────────────────────────────
  const fetchRewards = (programId) => {
    if (!programId) return;

    const successHandler = (res) => {
      rewards.value = Array.isArray(res?.data) ? res.data : [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch rewards", "error");
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.rewards(programId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const createReward = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Reward created successfully", "success");
      fetchRewards(programId);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create reward", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createReward(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateReward = (rewardId, payload, programId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Reward updated successfully", "success");
      if (programId) {
        fetchRewards(programId);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update reward", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateReward(rewardId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Enrollments Actions ───────────────────────────────
  const fetchEnrollments = (params = {}) => {
    loading.value = true;

    const successHandler = (res) => {
      enrollments.value = Array.isArray(res?.data) ? res.data : [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch enrollments", "error");
    };

    const finallyHandler = () => {
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.enrollments, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createEnrollment = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Enrollment created successfully", "success");
      fetchEnrollments();
      if (program.value?.id) {
        fetchProgram(program.value.id);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create enrollment", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createEnrollment, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchEnrollmentDetail = (enrollmentId) => {
    detailLoading.value = true;

    const successHandler = (res) => {
      enrollmentDetail.value = res?.data || null;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch enrollment details", "error");
    };

    const finallyHandler = () => {
      detailLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.enrollmentDetail(enrollmentId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Deals Actions ─────────────────────────────────────
  const fetchDeals = (params = {}) => {
    loading.value = true;

    const successHandler = (res) => {
      deals.value = Array.isArray(res?.data) ? res.data : [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch loyalty deals", "error");
    };

    const finallyHandler = () => {
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.deals, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── MT5 History Backfill Actions ───────────────────────
  const startBackfill = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Backfill job queued successfully", "success");
      fetchBackfillJobs();
      if (res?.data) {
        activeBackfillJob.value = res.data;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to start backfill job", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.backfill, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchBackfillJobs = (params = {}) => {
    loading.value = true;

    const successHandler = (res) => {
      backfillJobs.value = Array.isArray(res?.data) ? res.data : [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch backfill jobs", "error");
    };

    const finallyHandler = () => {
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.backfill, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchBackfillJobStatus = (jobId) => {
    const successHandler = (res) => {
      if (res?.data) {
        activeBackfillJob.value = res.data;
        const index = backfillJobs.value.findIndex((j) => j.id === jobId);
        if (index !== -1) {
          backfillJobs.value[index] = res.data;
        }
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch job status", "error");
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.backfillDetail(jobId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    program,
    tiers,
    rewards,
    enrollments,
    enrollmentDetail,
    deals,
    backfillJobs,
    activeBackfillJob,
    loading,
    actionLoading,
    detailLoading,
    error,
    fetchProgram,
    updateProgram,
    fetchTiers,
    createTier,
    updateTier,
    fetchRewards,
    createReward,
    updateReward,
    fetchEnrollments,
    createEnrollment,
    fetchEnrollmentDetail,
    fetchDeals,
    startBackfill,
    fetchBackfillJobs,
    fetchBackfillJobStatus,
  };
});
