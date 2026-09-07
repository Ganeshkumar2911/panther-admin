<template>
  <div
    class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30 min-h-[360px]"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText class="w-4 h-4" />
          </div>
          <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
            KYC Notes & Documents
          </h3>
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {{ totalItemsCount }}
          </span>
        </div>
        <p class="text-xs text-secondary-text mt-0.5">
          Internal remarks, verification logs and attached client reference files.
        </p>
      </div>

      <!-- Actions on Top Right -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filter Tabs -->
        <div class="flex items-center bg-background p-0.5 rounded-xl border border-primary-border text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            All ({{ totalItemsCount }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'notes'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'notes' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            Notes ({{ notesList.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'files'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'files' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            Docs ({{ filesList.length }})
          </button>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          @click="refreshData"
          :disabled="clientDepthStore.userReferencesLoading"
          class="w-8 h-8 rounded-xl border border-primary-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          title="Refresh references"
        >
          <RefreshCw
            class="w-3.5 h-3.5"
            :class="clientDepthStore.userReferencesLoading ? 'animate-spin text-primary' : ''"
          />
        </button>

        <!-- Add Reference Button -->
        <button
          type="button"
          @click="openAddModal"
          class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Note / Doc
        </button>
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div v-if="clientDepthStore.userReferencesLoading && filteredItems.length === 0" class="space-y-3 py-2">
        <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-primary-border/40 animate-pulse" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredItems.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <FileText class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">No KYC references yet</p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          No verification notes or reference documents have been uploaded for this client.
        </p>
        <button
          type="button"
          @click="openAddModal"
          class="mt-4 border border-primary text-primary hover:bg-primary/10 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <Plus class="w-3.5 h-3.5" />
          Add First Note or Document
        </button>
      </div>

      <!-- Table of Notes & Documents -->
      <div v-else class="border border-primary-border/80 rounded-xl overflow-hidden overflow-x-auto no-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-background/80 border-b border-primary-border/80 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              <th class="py-2.5 px-3.5">Reference Details</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Author / Uploaded By</th>
              <th class="py-2.5 px-3">Date & Time</th>
              <th class="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="item in filteredItems"
              :key="item.uniqueKey"
              class="hover:bg-background/40 transition-colors group"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-xs">
                <div class="flex items-start gap-2.5">
                  <!-- Item Icon -->
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border"
                    :class="item.isDoc ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'"
                  >
                    <component :is="item.isDoc ? FileImage : FileText" class="w-4 h-4" />
                  </div>

                  <!-- Text Preview -->
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-primary-text text-xs line-clamp-1 group-hover:text-primary transition-colors">
                      {{ item.title }}
                    </p>
                    <p class="text-[11px] text-secondary-text line-clamp-2 mt-0.5">
                      {{ item.previewText }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Type Badge -->
              <td class="py-3 px-3">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border"
                  :class="
                    item.isDoc
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  "
                >
                  <component :is="item.isDoc ? Paperclip : FileText" class="w-3 h-3" />
                  {{ item.isDoc ? 'Document' : 'Internal Note' }}
                </span>
              </td>

              <!-- Created By / Author -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {{ (item.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-primary-text text-xs truncate max-w-[120px]">
                    {{ item.author || 'Admin User' }}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td class="py-3 px-3 text-secondary-text text-[11px] font-medium whitespace-nowrap">
                {{ formatDateTime(item.created_at) }}
              </td>

              <!-- Actions (View, Edit, Delete) -->
              <td class="py-3 px-3.5 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <!-- View Button -->
                  <button
                    type="button"
                    @click="openViewModal(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                    title="View Details"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <!-- Edit Button -->
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                    title="Edit"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete Button -->
                  <button
                    type="button"
                    @click="openDeleteModal(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer shadow-2xs"
                    title="Delete"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. VIEW REFERENCE MODAL ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="viewModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
          @click="closeViewModal"
        >
          <div
            class="bg-card-background border border-primary-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden my-6 cursor-default"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-card-background">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                  :class="selectedItem?.isDoc ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'"
                >
                  <component :is="selectedItem?.isDoc ? FileImage : FileText" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ selectedItem?.isDoc ? 'KYC Reference Document' : 'KYC Internal Note' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    Created on {{ formatDateTime(selectedItem?.created_at) }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeViewModal"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <!-- Author & Date Info Banner -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-background border border-primary-border/70">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                    {{ (selectedItem?.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[10px] text-secondary-text uppercase font-semibold">Author / Uploader</p>
                    <p class="font-bold text-primary-text">{{ selectedItem?.author || 'Admin User' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">Type</p>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="selectedItem?.isDoc ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
                  >
                    {{ selectedItem?.isDoc ? 'Document Attachment' : 'Internal Note' }}
                  </span>
                </div>
              </div>

              <!-- Remarks / Note Text -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Remarks / Details
                  </span>
                  <button
                    v-if="selectedItem?.remarks"
                    type="button"
                    @click="copyToClipboard(selectedItem.remarks)"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy class="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div class="p-3.5 rounded-xl bg-background/60 border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap">
                  {{ selectedItem?.remarks || selectedItem?.previewText || 'No remarks provided.' }}
                </div>
              </div>

              <!-- Document Attachment Preview (If File) -->
              <div v-if="selectedItem?.isDoc || selectedItem?.file_url" class="space-y-2 pt-1">
                <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                  Attached File
                </span>
                
                <div class="border border-primary-border rounded-xl p-3 bg-background flex flex-col gap-3">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <File class="w-4 h-4 text-primary shrink-0" />
                      <span class="font-bold text-primary-text truncate text-xs">
                        {{ selectedItem.file_name || selectedItem.title }}
                      </span>
                    </div>
                    <a
                      v-if="selectedItem.file_url"
                      :href="selectedItem.file_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <ExternalLink class="w-3 h-3" />
                      Open File
                    </a>
                  </div>

                  <!-- Image Preview if Image -->
                  <div
                    v-if="isImageFile(selectedItem.file_name || selectedItem.file_url)"
                    class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 max-h-64 flex items-center justify-center"
                  >
                    <img
                      :src="selectedItem.file_url"
                      :alt="selectedItem.file_name"
                      class="object-contain max-h-60 w-full rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-3 border-t border-primary-border flex items-center justify-between bg-card-background">
              <button
                type="button"
                @click="openDeleteModal(selectedItem)"
                class="px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openEditModal(selectedItem)"
                  class="px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-background rounded-xl border border-primary-border transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  @click="closeViewModal"
                  class="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── 2. ADD / EDIT REFERENCE MODAL ────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="formModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
          @click="closeFormModal"
        >
          <div
            class="bg-card-background border border-primary-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden my-6 cursor-default"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-card-background">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <component :is="isEditing ? Pencil : Plus" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ isEditing ? 'Edit KYC Reference' : 'Add KYC Note / Document' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    {{ isEditing ? 'Update internal remarks or reference details.' : 'Attach remarks or upload client reference files.' }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeFormModal"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Form Body -->
            <form @submit.prevent="submitForm" class="p-5 space-y-4 text-xs">
              <!-- Remarks / Note Content -->
              <div class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Remarks / Internal Note <span class="text-rose-500">*</span>
                </label>
                <textarea
                  v-model="formRemarks"
                  rows="4"
                  placeholder="e.g. Identity verified via phone consultation, documents matched with government registry..."
                  class="w-full p-3 resize-none border border-primary-border rounded-xl bg-background text-primary-text placeholder:text-secondary-text/60 focus:outline-hidden focus:border-primary text-xs"
                  required
                ></textarea>
              </div>

              <!-- Document Attachment (Optional / File upload) -->
              <div class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Attach Reference File (Optional)
                </label>

                <!-- If File Already Selected -->
                <div
                  v-if="selectedFile"
                  class="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <File class="w-4 h-4 text-primary shrink-0" />
                    <div class="min-w-0">
                      <p class="font-bold text-primary-text truncate text-xs">{{ selectedFile.name }}</p>
                      <p class="text-[10px] text-secondary-text">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeSelectedFile"
                    class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <!-- Dropzone / Picker -->
                <div
                  v-else
                  @click="triggerFileInput"
                  class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all"
                >
                  <Upload class="w-5 h-5 text-secondary-text mb-1.5" />
                  <p class="font-bold text-primary-text text-xs">
                    Click to browse or drag file here
                  </p>
                  <p class="text-[10px] text-secondary-text mt-0.5">
                    PNG, JPG, PDF (Max. 10MB)
                  </p>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*,.pdf"
                    class="hidden"
                    @change="handleFileSelected"
                  />
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="pt-3 border-t border-primary-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  @click="closeFormModal"
                  class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="clientDepthStore.isSubmittingReference || !formRemarks.trim()"
                  class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2
                    v-if="clientDepthStore.isSubmittingReference"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <span>{{ isEditing ? 'Save Changes' : 'Add Reference' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── 3. DELETE CONFIRMATION MODAL ─────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="deleteModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
          @click="closeDeleteModal"
        >
          <div
            class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 cursor-default"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-base">Delete KYC Reference?</h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Are you sure you want to delete this reference item? This action cannot be undone.
                </p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-background border border-primary-border text-xs text-primary-text font-medium">
              {{ itemToDelete?.remarks || itemToDelete?.title || 'Selected Reference' }}
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-primary-border">
              <button
                type="button"
                @click="closeDeleteModal"
                class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDelete"
                :disabled="clientDepthStore.isDeletingReference"
                class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Loader2
                  v-if="clientDepthStore.isDeletingReference"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>Delete Reference</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import {
  FileText,
  FileImage,
  File,
  Paperclip,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  X,
  ExternalLink,
  Copy,
  AlertTriangle,
  Upload,
} from "lucide-vue-next";

const props = defineProps({
  userId: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();

const activeFilter = ref("all"); // 'all' | 'notes' | 'files'

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

// ─── Fetch References ─────────────────────────────────────────────────────────
const loadReferences = (force = false) => {
  if (currentUserId.value) {
    clientDepthStore.fetchUserReferences(currentUserId.value, force);
  }
};

onMounted(() => {
  loadReferences(true);
});

watch(
  () => currentUserId.value,
  (newId) => {
    if (newId) loadReferences(true);
  },
);

const refreshData = () => {
  loadReferences(true);
};

// ─── Resolvers for Notes & Files ──────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const notesList = computed(() => {
  const notes = rawData.value?.notes || [];
  return notes.map((n, idx) => ({
    uniqueKey: `note-${n.id || idx}`,
    id: n.id,
    isDoc: false,
    title: n.creator_name ? `${n.creator_name}'s Note` : "Internal Verification Note",
    remarks: n.remarks || n.note || n.text || "",
    previewText: n.remarks || n.note || n.text || "—",
    author: n.creator_name || n.uploaded_by_name || "Admin User",
    created_at: n.created_at || rawData.value?.created_at || new Date().toISOString(),
    raw: n,
  }));
});

const filesList = computed(() => {
  const files = rawData.value?.files || [];
  return files.map((f, idx) => ({
    uniqueKey: `file-${f.id || idx}`,
    id: f.id,
    isDoc: true,
    file_name: f.file_name || `Reference Document #${f.id || idx + 1}`,
    title: f.file_name || `Document #${f.id || idx + 1}`,
    remarks: f.remarks || f.file_name || "",
    previewText: f.path || f.file_name || "Attached document",
    file_url: f.formatted_path || f.path || null,
    author: f.uploaded_by_name || "Admin User",
    created_at: f.created_at || rawData.value?.created_at || new Date().toISOString(),
    raw: f,
  }));
});

const combinedItems = computed(() => {
  const all = [...notesList.value, ...filesList.value];
  // Sort latest first
  return all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
});

const totalItemsCount = computed(() => {
  return notesList.value.length + filesList.length;
});

const filteredItems = computed(() => {
  if (activeFilter.value === "notes") return notesList.value;
  if (activeFilter.value === "files") return filesList.value;
  return combinedItems.value;
});

// ─── Formatting Utilities ─────────────────────────────────────────────────────
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const isImageFile = (filenameOrUrl) => {
  if (!filenameOrUrl) return false;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(filenameOrUrl);
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Remarks copied to clipboard!", "success");
};

// ─── Modal States ─────────────────────────────────────────────────────────────
const selectedItem = ref(null);
const viewModalOpen = ref(false);

const openViewModal = (item) => {
  selectedItem.value = item;
  viewModalOpen.value = true;
};

const closeViewModal = () => {
  viewModalOpen.value = false;
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const formModalOpen = ref(false);
const isEditing = ref(false);
const editingItemId = ref(null);
const formRemarks = ref("");
const selectedFile = ref(null);
const fileInputRef = ref(null);

const openAddModal = () => {
  isEditing.value = false;
  editingItemId.value = null;
  formRemarks.value = "";
  selectedFile.value = null;
  formModalOpen.value = true;
};

const openEditModal = (item) => {
  if (viewModalOpen.value) closeViewModal();
  isEditing.value = true;
  editingItemId.value = item.id;
  formRemarks.value = item.remarks || item.previewText || "";
  selectedFile.value = null;
  formModalOpen.value = true;
};

const closeFormModal = () => {
  formModalOpen.value = false;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const submitForm = () => {
  if (!formRemarks.value.trim() || !currentUserId.value) return;

  // If a file is attached, send as FormData
  let payload;
  if (selectedFile.value) {
    payload = new FormData();
    payload.append("remarks", formRemarks.value.trim());
    payload.append("file", selectedFile.value);
    payload.append("user_id", currentUserId.value);
    if (isEditing.value && editingItemId.value) {
      payload.append("note_id", editingItemId.value);
      payload.append("id", editingItemId.value);
    }
  } else {
    payload = {
      remarks: formRemarks.value.trim(),
      user_id: currentUserId.value,
      ...(isEditing.value && editingItemId.value ? { note_id: editingItemId.value, id: editingItemId.value } : {}),
    };
  }

  if (isEditing.value) {
    clientDepthStore.updateUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormModal();
    });
  } else {
    clientDepthStore.addUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormModal();
    });
  }
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const deleteModalOpen = ref(false);
const itemToDelete = ref(null);

const openDeleteModal = (item) => {
  if (viewModalOpen.value) closeViewModal();
  itemToDelete.value = item;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  itemToDelete.value = null;
};

const confirmDelete = () => {
  if (!itemToDelete.value || !currentUserId.value) return;

  const payload = {
    user_id: currentUserId.value,
    id: itemToDelete.value.id,
    note_id: itemToDelete.value.isDoc ? undefined : itemToDelete.value.id,
    file_id: itemToDelete.value.isDoc ? itemToDelete.value.id : undefined,
  };

  clientDepthStore.deleteUserReference(currentUserId.value, payload, (err) => {
    if (!err) closeDeleteModal();
  });
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
