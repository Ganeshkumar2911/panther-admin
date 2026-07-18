<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" @click="handleClose" />

      <!-- Panel -->
      <div
        class="w-full max-w-md bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-2">
            <LayoutGrid class="w-4 h-4 text-primary" />
            <div>
              <h2 class="text-sm font-semibold text-primary-text">
                {{ isEdit ? "Edit Banner Group" : "Create Banner Group" }}
              </h2>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{
                  isEdit
                    ? `Editing: ${form.title}`
                    : "Fill in the group details below"
                }}
              </p>
            </div>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="handleClose"
            :disabled="submitting"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar">
          <!-- Validation Error Message -->
          <p
            v-if="validationError"
            class="text-primary-red text-xs bg-primary-red/10 border border-primary-red/20 px-3 py-2 rounded-lg"
          >
            {{ validationError }}
          </p>

          <!-- Group Title -->
          <div>
            <label class="block text-xs font-medium text-secondary-text mb-1.5"
              >Group Title <span class="text-primary-red">*</span></label
            >
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. HOME, OFFERS"
              :disabled="submitting"
              class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <!-- Group Description -->
          <div>
            <label class="block text-xs font-medium text-secondary-text mb-1.5"
              >Description</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Enter a brief description for this group..."
              :disabled="submitting"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
            />
          </div>

          <!-- Is Active Toggle -->
          <div
            class="flex items-center justify-between p-4 bg-background/20 rounded-xl border border-primary-border/30"
          >
            <div>
              <p class="text-xs font-semibold text-primary-text">
                Active Status
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">
                Control whether this group and its banners are visible
              </p>
            </div>
            <button
              type="button"
              :disabled="submitting"
              @click="form.is_active = !form.is_active"
              class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
              :class="form.is_active ? 'bg-primary-green' : 'bg-primary-border'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background"
        >
          <button
            :disabled="submitting"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            :disabled="submitting || !isValid"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="submit"
          >
            <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{
              submitting ? "Saving..." : isEdit ? "Save Changes" : "Create"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { LayoutGrid, X, Loader2 } from "lucide-vue-next";
import { useBannersStore } from "@/stores/banners/banners";

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null },
});

const emit = defineEmits(["close"]);
const store = useBannersStore();

const submitting = ref(false);
const validationError = ref("");

const isEdit = computed(() => !!props.group);

const form = ref({
  title: "",
  description: "",
  is_active: true,
});

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      validationError.value = "";
      if (props.group) {
        form.value = {
          title: props.group.title || "",
          description: props.group.description || "",
          is_active: props.group.is_active ?? true,
        };
      } else {
        form.value = {
          title: "",
          description: "",
          is_active: true,
        };
      }
    }
  },
  { immediate: true },
);

const isValid = computed(() => {
  return form.value.title.trim() !== "";
});

const handleClose = () => {
  if (submitting.value) return;
  emit("close");
};

const submit = async () => {
  if (!isValid.value) {
    validationError.value = "Please provide a title.";
    return;
  }

  validationError.value = "";
  submitting.value = true;

  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      is_active: form.value.is_active,
    };

    if (isEdit.value) {
      await store.updateGroup(props.group.id, payload);
    } else {
      await store.createGroup(payload);
    }

    emit("close");
  } catch (error) {
    console.error("Failed to save group:", error);
    validationError.value = error?.message || "An error occurred while saving.";
  } finally {
    submitting.value = false;
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
