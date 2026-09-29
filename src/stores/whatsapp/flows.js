import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useWhatsAppFlowsStore = defineStore("whatsappFlows", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const flows = ref([]);
  const activeFlow = ref(null);
  const pagination = ref({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });

  const filters = reactive({
    stage: "", // 'KYC' | 'DEPOSIT' | 'TRADING' | 'COMPLETED' | '' (all)
    is_active: null, // true | false | null
    search: "",
    sort_by: "execution_order",
    sort_dir: "asc",
  });

  // ─── 2. In-Flight Tracking (Prevents Parallel Duplicate Requests) ─
  const inFlight = {
    flows: false,
    activeFlow: false,
  };

  // ─── 3. isFetched Tracking (Prevents Redundant API Calls) ─
  const isFetched = ref({
    flows: false,
    activeFlow: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      flows: false,
      activeFlow: false,
    };
  };

  // ─── 6. Computed Helpers ──────────────────────────────
  const activeFlowsCount = computed(() => {
    return flows.value.filter((f) => f.is_active).length;
  });

  const flowsByStage = computed(() => {
    const map = {
      KYC: [],
      DEPOSIT: [],
      TRADING: [],
      COMPLETED: [],
    };
    flows.value.forEach((flow) => {
      const stageKey = (flow.stage || "").toUpperCase();
      if (map[stageKey]) {
        map[stageKey].push(flow);
      } else {
        if (!map[stageKey]) map[stageKey] = [];
        map[stageKey].push(flow);
      }
    });

    // Ensure sorted by execution_order inside each stage
    Object.keys(map).forEach((stage) => {
      map[stage].sort((a, b) => (a.execution_order || 0) - (b.execution_order || 0));
    });

    return map;
  });

  const stageCounts = computed(() => ({
    ALL: flows.value.length,
    KYC: (flowsByStage.value.KYC || []).length,
    DEPOSIT: (flowsByStage.value.DEPOSIT || []).length,
    TRADING: (flowsByStage.value.TRADING || []).length,
    COMPLETED: (flowsByStage.value.COMPLETED || []).length,
  }));

  // ─── 7. Fetch Actions ──────────────────────────────────
  const fetchFlows = (params = {}, force = false) => {
    if (inFlight.flows) return Promise.resolve(flows.value);
    if (isFetched.value.flows && !force && Object.keys(params).length === 0) {
      return Promise.resolve(flows.value);
    }

    inFlight.flows = true;
    loading.value = true;
    error.value = null;

    const queryParams = {
      ...(filters.stage ? { stage: filters.stage } : {}),
      ...(filters.is_active !== null && filters.is_active !== undefined
        ? { is_active: filters.is_active }
        : {}),
      ...(filters.search ? { search: filters.search.trim() } : {}),
      sort_by: filters.sort_by || "execution_order",
      sort_dir: filters.sort_dir || "asc",
      page: pagination.value.page || 1,
      per_page: pagination.value.per_page || 50,
      ...params,
    };

    return new Promise((resolve) => {
      apiRequest(urls.KEYS.GET, urls.whatsapp.templateFlows, {
        params: queryParams,
        isTokenRequired: true,
        onSuccess: (res) => {
          let list = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res?.template_flows && Array.isArray(res.template_flows)) {
            list = res.template_flows;
          } else if (res?.data?.template_flows && Array.isArray(res.data.template_flows)) {
            list = res.data.template_flows;
          } else if (res?.data && Array.isArray(res.data)) {
            list = res.data;
          }

          flows.value = list;

          if (res?.pagination) {
            pagination.value = {
              ...pagination.value,
              ...res.pagination,
            };
          } else if (res?.data?.pagination) {
            pagination.value = {
              ...pagination.value,
              ...res.data.pagination,
            };
          } else {
            pagination.value.total = list.length;
          }

          isFetched.value.flows = true;
          resolve(flows.value);
        },
        onFailure: (err) => {
          error.value = err?.message || "Failed to fetch template flows";
          snackbar.show(err?.message || "Failed to fetch template flows", "error");
          resolve([]);
        },
        onFinally: () => {
          inFlight.flows = false;
          loading.value = false;
        },
      });
    });
  };

  const fetchFlow = (id, force = false) => {
    if (inFlight.activeFlow) return Promise.resolve(activeFlow.value);
    if (isFetched.value.activeFlow && activeFlow.value?.id === id && !force) {
      return Promise.resolve(activeFlow.value);
    }

    inFlight.activeFlow = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.whatsapp.templateFlow(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          const flow = res?.template_flow || res?.data?.template_flow || res?.data || res;
          activeFlow.value = flow;
          isFetched.value.activeFlow = true;
          resolve(flow);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || `Failed to fetch flow #${id}`, "error");
          reject(err);
        },
        onFinally: () => {
          inFlight.activeFlow = false;
        },
      });
    });
  };

  // ─── 8. Mutation Actions ───────────────────────────────
  const createFlow = (payload) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.whatsapp.createTemplateFlow, {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(res?.message || "Template flow step created successfully", "success");
          fetchFlows({}, true);
          resolve(res);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to create template flow step", "error");
          reject(err);
        },
        onFinally: () => {
          actionLoading.value = false;
        },
      });
    });
  };

  const updateFlow = (id, payload) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PATCH, urls.whatsapp.updateTemplateFlow(id), {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(res?.message || "Template flow step updated successfully", "success");
          fetchFlows({}, true);
          resolve(res);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to update template flow step", "error");
          reject(err);
        },
        onFinally: () => {
          actionLoading.value = false;
        },
      });
    });
  };

  const toggleFlowActive = (flow) => {
    const newStatus = !flow.is_active;
    return updateFlow(flow.id, { is_active: newStatus });
  };

  const reorderFlows = (orders) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.whatsapp.reorderTemplateFlows, {
        data: { orders },
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(res?.message || "Flow execution orders updated successfully", "success");
          if (res?.template_flows && Array.isArray(res.template_flows)) {
            flows.value = res.template_flows;
          } else {
            fetchFlows({}, true);
          }
          resolve(res);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to reorder template flows", "error");
          reject(err);
        },
        onFinally: () => {
          actionLoading.value = false;
        },
      });
    });
  };

  const deleteFlow = (id) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.DELETE, urls.whatsapp.deleteTemplateFlow(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(res?.message || "Template flow step deleted successfully", "success");
          flows.value = flows.value.filter((f) => f.id !== id);
          resolve(res);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to delete template flow step", "error");
          reject(err);
        },
        onFinally: () => {
          actionLoading.value = false;
        },
      });
    });
  };

  const setStageFilter = (stage) => {
    filters.stage = stage === "ALL" ? "" : stage;
    fetchFlows({}, true);
  };

  const resetFilters = () => {
    filters.stage = "";
    filters.is_active = null;
    filters.search = "";
    filters.sort_by = "execution_order";
    filters.sort_dir = "asc";
    fetchFlows({}, true);
  };

  return {
    flows,
    activeFlow,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    isFetched,
    activeFlowsCount,
    flowsByStage,
    stageCounts,
    resetFetchedFlags,
    fetchFlows,
    fetchFlow,
    createFlow,
    updateFlow,
    toggleFlowActive,
    reorderFlows,
    deleteFlow,
    setStageFilter,
    resetFilters,
  };
});
