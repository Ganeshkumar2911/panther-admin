<template>
  <div
    class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 flex flex-col justify-between min-h-[360px]"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <FileText class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
              Remarks
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                {{ notesList.length }}
              </span>
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
            Internal staff notes.
          </p>
          </div>
        </div>
      </div>

      <!-- Actions on Top Right -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Add Note Button (Opens Side Drawer) -->
        <button
          type="button"
          @click="openAddDrawer"
          class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Note
        </button>
                <!-- Refresh Button -->
        <button
          type="button"
          @click="refreshData"
          :disabled="clientDepthStore.userReferencesLoading"
          class="w-8 h-8 rounded-xl border border-primary-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          title="Refresh notes"
        >
          <RefreshCw
            class="w-3.5 h-3.5"
            :class="clientDepthStore.userReferencesLoading ? 'animate-spin text-primary' : ''"
          />
        </button>
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div v-if="clientDepthStore.userReferencesLoading && notesList.length === 0" class="space-y-3 py-2">
        <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-primary-border/40 animate-pulse" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="notesList.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
          <FileText class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">No KYC notes yet</p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          No verification remarks or audit notes have been logged for this client.
        </p>
        <button
          type="button"
          @click="openAddDrawer"
          class="mt-4 border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <Plus class="w-3.5 h-3.5" />
          Add First Note
        </button>
      </div>

      <!-- Table of Notes (Scrollable with sticky header) -->
      <div v-else class="border border-primary-border/80 rounded-lg overflow-x-auto overflow-y-auto max-h-[380px] flex-1 no-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10 bg-card-background border-b border-primary-border/80">
            <tr class="bg-card-background text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              <th class="py-2.5 px-3.5 bg-card-background">Note / Remark</th>
              <th class="py-2.5 px-3 bg-card-background">Author</th>
              <th class="py-2.5 px-3 bg-card-background">Date & Time</th>
              <th class="py-2.5 px-3.5 text-right bg-card-background">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="note in notesList"
              :key="note.uniqueKey"
              class="hover:bg-background/40 transition-colors group cursor-pointer"
              @click="openViewDrawer(note)"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-sm">
                <div class="flex items-start gap-2.5">
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-primary-text text-xs group-hover:text-primary transition-colors truncate">
                      {{ note.title }}
                    </p>
                    <p class="text-[11px] text-secondary-text line-clamp-2 mt-0.5">
                      {{ note.remarks || '—' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Created By / Author -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {{ (note.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-primary-text text-xs truncate max-w-[120px]">
                    {{ note.author || 'Admin User' }}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td class="py-3 px-3 text-secondary-text text-[11px] font-medium whitespace-nowrap">
                {{ formatDateTime(note.created_at) }}
              </td>

              <!-- Actions (Three-dot DropdownMenu) -->
              <td class="py-2.5 px-3.5 text-right whitespace-nowrap" @click.stop>
                <div class="inline-flex justify-end">
                  <DropdownMenu
                    :items="getNoteActions(note)"
                    position="bottom-end"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. VIEW NOTE DRAWER (Slide from Right) ────────────────── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="viewDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeViewDrawer"
        >
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-lg h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <FileText class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    KYC Internal Note
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    Logged on {{ formatDateTime(selectedNote?.created_at) }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeViewDrawer"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-card-background">
              <!-- Author Banner -->
              <div class="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary-border">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {{ (selectedNote?.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[10px] text-secondary-text uppercase font-semibold">Author</p>
                    <p class="font-bold text-primary-text text-xs">{{ selectedNote?.author || 'Admin User' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">Type</p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Internal Note
                  </span>
                </div>
              </div>

              <!-- Note Remarks Content -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Note / Remarks Content
                  </span>
                  <button
                    v-if="selectedNote?.remarks"
                    type="button"
                    @click="copyToClipboard(selectedNote.remarks)"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy class="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div class="p-4 rounded-xl bg-background border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap min-h-[120px]">
                  {{ selectedNote?.remarks || 'No remarks provided.' }}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <button
                type="button"
                @click="openDeleteModal(selectedNote)"
                class="px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </button>
              <div class="flex items-center gap-2.5">
                <button
                  type="button"
                  @click="openEditDrawer(selectedNote)"
                  class="px-4 py-2 text-xs font-semibold text-primary hover:bg-background rounded-xl border border-primary-border transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  @click="closeViewDrawer"
                  class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── 2. ADD / EDIT NOTE DRAWER (Slide from Right) ─────────── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="formDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeFormDrawer"
        >
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-lg h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <component :is="isEditing ? Pencil : Plus" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ isEditing ? 'Edit KYC Note' : 'Add KYC Internal Note' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    Log verification remarks, client conversation summary or audit observations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeFormDrawer"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Drawer Form Body -->
            <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 space-y-4.5 text-xs bg-card-background">
              <!-- Quick Suggestion Tags -->
              <div class="space-y-1.5">
                <p class="text-[10px] font-semibold text-secondary-text">Quick Note Templates:</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="template in noteTemplates"
                    :key="template"
                    type="button"
                    @click="insertTemplate(template)"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-medium border bg-background border-primary-border text-secondary-text hover:border-emerald-500 hover:text-emerald-500 transition cursor-pointer"
                  >
                    + {{ template }}
                  </button>
                </div>
              </div>

              <!-- Note / Remarks Textarea -->
              <div class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Remarks / Internal Notes <span class="text-primary-red">*</span>
                </label>
                <textarea
                  v-model="formRemarks"
                  rows="6"
                  placeholder="e.g. Identity verified via telephonic consultation, government registry match confirmed..."
                  class="w-full p-3.5 resize-none border border-primary-border rounded-xl bg-background text-primary-text placeholder:text-secondary-text/60 focus:outline-hidden focus:border-emerald-500 text-xs leading-relaxed font-medium"
                  required
                ></textarea>
                <p class="text-[10px] text-secondary-text">
                  This note will be saved in the client audit history with your account as author.
                </p>
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 border-t border-primary-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  @click="closeFormDrawer"
                  class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="clientDepthStore.isSubmittingReference || !formRemarks.trim()"
                  class="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2
                    v-if="clientDepthStore.isSubmittingReference"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <span>{{ isEditing ? 'Save Changes' : 'Submit Note' }}</span>
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
                <h3 class="font-bold text-primary-text text-base">Delete KYC Note?</h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Are you sure you want to delete this internal note?
                </p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-background border border-primary-border text-xs text-primary-text font-medium">
              <p class="text-[11px] text-secondary-text line-clamp-3">{{ itemToDelete?.remarks || '—' }}</p>
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
                <span>Delete Note</span>
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
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  X,
  Copy,
  AlertTriangle,
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

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

// Quick note templates
const noteTemplates = [
  "Identity verified via official document",
  "Address proof matched with utility bill",
  "Requested updated identity documents",
  "Risk cleared by compliance officer",
  "Pending client phone verification",
];

const insertTemplate = (tpl) => {
  if (!formRemarks.value.trim()) {
    formRemarks.value = tpl;
  } else {
    formRemarks.value += `\n${tpl}`;
  }
};

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

// ─── Resolvers for Notes ──────────────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const notesList = computed(() => {
  const notes = rawData.value?.notes || [];
  return notes
    .map((n, idx) => ({
      uniqueKey: `note-${n.id || idx}`,
      id: n.id,
      isDoc: false,
      title: n.creator_name ? `${n.creator_name}'s Note` : "Internal Verification Note",
      remarks: n.remarks || n.note || n.text || "",
      author: n.creator_name || n.uploaded_by_name || "Admin User",
      created_at: n.created_at || rawData.value?.created_at || new Date().toISOString(),
      raw: n,
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
});

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

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Note copied to clipboard!", "success");
};

// ─── View Drawer State ────────────────────────────────────────────────────────
const selectedNote = ref(null);
const viewDrawerOpen = ref(false);

const openViewDrawer = (note) => {
  selectedNote.value = note;
  viewDrawerOpen.value = true;
};

const closeViewDrawer = () => {
  viewDrawerOpen.value = false;
};

// ─── Note Dropdown Actions ───────────────────────────────────────────────────
const getNoteActions = (note) => [
  {
    id: "view",
    label: "View Note",
    icon: Eye,
    handler: () => openViewDrawer(note),
  },
  {
    id: "edit",
    label: "Edit Note",
    icon: Pencil,
    handler: () => openEditDrawer(note),
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    danger: true,
    handler: () => openDeleteModal(note),
  },
];

// ─── Add / Edit Drawer State ──────────────────────────────────────────────────
const formDrawerOpen = ref(false);
const isEditing = ref(false);
const editingItemId = ref(null);
const formRemarks = ref("");

const openAddDrawer = () => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = false;
  editingItemId.value = null;
  formRemarks.value = "";
  formDrawerOpen.value = true;
};

const openEditDrawer = (note) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = true;
  editingItemId.value = note.id;
  formRemarks.value = note.remarks || "";
  formDrawerOpen.value = true;
};

const closeFormDrawer = () => {
  formDrawerOpen.value = false;
};

// Submit Note Form
const submitForm = () => {
  if (!currentUserId.value || !formRemarks.value.trim()) return;

  const payload = {
    user_id: currentUserId.value,
    remarks: formRemarks.value.trim(),
    ...(isEditing.value && editingItemId.value ? { id: editingItemId.value, note_id: editingItemId.value } : {}),
  };

  if (isEditing.value) {
    clientDepthStore.updateUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormDrawer();
    });
  } else {
    clientDepthStore.addUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormDrawer();
    });
  }
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const deleteModalOpen = ref(false);
const itemToDelete = ref(null);

const openDeleteModal = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
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
    note_id: itemToDelete.value.id,
  };

  clientDepthStore.deleteUserReference(currentUserId.value, payload, (err) => {
    if (!err) closeDeleteModal();
  });
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .transform,
.drawer-fade-leave-active .transform {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .transform,
.drawer-fade-leave-to .transform {
  transform: translateX(100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
