<template>
  <div class="px-4 pb-10 max-w-[1600px] mx-auto space-y-6">
    <!-- Top Navigation & Breadcrumbs -->
    <div class="flex items-center justify-between gap-4">
      <div
        class="flex items-center gap-2 text-xs font-medium text-secondary-text"
      >
        <router-link
          to="/media"
          class="flex items-center gap-1.5 hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Media Library</span>
        </router-link>
        <ChevronRight class="w-3.5 h-3.5 text-secondary-text/40" />
        <span
          class="text-primary-text font-semibold truncate max-w-[200px] sm:max-w-[300px]"
        >
          {{ store.mediaGroup?.title || "Group Images" }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card-background border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer disabled:opacity-50"
          :disabled="store.loading"
          @click="store.fetchMediaImages(groupId)"
          title="Refresh images"
        >
          <RotateCw
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
          @click="panel = { open: true, editData: null }"
        >
          <Upload class="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>
    </div>

    <!-- Hero Header Banner Card -->
    <div
      class="rounded-2xl bg-card-background border border-primary-border/80 p-6 sm:p-7"
    >
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
          >
            <FolderOpen class="w-7 h-7" />
          </div>

          <div class="space-y-1">
            <div class="flex items-center flex-wrap gap-2.5">
              <h1
                class="text-xl sm:text-2xl font-bold text-primary-text tracking-tight"
              >
                {{ store.mediaGroup?.title || "Media Folder" }}
              </h1>
              <span
                v-if="store.mediaGroup"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wider border"
                :class="
                  store.mediaGroup.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    store.mediaGroup.is_active
                      ? 'bg-primary-green'
                      : 'bg-primary-red'
                  "
                />
                {{
                  store.mediaGroup.is_active
                    ? "Active Folder"
                    : "Inactive Folder"
                }}
              </span>
            </div>

            <p
              class="text-xs sm:text-sm text-secondary-text leading-relaxed max-w-2xl"
            >
              {{
                store.mediaGroup?.description ||
                "Manage images and assets inside this media folder."
              }}
            </p>
          </div>
        </div>

        <!-- Meta Summary Stats -->
        <div
          class="flex items-center gap-3 sm:gap-4 shrink-0 bg-background/50 border border-primary-border/60 p-3 rounded-xl"
        >
          <div class="px-3 py-1 border-r border-primary-border/60 text-center">
            <p
              class="text-[10px] uppercase font-bold text-secondary-text tracking-wider"
            >
              Total Assets
            </p>
            <p class="text-base font-extrabold text-primary-text mt-0.5">
              {{ store.pagination?.total ?? store.records.length }}
            </p>
          </div>

          <div class="px-3 py-1 text-center">
            <p
              class="text-[10px] uppercase font-bold text-secondary-text tracking-wider"
            >
              Created
            </p>
            <p class="text-xs font-semibold text-primary-text mt-1">
              {{ formatDate(store.mediaGroup?.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Bar (Search, Status Filters, View Mode) -->
    <div
      class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card-background/60 border border-primary-border/70 p-3 rounded-2xl"
    >
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search images by title or description..."
          class="w-full pl-9 pr-8 py-2 bg-background border border-primary-border/80 rounded-xl text-xs text-primary-text placeholder:text-secondary-text/70 focus:outline-none focus:border-primary transition-colors"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Right Controls: Status Pills & View Switcher -->
      <div
        class="flex items-center justify-between sm:justify-end gap-3 shrink-0"
      >
        <!-- Status Filter -->
        <div
          class="flex items-center bg-background border border-primary-border/80 p-0.5 rounded-xl"
        >
          <button
            v-for="status in ['all', 'active', 'inactive']"
            :key="status"
            type="button"
            class="px-2.5 py-1 text-[11px] font-semibold capitalize rounded-lg transition-all cursor-pointer"
            :class="
              statusFilter === status
                ? 'bg-primary text-white font-bold'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="statusFilter = status"
          >
            {{ status }}
          </button>
        </div>

        <!-- View Switcher (Grid vs List) -->
        <div
          class="flex items-center bg-background border border-primary-border/80 p-0.5 rounded-xl"
        >
          <button
            type="button"
            class="p-1.5 rounded-lg transition-all cursor-pointer"
            :class="
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="viewMode = 'grid'"
            title="Grid View"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg transition-all cursor-pointer"
            :class="
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="viewMode = 'list'"
            title="List View"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="store.loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden animate-pulse"
      >
        <div class="aspect-video bg-background/80" />
        <div class="p-4 space-y-2.5">
          <div class="h-4 w-32 bg-background rounded-md" />
          <div class="h-3 w-full bg-background rounded-md" />
          <div class="h-8 w-full bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredImages.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-20 bg-card-background/40 border border-dashed border-primary-border rounded-2xl"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
      >
        <ImageIcon class="w-8 h-8 opacity-60" />
      </div>
      <div class="text-center max-w-sm px-4">
        <h3 class="text-base font-bold text-primary-text">
          {{
            searchQuery || statusFilter !== "all"
              ? "No matching images found"
              : "No images in this folder yet"
          }}
        </h3>
        <p class="text-xs text-secondary-text mt-1 leading-relaxed">
          {{
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search query or filter settings."
              : "Upload image files to start managing assets in this media group."
          }}
        </p>
      </div>

      <button
        v-if="!searchQuery && statusFilter === 'all'"
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
        @click="panel = { open: true, editData: null }"
      >
        <Upload class="w-4 h-4" />
        <span>Upload First Image</span>
      </button>

      <button
        v-else
        type="button"
        class="px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
        @click="
          searchQuery = '';
          statusFilter = 'all';
        "
      >
        Reset Filters
      </button>
    </div>

    <!-- GRID VIEW -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="img in filteredImages"
        :key="img.id"
        class="group relative bg-card-background border border-primary-border/80 hover:border-primary/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      >
        <!-- Image Container with Hover Overlay -->
        <div
          class="relative aspect-[4/3] bg-black/60 overflow-hidden cursor-pointer"
          @click="preview = { open: true, image: img }"
        >
          <img
            :src="img.image_url"
            :alt="img.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <!-- Dark Overlay on Hover -->
          <div
            class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5"
          >
            <!-- Top Row Badges -->
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                :class="
                  img.is_active
                    ? 'bg-primary-green/20 text-primary-green border-primary-green/30'
                    : 'bg-primary-red/20 text-primary-red border-primary-red/30'
                "
              >
                {{ img.is_active ? "Active" : "Inactive" }}
              </span>

              <span
                class="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-md border border-white/10"
              >
                #{{ img.id }}
              </span>
            </div>

            <!-- Hover Action Buttons Bar -->
            <div class="flex items-center justify-center gap-2">
              <button
                type="button"
                class="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="preview = { open: true, image: img }"
                title="Preview Image"
              >
                <Eye class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="panel = { open: true, editData: img }"
                title="Edit Image Details"
              >
                <Pencil class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-primary-red/80 hover:bg-primary-red text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="deleteDialog = { open: true, image: img }"
                title="Delete Image"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Non-hover status pill indicator -->
          <div
            class="absolute top-2.5 right-2.5 group-hover:opacity-0 transition-opacity"
          >
            <span
              class="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
              :class="img.is_active ? 'bg-primary-green' : 'bg-primary-red'"
            />
          </div>
        </div>

        <!-- Card Details Content -->
        <div
          class="p-4 flex flex-col gap-3 flex-1 justify-between bg-card-background"
        >
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-xs sm:text-sm font-bold text-primary-text truncate"
                :title="img.title"
              >
                {{ img.title }}
              </h3>
            </div>

            <p
              v-if="img.description"
              class="text-[11.5px] text-secondary-text line-clamp-2 leading-relaxed"
            >
              {{ img.description }}
            </p>
            <p v-else class="text-[11px] italic text-secondary-text/50">
              No description
            </p>
          </div>

          <div class="space-y-2 pt-2 border-t border-primary-border/60">
            <!-- URL Copy Pill -->
            <URLCopyButton :url="img.image_url" />

            <div
              class="flex items-center justify-between text-[10.5px] text-secondary-text/80 pt-1"
            >
              <span class="flex items-center gap-1">
                <CalendarDays class="w-3 h-3 text-secondary-text" />
                {{ formatDate(img.created_at) }}
              </span>

              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  @click="panel = { open: true, editData: img }"
                >
                  Edit
                </button>
                <span class="text-secondary-text/40">•</span>
                <button
                  type="button"
                  class="text-xs font-semibold text-primary-red hover:underline cursor-pointer"
                  @click="deleteDialog = { open: true, image: img }"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST / TABLE VIEW -->
    <div
      v-else
      class="bg-card-background border border-primary-border/80 rounded-2xl overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-primary-text">
          <thead
            class="bg-background/80 border-b border-primary-border text-[11px] uppercase tracking-wider text-secondary-text font-bold"
          >
            <tr>
              <th class="py-3.5 px-4">Preview</th>
              <th class="py-3.5 px-4">Title & Description</th>
              <th class="py-3.5 px-4">Direct URL</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4">Created Date</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="img in filteredImages"
              :key="img.id"
              class="hover:bg-primary/[0.02] transition-colors group"
            >
              <!-- Thumbnail -->
              <td class="py-3 px-4 shrink-0">
                <div
                  class="w-14 h-11 rounded-lg bg-black/40 overflow-hidden border border-primary-border/80 cursor-pointer shrink-0 relative group/thumb"
                  @click="preview = { open: true, image: img }"
                >
                  <img
                    :src="img.image_url"
                    :alt="img.title"
                    class="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Eye class="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </td>

              <!-- Title & Description -->
              <td class="py-3 px-4 min-w-[200px]">
                <p class="font-bold text-primary-text text-xs">
                  {{ img.title }}
                </p>
                <p
                  v-if="img.description"
                  class="text-[11px] text-secondary-text line-clamp-1 mt-0.5"
                >
                  {{ img.description }}
                </p>
              </td>

              <!-- Direct URL -->
              <td class="py-3 px-4 min-w-[240px]">
                <URLCopyButton :url="img.image_url" />
              </td>

              <!-- Status -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                  :class="
                    img.is_active
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      img.is_active ? 'bg-primary-green' : 'bg-primary-red'
                    "
                  />
                  {{ img.is_active ? "Active" : "Inactive" }}
                </span>
              </td>

              <!-- Created Date -->
              <td
                class="py-3 px-4 text-secondary-text whitespace-nowrap text-[11px]"
              >
                {{ formatDate(img.created_at) }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg border border-primary-border/80 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    @click="preview = { open: true, image: img }"
                    title="Preview Image"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    class="p-1.5 rounded-lg border border-primary-border/80 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    @click="panel = { open: true, editData: img }"
                    title="Edit Image"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    class="p-1.5 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red hover:bg-primary-red/20 transition-colors cursor-pointer"
                    @click="deleteDialog = { open: true, image: img }"
                    title="Delete Image"
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

    <!-- Pagination -->
    <div class="pt-2">
      <Pagination
        v-if="store.pagination.total > store.pagination.per_page"
        :pagination="{
          page: store.pagination.page,
          per_page: store.pagination.per_page,
          total_items: store.pagination.total,
          total_pages: store.pagination.pages,
        }"
        @page-change="(page) => store.changePage(groupId, page)"
      />
    </div>

    <!-- Dialogs -->
    <MediaImageDialog
      :open="panel.open"
      :edit-data="panel.editData"
      :group-id="groupId"
      @close="panel = { open: false, editData: null }"
    />
    <DeleteMediaDialog
      :open="deleteDialog.open"
      :image="deleteDialog.image"
      :group-id="groupId"
      @close="deleteDialog = { open: false, image: null }"
    />
    <ImagePreviewDialog
      :open="preview.open"
      :image="preview.image"
      @close="preview = { open: false, image: null }"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  RotateCw,
  Search,
  X,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-vue-next";
import { useMediaImagesStore } from "@/stores/media/mediaImages";
import Pagination from "@/components/common/Pagination.vue";
import MediaImageDialog from "@/components/media/MediaImageDialog.vue";
import DeleteMediaDialog from "@/components/media/DeleteMediaDialog.vue";
import ImagePreviewDialog from "@/components/media/ImagePreviewDialog.vue";
import URLCopyButton from "@/components/media/URLCopyButton.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = useMediaImagesStore();
const route = useRoute();
const groupId = route.params.groupId;

const panel = ref({ open: false, editData: null });
const deleteDialog = ref({ open: false, image: null });
const preview = ref({ open: false, image: null });

const searchQuery = ref("");
const statusFilter = ref("all");
const viewMode = ref("grid");

const filteredImages = computed(() => {
  return (store.records || []).filter((img) => {
    // Search Filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchTitle = (img.title || "").toLowerCase().includes(q);
      const matchDesc = (img.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Status Filter
    if (statusFilter.value === "active" && !img.is_active) return false;
    if (statusFilter.value === "inactive" && img.is_active) return false;

    return true;
  });
});

onMounted(() => {
  store.fetchMediaImages(groupId);
});
</script>
