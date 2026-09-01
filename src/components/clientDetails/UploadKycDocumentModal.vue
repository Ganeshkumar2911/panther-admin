<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
        @click="closeModal"
      >
        <!-- Modal Card -->
        <div
          class="bg-card-background border border-primary-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden my-8 cursor-default"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
              >
                <FileUp class="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm sm:text-base">
                  {{ isEditMode ? "Edit / Replace KYC Document" : "Upload KYC Document" }}
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Upload official identity verification document
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- Body Form -->
          <div class="p-6 space-y-4 text-xs overflow-y-auto max-h-[calc(85vh-130px)]">
            <!-- Client Reference Tag -->
            <div class="bg-background border border-primary-border rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text text-[11px] font-medium">Client:</span>
              <span class="font-bold text-primary-text text-xs">
                {{ client?.name || "Client" }}
                <span class="text-primary font-mono ml-1">#{{ client?.id }}</span>
              </span>
            </div>

            <!-- 1. Document Type Dropdown -->
            <div class="flex flex-col gap-1">
              <label class="text-secondary-text text-[11px] font-semibold flex items-center gap-1">
                Document Type <span class="text-primary-red">*</span>
              </label>
              <BaseSelect
                :modelValue="form.doc_type"
                :options="docTypeOptions"
                placeholder="Select document type"
                variant="surface"
                @update:modelValue="form.doc_type = $event"
              />
            </div>

            <!-- 2. Front Image Upload -->
            <div class="flex flex-col gap-1.5">
              <label class="text-secondary-text text-[11px] font-semibold flex items-center justify-between">
                <span>Front Side Photo <span class="text-primary-red">*</span></span>
                <span class="text-[10px] text-secondary-text">JPG, PNG, WebP (Max 10MB)</span>
              </label>

              <!-- Upload Drag Zone or Preview -->
              <div
                v-if="!frontPreview"
                @click="triggerFrontInput"
                class="border-2 border-dashed border-primary-border/80 hover:border-primary rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-background/40 hover:bg-background/80 transition-all cursor-pointer group"
              >
                <div class="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-colors">
                  <Upload class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-bold text-primary-text text-xs">Click to upload front image</p>
                  <p class="text-[10px] text-secondary-text mt-0.5">or drag and drop file here</p>
                </div>
              </div>

              <!-- Front Image Preview Thumbnail -->
              <div
                v-else
                class="relative border border-primary-border rounded-xl p-3 bg-background flex items-center justify-between gap-3 group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="frontPreview"
                    alt="Front Document"
                    class="w-14 h-14 object-cover rounded-lg border border-primary-border shrink-0 bg-black/10"
                  />
                  <div class="min-w-0">
                    <p class="font-bold text-primary-text text-xs truncate">
                      {{ frontFile?.name || "Front Document" }}
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      {{ formatFileSize(frontFile?.size) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="triggerFrontInput"
                    class="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-card-background border border-primary-border rounded-lg transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    @click="removeFrontFile"
                    class="w-7 h-7 flex items-center justify-center text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove front image"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                ref="frontInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                class="hidden"
                @change="handleFrontFileChange"
              />
            </div>

            <!-- 3. Back Image Upload (Optional or recommended) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-secondary-text text-[11px] font-semibold flex items-center justify-between">
                <span>Back Side Photo <span class="text-secondary-text font-normal">(Optional for PAN/Passport)</span></span>
                <span class="text-[10px] text-secondary-text">JPG, PNG, WebP (Max 10MB)</span>
              </label>

              <!-- Upload Drag Zone or Preview -->
              <div
                v-if="!backPreview"
                @click="triggerBackInput"
                class="border-2 border-dashed border-primary-border/80 hover:border-primary rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-background/40 hover:bg-background/80 transition-all cursor-pointer group"
              >
                <div class="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-colors">
                  <Upload class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-bold text-primary-text text-xs">Click to upload back image</p>
                  <p class="text-[10px] text-secondary-text mt-0.5">or drag and drop file here</p>
                </div>
              </div>

              <!-- Back Image Preview Thumbnail -->
              <div
                v-else
                class="relative border border-primary-border rounded-xl p-3 bg-background flex items-center justify-between gap-3 group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="backPreview"
                    alt="Back Document"
                    class="w-14 h-14 object-cover rounded-lg border border-primary-border shrink-0 bg-black/10"
                  />
                  <div class="min-w-0">
                    <p class="font-bold text-primary-text text-xs truncate">
                      {{ backFile?.name || "Back Document" }}
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      {{ formatFileSize(backFile?.size) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="triggerBackInput"
                    class="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-card-background border border-primary-border rounded-lg transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    @click="removeBackFile"
                    class="w-7 h-7 flex items-center justify-center text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove back image"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                ref="backInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                class="hidden"
                @change="handleBackFileChange"
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-2.5 bg-card-background shrink-0"
          >
            <button
              type="button"
              :disabled="clientDepthStore.isUploadingDoc"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-all disabled:opacity-50 cursor-pointer"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!isValid || clientDepthStore.isUploadingDoc"
              class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              @click="handleSubmit"
            >
              <Loader2
                v-if="clientDepthStore.isUploadingDoc"
                class="w-4 h-4 animate-spin"
              />
              <span v-else>{{ isEditMode ? "Update Document" : "Submit Document" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Upload, FileUp, Trash2, Loader2 } from "lucide-vue-next";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
  existingDoc: { type: Object, default: () => null },
});

const emit = defineEmits(["close", "success"]);

const clientDepthStore = useClientDepthStore();
const snackbar = useSnackbarStore();

const isEditMode = computed(() => !!props.existingDoc?.uploaded || !!props.existingDoc?.front);

const docTypeOptions = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "PAN Card", value: "pan" },
  { label: "Passport", value: "passport" },
  { label: "Driving License", value: "driving_license" },
  { label: "Voter ID Card", value: "voter_id" },
  { label: "Utility Bill / Address Proof", value: "address_proof" },
  { label: "Selfie Photograph", value: "selfie" },
  { label: "National Identity Card", value: "national_id" },
  { label: "Other Official Document", value: "other" },
];

const form = ref({
  doc_type: "aadhaar",
});

const frontFile = ref(null);
const frontPreview = ref("");
const frontInputRef = ref(null);

const backFile = ref(null);
const backPreview = ref("");
const backInputRef = ref(null);

const resetForm = () => {
  if (props.existingDoc?.type === "address") {
    form.value.doc_type = props.existingDoc?.doc_type || "address_proof";
  } else if (props.existingDoc?.type === "selfie") {
    form.value.doc_type = props.existingDoc?.doc_type || "selfie";
  } else {
    form.value.doc_type = props.existingDoc?.doc_type || "aadhaar";
  }
  frontFile.value = null;
  frontPreview.value = props.existingDoc?.front || props.existingDoc?.doc_path?.front || "";
  backFile.value = null;
  backPreview.value = props.existingDoc?.back || props.existingDoc?.doc_path?.back || "";
};

watch(
  () => [props.open, props.existingDoc],
  ([isOpen]) => {
    if (isOpen) {
      resetForm();
    }
  },
  { immediate: true, deep: true },
);

// ─── File Handlers ────────────────────────────────────────────────────────────
const triggerFrontInput = () => {
  frontInputRef.value?.click();
};

const handleFrontFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    snackbar.show("Front image must be smaller than 10MB", "error");
    return;
  }

  frontFile.value = file;
  frontPreview.value = URL.createObjectURL(file);
};

const removeFrontFile = () => {
  frontFile.value = null;
  frontPreview.value = "";
  if (frontInputRef.value) frontInputRef.value.value = "";
};

const triggerBackInput = () => {
  backInputRef.value?.click();
};

const handleBackFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    snackbar.show("Back image must be smaller than 10MB", "error");
    return;
  }

  backFile.value = file;
  backPreview.value = URL.createObjectURL(file);
};

const removeBackFile = () => {
  backFile.value = null;
  backPreview.value = "";
  if (backInputRef.value) backInputRef.value.value = "";
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// ─── Validation & Submit ──────────────────────────────────────────────────────
const isValid = computed(() => {
  if (!form.value.doc_type) return false;
  // Must have front file OR existing front preview
  return !!frontFile.value || !!frontPreview.value;
});

const handleSubmit = () => {
  if (!isValid.value) return;
  const clientId = props.client?.id;
  if (!clientId) return;

  const payload = {
    doc_type: form.value.doc_type,
    front: frontFile.value || null,
    back: backFile.value || null,
  };

  clientDepthStore.uploadClientDocument(clientId, payload, (err, res) => {
    if (!err) {
      emit("success", {
        doc_type: form.value.doc_type,
        front: frontPreview.value,
        back: backPreview.value,
        uploaded: true,
        verification_status: "Pending",
        ...(res?.data || {}),
      });
      closeModal();
    }
  });
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
