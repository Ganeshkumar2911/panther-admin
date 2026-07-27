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
            class="text-secondary-text hover:text-primary-text cursor-pointer transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-y-auto">
          <div class="px-6 py-6 space-y-6">
            <!-- Existing Actions Section -->
            <div class="space-y-4">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-primary-border">
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Action
                    </th>
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Success
                    </th>
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Failed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(actionValue, actionKey) in actions"
                    :key="actionKey"
                    class="border-b border-primary-border last:border-none hover:bg-card-background/40 transition-colors py-1"
                  >
                    <td class="px-4 py-3 text-xs font-medium text-primary-text">
                      <div class="flex items-center gap-3">
                        <Zap class="w-4 h-4 text-secondary-text" />
                        <div>
                          <p class="text-xs font-medium text-primary-text">
                            {{ actionKey }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        :aria-checked="actionValue.SUCCESS"
                        @click="
                          updateAction(
                            actionKey,
                            'SUCCESS',
                            !actionValue.SUCCESS,
                          )
                        "
                        class="relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer"
                        :class="
                          actionValue.SUCCESS ? 'bg-green-600' : 'bg-gray-300'
                        "
                      >
                        <span
                          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                          :class="
                            actionValue.SUCCESS === true
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          "
                        />
                      </button>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          :aria-checked="actionValue.FAILED"
                          @click="
                            updateAction(
                              actionKey,
                              'FAILED',
                              !actionValue.FAILED,
                            )
                          "
                          class="relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer"
                          :class="
                            actionValue.FAILED ? 'bg-red-600' : 'bg-gray-300'
                          "
                        >
                          <!-- <span
                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                            :class="
                              actionValue.FAILED
                                ? 'translate-x-4'
                                : 'translate-x-1'
                            "
                          /> -->
                          <span
                            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                            :class="
                              actionValue.FAILED === true
                                ? 'translate-x-5'
                                : 'translate-x-0'
                            "
                          />
                        </button>

                        <button
                          v-if="!originalActions[actionKey]"
                          @click="removeAction(actionKey)"
                          class="text-secondary-text cursor-pointer hover:text-red-500 transition-colors p-1"
                          title="Remove this action"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                    @keyup.enter="addAction"
                  />
                </div>

                <!-- Status Toggles -->
                <div class="space-y-3">
                  <label
                    class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
                  >
                    Status
                  </label>
                  <div class="flex gap-6">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        :aria-checked="newAction.success"
                        @click="newAction.success = !newAction.success"
                        class="relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer"
                        :class="
                          newAction.success ? 'bg-green-600' : 'bg-gray-300'
                        "
                      >
                        <!-- <span
                          class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                          :class="
                            newAction.success
                              ? 'translate-x-4'
                              : 'translate-x-1'
                          "
                        /> -->

                        <span
                          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                          :class="
                            newAction.success
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          "
                        />
                      </button>
                      <span
                        class="text-xs font-medium text-primary-text flex items-center gap-1"
                      >
                        <Check class="w-3.5 h-3.5 text-green-500" />
                        Success
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        :aria-checked="newAction.failed"
                        @click="newAction.failed = !newAction.failed"
                        class="relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer"
                        :class="newAction.failed ? 'bg-red-600' : 'bg-gray-300'"
                      >
                        <span
                          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                          :class="
                            newAction.failed ? 'translate-x-5' : 'translate-x-0'
                          "
                        />
                      </button>
                      <span
                        class="text-xs font-medium text-primary-text flex items-center gap-1"
                      >
                        Failed
                      </span>
                    </div>
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
            class="h-10 px-4 cursor-pointer rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button
            @click="handleSave"
            :disabled="isSubmitting"
            class="h-10 px-6 cursor-pointer rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
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
import { X, Plus, Check, Zap, Save, Loader2, Trash2 } from "lucide-vue-next";

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

const originalActions = ref({});

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
    actions.value = JSON.parse(JSON.stringify(newActions || {}));
    originalActions.value = JSON.parse(JSON.stringify(newActions || {}));
    errors.value = [];
  },
  { immediate: true, deep: true },
);

const updateAction = (actionKey, type, value) => {
  if (actions.value[actionKey]) {
    actions.value[actionKey][type] = value;
  }
};

const removeAction = (actionKey) => {
  delete actions.value[actionKey];
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
  errors.value = [];

  if (!Object.keys(actions.value).length) {
    errors.value.push("Add at least one action before saving");
    return;
  }

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
