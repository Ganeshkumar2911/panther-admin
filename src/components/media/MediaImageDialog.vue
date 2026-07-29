<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <div class="flex-1 bg-black/40" @click="emit('close')" />
      <div
        class="w-full max-w-md bg-card-background border-l border-primary-border flex flex-col h-full"
      >
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{ isEdit ? "Edit Image" : "Upload Image" }}
            </h2>
            <p class="text-[11px] text-secondary-text mt-0.5">
              {{
                isEdit
                  ? "Update image details"
                  : "Add a new image to this group"
              }}
            </p>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <!-- Image Upload -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">
              Image{{ !isEdit ? " *" : "" }}
            </p>
            <label class="block cursor-pointer">
              <div
                class="border-2 border-dashed border-primary-border rounded-xl overflow-hidden transition-colors hover:border-primary/50"
                :class="previewUrl ? 'p-0' : 'p-6'"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  class="w-full h-48 object-cover"
                />
                <div
                  v-else
                  class="flex flex-col items-center gap-2 text-center"
                >
                  <ImageIcon class="w-8 h-8 text-secondary-text opacity-50" />
                  <p class="text-xs text-secondary-text">
                    Click to select image
                  </p>
                  <p class="text-[10px] text-secondary-text opacity-60">
                    PNG, JPG, WEBP
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
            </label>
            <button
              v-if="previewUrl"
              class="mt-2 text-[11px] text-secondary-text hover:text-primary-red transition-colors"
              @click="clearImage"
            >
              Remove image
            </button>
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">
              Title <span class="text-primary-red">*</span>
            </p>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. Summer Promo Banner"
              :disabled="store.actionLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">Description</p>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Optional description..."
              :disabled="store.actionLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
            />
          </div>

          <div
            v-if="isEdit"
            class="flex items-center justify-between px-3 py-2.5 bg-background border border-primary-border rounded-lg"
          >
            <div>
              <p class="text-xs font-medium text-primary-text">Active</p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="
                form.is_active
                  ? 'bg-primary'
                  : 'border border-primary-border bg-background'
              "
              @click="form.is_active = !form.is_active"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background"
        >
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="store.actionLoading || !isValid"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="submit"
          >
            <Loader2
              v-if="store.actionLoading"
              class="w-3.5 h-3.5 animate-spin"
            />
            <span>{{
              store.actionLoading ? "Saving..." : isEdit ? "Update" : "Upload"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Loader2, Image as ImageIcon } from "lucide-vue-next";
import { useMediaImagesStore } from "@/stores/media/mediaImages";

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  groupId: { type: [String, Number], required: true },
});
const emit = defineEmits(["close"]);
const store = useMediaImagesStore();

const isEdit = computed(() => !!props.editData);
const form = ref({ title: "", description: "", is_active: true, image: null });
const previewUrl = ref(null);

const isValid = computed(
  () => form.value.title.trim() && (isEdit.value || form.value.image),
);

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        title: props.editData?.title ?? "",
        description: props.editData?.description ?? "",
        is_active: props.editData?.is_active ?? true,
        image: null,
      };
      previewUrl.value = props.editData?.image_url ?? null;
    }
  },
);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.image = file;
  previewUrl.value = URL.createObjectURL(file);
};

const clearImage = () => {
  form.value.image = null;
  previewUrl.value = props.editData?.image_url ?? null;
};

const submit = () => {
  if (isEdit.value)
    store.updateImage(props.groupId, props.editData.id, form.value, () =>
      emit("close"),
    );
  else store.uploadImage(props.groupId, form.value, () => emit("close"));
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
