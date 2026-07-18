<template>
  <Teleport to="body">
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
              <Image class="w-4 h-4 text-primary" />
              <div>
                <h2 class="text-sm font-semibold text-primary-text">
                  {{ isEdit ? "Edit Banner" : "Create Banner" }}
                </h2>
                <p class="text-[11px] text-secondary-text mt-0.5">
                  {{
                    isEdit
                      ? `Editing: ${form.title}`
                      : `Adding to ${groupTitle}`
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

            <!-- Title -->
            <div>
              <label
                class="block text-xs font-medium text-secondary-text mb-1.5"
                >Banner Title <span class="text-primary-red">*</span></label
              >
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Summer Sale"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>

            <!-- Description -->
            <div>
              <label
                class="block text-xs font-medium text-secondary-text mb-1.5"
                >Description</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Enter details about this banner..."
                :disabled="submitting"
                class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
              />
            </div>

            <!-- Image Upload -->
            <div>
              <label
                class="block text-xs font-medium text-secondary-text mb-1.5"
                >Image <span class="text-primary-red">*</span></label
              >
              <input
                type="file"
                accept="image/*"
                ref="fileInputRef"
                @change="handleImageChange"
                :disabled="submitting"
                class="w-full text-xs text-primary-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors disabled:opacity-50"
              />
              <div
                v-if="imagePreview"
                class="mt-3 relative rounded-lg overflow-hidden border border-primary-border bg-background flex items-center justify-center min-h-[100px] max-h-[160px] group/preview"
              >
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="max-w-full max-h-[160px] object-contain"
                  @error="imageError = true"
                  @load="imageError = false"
                  v-if="!imageError"
                />
                <div
                  v-else
                  class="text-[10px] text-secondary-text flex flex-col items-center gap-1"
                >
                  <ImageOff class="w-6 h-6 opacity-50" />
                  <span>Failed to load image preview</span>
                </div>

                <!-- Remove Image Button -->
                <button
                  type="button"
                  class="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center transition-opacity opacity-0 group-hover/preview:opacity-100"
                  @click="handleRemoveImage"
                  title="Remove Image"
                >
                  <X class="w-3.5 h-3.5 text-white" />
                </button>
              </div>
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
                  Control whether this banner is visible
                </p>
              </div>
              <button
                type="button"
                :disabled="submitting"
                @click="form.is_active = !form.is_active"
                class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
                :class="
                  form.is_active ? 'bg-primary-green' : 'bg-primary-border'
                "
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
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Image, ImageOff, X, Loader2 } from "lucide-vue-next";
import { useBannersStore } from "@/stores/banners/banners";

const props = defineProps({
  open: { type: Boolean, default: false },
  groupId: { type: [Number, String], required: true },
  groupTitle: { type: String, default: "" },
  banner: { type: Object, default: null },
});

const emit = defineEmits(["close"]);
const store = useBannersStore();

const submitting = ref(false);
const validationError = ref("");
const imageError = ref(false);

const isEdit = computed(() => !!props.banner);

const form = ref({
  title: "",
  description: "",
  image: null,
  is_active: true,
});

const imagePreview = ref("");
const fileInputRef = ref(null);

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
    imageError.value = false;
  } else {
    form.value.image = null;
    imagePreview.value = isEdit.value ? props.banner.image_url : "";
  }
};

const handleRemoveImage = () => {
  form.value.image = null;
  imagePreview.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      validationError.value = "";
      imageError.value = false;
      if (props.banner) {
        form.value = {
          title: props.banner.title || "",
          description: props.banner.description || "",
          image: null,
          is_active: props.banner.is_active ?? true,
        };
        imagePreview.value = props.banner.image_url || "";
      } else {
        form.value = {
          title: "",
          description: "",
          image: null,
          is_active: true,
        };
        imagePreview.value = "";
      }
    }
  },
  { immediate: true },
);

const isValid = computed(() => {
  if (!form.value.title.trim()) return false;
  if (!isEdit.value && !form.value.image) return false;
  return true;
});

const handleClose = () => {
  if (submitting.value) return;
  emit("close");
};

const submit = async () => {
  if (!isValid.value) {
    validationError.value = "Please provide a title and an image.";
    return;
  }

  validationError.value = "";
  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append("group_id", props.groupId);
    formData.append("title", form.value.title.trim());
    if (form.value.description) {
      formData.append("description", form.value.description.trim());
    }
    formData.append("is_active", form.value.is_active);

    if (form.value.image) {
      formData.append("image", form.value.image);
    }

    if (isEdit.value) {
      // API expects the banner ID to update, maybe look_up_key
      formData.append("banner_id", props.banner.id);
      await store.updateBanner(props.groupId, props.banner.id, formData);
    } else {
      await store.createBanner(props.groupId, formData);
    }

    emit("close");
  } catch (error) {
    console.error("Failed to save banner:", error);
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
