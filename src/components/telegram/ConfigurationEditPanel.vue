<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" @click="$emit('close')" />

      <!-- Panel -->
      <div
        class="w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-5 border-b border-primary-border flex items-center justify-between bg-card-background/50 flex-shrink-0"
        >
          <div>
            <h2 class="text-lg font-semibold text-primary-text">
              Edit Configuration
            </h2>
            <p class="text-xs text-secondary-text mt-1">
              {{ moduleKey }} > {{ entityKey }}
            </p>
          </div>

          <button
            @click="$emit('close')"
            class="text-secondary-text hover:text-primary-text transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-y-auto">
          <div class="px-6 py-6 space-y-6">
            <!-- Existing Actions Section -->
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-primary-text mb-4">
                  Actions
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="(actionValue, actionKey) in actions"
                    :key="actionKey"
                    class="flex items-center justify-between p-4 rounded-lg border border-primary-border bg-background hover:border-primary transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <Zap class="w-4 h-4 text-secondary-text" />
                      <div>
                        <p class="text-xs font-medium text-primary-text">
                          {{ actionKey }}
                        </p>
                        <p class="text-xs text-secondary-text mt-0.5">Action</p>
                      </div>
                    </div>

                    <!-- Success/Failed Toggles -->
                    <div class="flex items-center gap-4">
                      <!-- Success Toggle -->
                      <div class="flex items-center gap-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            :checked="actionValue.SUCCESS"
                            type="checkbox"
                            @change="
                              (e) =>
                                updateAction(
                                  actionKey,
                                  'SUCCESS',
                                  e.target.checked,
                                )
                            "
                            class="w-4 h-4 rounded border-primary-border accent-green-600"
                          />
                          <span
                            class="text-xs font-medium flex items-center gap-1"
                            :class="
                              actionValue.SUCCESS
                                ? 'text-green-600'
                                : 'text-secondary-text'
                            "
                          >
                            <Check class="w-3 h-3" />
                            Success
                          </span>
                        </label>
                      </div>

                      <!-- Failed Toggle -->
                      <div class="flex items-center gap-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            :checked="actionValue.FAILED"
                            type="checkbox"
                            @change="
                              (e) =>
                                updateAction(
                                  actionKey,
                                  'FAILED',
                                  e.target.checked,
                                )
                            "
                            class="w-4 h-4 rounded border-primary-border accent-red-600"
                          />
                          <span
                            class="text-xs font-medium flex items-center gap-1"
                            :class="
                              actionValue.FAILED
                                ? 'text-red-600'
                                : 'text-secondary-text'
                            "
                          >
                            <X class="w-3 h-3" />
                            Failed
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add New Action Section -->
            <div class="border-t border-primary-border pt-6 space-y-4">
              <h3 class="text-sm font-semibold text-primary-text">
                Add New Action
              </h3>

              <div class="space-y-4">
                <!-- Action Name Input -->
                <div class="space-y-2">
                  <label
                    class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
                  >
                    Action Name
                  </label>
                  <input
                    v-model="newAction.name"
                    type="text"
                    placeholder="e.g., CREATE_ACTION"
                    class="w-full h-10 rounded-lg border border-primary-border bg-background px-3 text-xs placeholder-secondary-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <!-- Status Checkboxes -->
                <div class="space-y-3">
                  <label
                    class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
                  >
                    Status
                  </label>
                  <div class="flex gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="newAction.success"
                        type="checkbox"
                        class="w-4 h-4 rounded border-primary-border accent-green-600"
                      />
                      <span
                        class="text-xs font-medium text-primary-text flex items-center gap-1"
                      >
                        <Check class="w-3.5 h-3.5 text-green-500" />
                        Success
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="newAction.failed"
                        type="checkbox"
                        class="w-4 h-4 rounded border-primary-border accent-red-600"
                      />
                      <span
                        class="text-xs font-medium text-primary-text flex items-center gap-1"
                      >
                        <X class="w-3.5 h-3.5 text-red-500" />
                        Failed
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Add Button -->
                <button
                  @click="addAction"
                  :disabled="!newAction.name.trim()"
                  class="w-full h-10 rounded-lg border-2 border-dashed border-primary-border text-primary hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium text-xs"
                >
                  <Plus class="w-4 h-4" />
                  Add Action
                </button>
              </div>
            </div>

            <!-- Validation Errors -->
            <div
              v-if="errors.length"
              class="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <ul class="space-y-1">
                <li
                  v-for="error in errors"
                  :key="error"
                  class="text-xs text-red-600"
                >
                  • {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="border-t border-primary-border px-6 py-4 flex justify-end gap-3 bg-card-background/50 flex-shrink-0"
        >
          <button
            @click="$emit('close')"
            class="h-10 px-4 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button
            @click="handleSave"
            :disabled="isSubmitting"
            class="h-10 px-6 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Save v-if="!isSubmitting" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from "vue";
import { X, Plus, Check, Zap, Save, Loader2 } from "lucide-vue-next";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  moduleKey: {
    type: String,
    required: true,
  },
  entityKey: {
    type: String,
    required: true,
  },
  actions: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "submit"]);

const actions = ref({});
const newAction = ref({
  name: "",
  success: false,
  failed: false,
});
const errors = ref([]);
const isSubmitting = ref(false);

watch(
  () => props.actions,
  (newActions) => {
    actions.value = JSON.parse(JSON.stringify(newActions));
  },
  { immediate: true, deep: true },
);

const updateAction = (actionKey, type, value) => {
  if (actions.value[actionKey]) {
    actions.value[actionKey][type] = value;
  }
};

const addAction = () => {
  errors.value = [];

  if (!newAction.value.name.trim()) {
    errors.value.push("Action name is required");
    return;
  }

  if (!newAction.value.success && !newAction.value.failed) {
    errors.value.push("Please select at least one status");
    return;
  }

  const actionName = newAction.value.name.toUpperCase();

  if (actions.value[actionName]) {
    errors.value.push("This action already exists");
    return;
  }

  actions.value[actionName] = {
    SUCCESS: newAction.value.success,
    FAILED: newAction.value.failed,
  };

  newAction.value = {
    name: "",
    success: false,
    failed: false,
  };
};

const handleSave = async () => {
  isSubmitting.value = true;

  emit("submit", {
    moduleKey: props.moduleKey,
    entityKey: props.entityKey,
    actions: actions.value,
  });

  isSubmitting.value = false;
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
