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
              Add Configuration
            </h2>
            <p class="text-xs text-secondary-text mt-1">
              Add a new module, entity, or action to your configuration
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
            <!-- Module Input -->
            <div class="space-y-3">
              <label
                class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
              >
                Module Name
                <span class="text-red-500"> * </span>
              </label>
              <input
                v-model="form.module"
                type="text"
                placeholder="e.g., AUTH, PAYMENT, USER_MANAGEMENT"
                class="w-full h-10 rounded-lg border border-primary-border bg-background px-3 text-xs placeholder-secondary-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <p class="text-xs text-secondary-text">
                Enter the module name (e.g., AUTH, PAYMENT)
              </p>
            </div>

            <!-- Entity Input -->
            <div class="space-y-3">
              <label
                class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
              >
                Entity Name
                <span class="text-red-500"> * </span>
              </label>
              <input
                v-model="form.entity"
                type="text"
                placeholder="e.g., CLIENT, LOGIN, USER"
                class="w-full h-10 rounded-lg border border-primary-border bg-background px-3 text-xs placeholder-secondary-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <p class="text-xs text-secondary-text">
                Enter the entity name (e.g., CLIENT, LOGIN)
              </p>
            </div>

            <!-- Action Input -->
            <div class="space-y-3">
              <label
                class="block text-xs font-semibold text-primary-text uppercase tracking-widest"
              >
                Action Name
                <span class="text-red-500"> * </span>
              </label>
              <input
                v-model="form.action"
                type="text"
                placeholder="e.g., FORGOT_PASSWORD_REQUEST, ADMIN_LOGIN"
                class="w-full h-10 rounded-lg border border-primary-border bg-background px-3 text-xs placeholder-secondary-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <p class="text-xs text-secondary-text">
                Enter the action name (e.g., FORGOT_PASSWORD_REQUEST)
              </p>
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
                    v-model="form.success"
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
                    v-model="form.failed"
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
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="h-10 px-6 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            {{ isSubmitting ? "Adding..." : "Add Configuration" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { X, Plus, Check } from "lucide-vue-next";
import { Shield, Users, Zap } from "lucide-vue-next";

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const configTypes = [
  { value: "module", label: "Module", icon: Shield },
  { value: "entity", label: "Entity", icon: Users },
  { value: "action", label: "Action", icon: Zap },
];

const form = ref({
  type: "action",
  module: "",
  entity: "",
  action: "",
  success: false,
  failed: false,
});

const errors = ref([]);
const isSubmitting = ref(false);

const validateForm = () => {
  errors.value = [];

  if (!form.value.module.trim()) {
    errors.value.push("Module name is required");
  }

  if (!form.value.entity.trim()) {
    errors.value.push("Entity name is required");
  }

  if (!form.value.action.trim()) {
    errors.value.push("Action name is required");
  }

  if (!form.value.success && !form.value.failed) {
    errors.value.push("Please select at least one status (Success or Failed)");
  }

  return errors.value.length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  const newConfig = {
    module: form.value.module.toUpperCase(),
    entity: form.value.entity.toUpperCase(),
    action: form.value.action.toUpperCase(),
    success: form.value.success,
    failed: form.value.failed,
  };

  emit("submit", newConfig);

  form.value = {
    type: "action",
    module: "",
    entity: "",
    action: "",
    success: false,
    failed: false,
  };

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
