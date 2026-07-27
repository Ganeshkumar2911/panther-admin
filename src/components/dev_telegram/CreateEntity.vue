//
<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" @click="handleClose" />

      <!-- Panel -->
      <div
        class="w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-5 border-b border-primary-border flex items-center justify-between bg-card-background/50 flex-shrink-0"
        >
          <div>
            <h2 class="text-lg font-semibold text-primary-text">Add Entity</h2>
            <p class="text-xs text-secondary-text mt-1">
              Module:
              <span class="font-semibold text-primary">{{ moduleKey }}</span>
            </p>
          </div>

          <button
            @click="handleClose"
            class="text-secondary-text hover:text-primary-text transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Errors -->
          <div
            v-if="errors.length"
            class="rounded-lg border border-red-300 bg-red-50 px-4 py-3 space-y-1"
          >
            <p
              v-for="(err, i) in errors"
              :key="i"
              class="text-xs text-red-600 font-medium"
            >
              {{ err }}
            </p>
          </div>

          <!-- Entities -->
          <div
            v-for="(entity, eIndex) in entities"
            :key="entity._id"
            class="border border-primary-border rounded-lg overflow-hidden"
          >
            <!-- Entity Header -->
            <div
              class="px-4 py-3 bg-background flex items-center justify-between gap-3 border-b border-primary-border"
            >
              <div class="flex items-center gap-2 flex-1">
                <Users class="w-4 h-4 text-secondary-text flex-shrink-0" />
                <input
                  v-model="entity.entity"
                  type="text"
                  placeholder="Entity name (e.g. PROFILE)"
                  class="w-full bg-transparent text-sm font-semibold text-secondary-text uppercase placeholder:normal-case placeholder:font-normal placeholder:text-secondary-text focus:outline-none"
                />
              </div>
              <button
                v-if="entities.length > 1"
                @click="removeEntity(eIndex)"
                class="text-secondary-text hover:text-red-500 transition-colors p-1"
                title="Remove entity"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Actions for this entity -->
            <div class="p-4 space-y-3">
              <div
                v-for="(action, aIndex) in entity.actions"
                :key="action._id"
                class="flex items-center gap-3 bg-background/60 rounded-lg px-3 py-2"
              >
                <input
                  v-model="action.action"
                  type="text"
                  placeholder="Action (e.g. CREATE)"
                  class="flex-1 bg-transparent text-xs font-medium text-primary-text uppercase placeholder:normal-case placeholder:font-normal placeholder:text-secondary-text focus:outline-none border-b border-transparent focus:border-primary-border"
                />

                <label
                  class="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    v-model="action.notify_on_success"
                    class="w-3.5 h-3.5 accent-green-600 cursor-pointer"
                  />
                  <span class="text-green-600 font-medium">Success</span>
                </label>

                <label
                  class="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    v-model="action.notify_on_failed"
                    class="w-3.5 h-3.5 accent-red-600 cursor-pointer"
                  />
                  <span class="text-red-600 font-medium">Failed</span>
                </label>

                <button
                  v-if="entity.actions.length > 1"
                  @click="removeAction(eIndex, aIndex)"
                  class="text-secondary-text hover:text-red-500 transition-colors p-1"
                  title="Remove action"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                @click="addAction(eIndex)"
                class="w-full h-9 rounded-lg border border-dashed border-primary-border text-secondary-text hover:text-primary hover:border-primary transition-colors text-xs font-medium flex items-center justify-center gap-2"
              >
                <Plus class="w-3.5 h-3.5" />
                Add Action
              </button>
            </div>
          </div>

          <!-- Add Entity Button -->
          <button
            @click="addEntity"
            class="w-full h-11 rounded-lg border-2 border-dashed border-primary-border text-secondary-text hover:text-primary hover:border-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Another Entity
          </button>
        </div>

        <!-- Footer -->
        <div
          class="border-t border-primary-border px-6 py-4 flex justify-end gap-3 bg-card-background/50 flex-shrink-0"
        >
          <button
            @click="handleClose"
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
import { ref, watch, computed } from "vue";
import { X, Plus, Users, Save, Loader2, Trash2 } from "lucide-vue-next";
import { useTelegramConfigurationStore } from "@/stores/dev_telegram/telegram-config";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  module: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "submit"]);

const store = useTelegramConfigurationStore();

// module.moduleKey is passed in from index.vue's openAddEntityModule()
const moduleKey = computed(() => props.module?.moduleKey || "");

let uid = 0;
const nextId = () => ++uid;

const makeEmptyAction = () => ({
  _id: nextId(),
  action: "",
  notify_on_success: false,
  notify_on_failed: false,
});

const makeEmptyEntity = () => ({
  _id: nextId(),
  entity: "",
  actions: [makeEmptyAction()],
});

const entities = ref([makeEmptyEntity()]);
const errors = ref([]);
const isSubmitting = ref(false);

// Reset the form whenever the panel is opened
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      entities.value = [makeEmptyEntity()];
      errors.value = [];
      isSubmitting.value = false;
    }
  },
);

const addEntity = () => {
  entities.value.push(makeEmptyEntity());
};

const removeEntity = (eIndex) => {
  entities.value.splice(eIndex, 1);
};

const addAction = (eIndex) => {
  entities.value[eIndex].actions.push(makeEmptyAction());
};

const removeAction = (eIndex, aIndex) => {
  entities.value[eIndex].actions.splice(aIndex, 1);
};

const validate = () => {
  const validationErrors = [];
  const seenEntityNames = new Set();

  if (!moduleKey.value) {
    validationErrors.push("Module is missing.");
  }

  entities.value.forEach((entity, eIndex) => {
    const entityName = entity.entity.trim().toUpperCase();

    if (!entityName) {
      validationErrors.push(`Entity #${eIndex + 1}: name is required.`);
      return;
    }

    if (seenEntityNames.has(entityName)) {
      validationErrors.push(`Entity "${entityName}" is duplicated.`);
      return;
    }
    seenEntityNames.add(entityName);

    if (!entity.actions.length) {
      validationErrors.push(
        `Entity "${entityName}": at least one action is required.`,
      );
      return;
    }

    const seenActionNames = new Set();

    entity.actions.forEach((action, aIndex) => {
      const actionName = action.action.trim().toUpperCase();

      if (!actionName) {
        validationErrors.push(
          `Entity "${entityName}", action #${aIndex + 1}: name is required.`,
        );
        return;
      }

      if (seenActionNames.has(actionName)) {
        validationErrors.push(
          `Entity "${entityName}": action "${actionName}" is duplicated.`,
        );
        return;
      }
      seenActionNames.add(actionName);

      if (!action.notify_on_success && !action.notify_on_failed) {
        validationErrors.push(
          `Entity "${entityName}", action "${actionName}": select at least one of Success/Failed.`,
        );
      }
    });
  });

  errors.value = validationErrors;
  return validationErrors.length === 0;
};

const buildPayload = () => ({
  module: moduleKey.value,
  entities: entities.value.map((entity) => ({
    entity: entity.entity.trim().toUpperCase(),
    actions: entity.actions.map((action) => ({
      action: action.action.trim().toUpperCase(),
      notify_on_success: !!action.notify_on_success,
      notify_on_failed: !!action.notify_on_failed,
    })),
  })),
});

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (!validate()) return;

  const payload = buildPayload();

  isSubmitting.value = true;
  try {
    await store.createEntitiesWithActions(payload);
    emit("submit", payload);
    handleClose();
  } catch (err) {
    // store already shows a snackbar on failure; keep panel open
  } finally {
    isSubmitting.value = false;
  }
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
