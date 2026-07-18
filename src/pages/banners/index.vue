<template>
  <div class="px-4 pb-8">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 class="text-lg font-bold text-primary-text">Banners</h1>
        <p class="text-xs text-secondary-text mt-1">Manage banner groups and banners</p>
      </div>
      <button
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95"
        @click="handleOpenCreateGroup"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Group
      </button>
    </div>

    <!-- Skeleton Cards -->
    <div v-if="store.loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-xl p-5 animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-5 w-32 bg-background rounded" />
          <div class="h-8 w-24 bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.records.length === 0" class="flex flex-col items-center gap-4 py-20">
      <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
        <LayoutGrid class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No banner groups found</p>
        <p class="text-xs text-secondary-text mt-1">Create a group to start adding banners.</p>
      </div>
    </div>

    <!-- Groups List -->
    <div v-else class="space-y-4">
      <div
        v-for="group in store.records"
        :key="group.id"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden transition-all duration-300"
      >
        <!-- Group Header (always visible) -->
        <div class="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors" @click="toggleExpand(group.id)">
          <div class="flex items-center gap-3">
            <button class="w-6 h-6 flex items-center justify-center rounded-md bg-background border border-primary-border text-secondary-text hover:text-primary transition-colors focus:outline-none shrink-0" @click.stop="toggleExpand(group.id)">
              <ChevronDown v-if="expandedGroups.includes(group.id)" class="w-4 h-4" />
              <ChevronRight v-else class="w-4 h-4" />
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-primary-text">{{ group.title }}</h3>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase"
                  :class="group.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                >
                  {{ group.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p v-if="group.description" class="text-[11px] text-secondary-text mt-0.5">{{ group.description }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 ml-9 sm:ml-0" @click.stop>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-primary-border hover:border-primary/40 text-xs font-medium text-secondary-text hover:text-primary transition-all active:scale-95"
              @click="handleOpenCreateBanner(group)"
            >
              <Plus class="w-3 h-3" /> Add Banner
            </button>
            <div class="w-px h-4 bg-primary-border mx-1 hidden sm:block"></div>
            
            <!-- Group Actions -->
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              title="Edit Group"
              @click="handleOpenEditGroup(group)"
            >
              <Pencil class="w-3.5 h-3.5 text-secondary-text hover:text-primary" />
            </button>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              title="Delete Group"
              @click="confirmDeleteGroup(group)"
              :disabled="store.updateLoading && deletingGroupId === group.id"
            >
              <Loader2 v-if="store.updateLoading && deletingGroupId === group.id" class="w-3.5 h-3.5 text-primary-red animate-spin" />
              <Trash2 v-else class="w-3.5 h-3.5 text-secondary-text hover:text-primary-red" />
            </button>
            <button
              type="button"
              title="Toggle Group Status"
              :disabled="store.updateLoading && togglingGroupId === group.id"
              @click="toggleGroupStatus(group)"
              class="relative w-9 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none ml-1"
              :class="group.is_active ? 'bg-primary-green' : 'bg-primary-border'"
            >
              <span
                v-if="!(store.updateLoading && togglingGroupId === group.id)"
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                :class="group.is_active ? 'translate-x-4' : 'translate-x-0'"
              />
              <Loader2
                v-else
                class="absolute inset-0 m-auto w-3 h-3 text-white animate-spin"
              />
            </button>
          </div>
        </div>

        <!-- Expanded Content (Banners) -->
        <div v-show="expandedGroups.includes(group.id)" class="border-t border-primary-border/50 bg-background/10 p-4 sm:p-5">
          <div v-if="!group.banners || group.banners.length === 0" class="text-center py-6 text-secondary-text text-xs italic bg-background/30 rounded-xl border border-primary-border/30 dashed">
            No banners added to this group yet.
          </div>
          
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Banner Item -->
            <div
              v-for="banner in group.banners"
              :key="banner.id"
              class="bg-card-background border border-primary-border rounded-xl p-3 flex flex-col hover:border-primary/40 transition-colors group/banner relative"
            >
              <!-- Image -->
              <div class="relative w-full h-32 bg-background rounded-lg mb-3 overflow-hidden border border-primary-border/50 flex items-center justify-center">
                <img v-if="banner.image_url" :src="banner.image_url" alt="Banner" class="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-500" @error="handleImageError" />
                <div v-else class="text-secondary-text/50"><ImageOff class="w-6 h-6" /></div>
                
                <!-- Status Overlay -->
                <div class="absolute top-2 left-2 flex gap-1">
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md uppercase shadow-sm"
                    :class="banner.is_active ? 'bg-primary-green/80 text-white' : 'bg-black/60 text-white'"
                  >
                    {{ banner.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              
              <!-- Info & Actions -->
              <div class="flex items-start justify-between gap-2 mt-auto">
                <div class="min-w-0">
                  <h4 class="text-xs font-semibold text-primary-text truncate" :title="banner.title">{{ banner.title }}</h4>
                  <p class="text-[10px] text-secondary-text truncate mt-0.5" :title="banner.description">{{ banner.description || 'No description' }}</p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-background transition-colors" title="Edit Banner" @click="handleOpenEditBanner(group, banner)">
                    <Pencil class="w-3 h-3 text-secondary-text hover:text-primary" />
                  </button>
                  <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-background transition-colors" title="Delete Banner" @click="confirmDeleteBanner(group, banner)" :disabled="store.updateLoading && deletingBannerId === banner.id">
                    <Trash2 class="w-3 h-3 text-secondary-text hover:text-primary-red" />
                  </button>
                  <button
                    type="button"
                    title="Toggle Status"
                    :disabled="store.updateLoading && togglingBannerId === banner.id"
                    @click="toggleBannerStatus(group, banner)"
                    class="relative w-7 h-4 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ml-1"
                    :class="banner.is_active ? 'bg-primary' : 'bg-primary-border'"
                  >
                    <span
                      v-if="!(store.updateLoading && togglingBannerId === banner.id)"
                      class="absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform duration-200"
                      :class="banner.is_active ? 'translate-x-3' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <EditBannerGroupDialog
      :open="isGroupDialogOpen"
      :group="selectedGroup"
      @close="isGroupDialogOpen = false"
    />
    
    <EditBannerDialog
      :open="isBannerDialogOpen"
      :groupId="selectedGroupId"
      :groupTitle="selectedGroupTitle"
      :banner="selectedBanner"
      @close="isBannerDialogOpen = false"
    />

    <ConfirmationDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      :loading="confirmDialog.loading"
      confirmText="Delete"
      @confirm="handleConfirm"
      @cancel="confirmDialog.open = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Plus, LayoutGrid, ChevronDown, ChevronRight, Pencil, Trash2, Loader2, ImageOff } from 'lucide-vue-next'
import { useBannersStore } from '@/stores/banners/banners'
import EditBannerGroupDialog from '@/components/banners/EditBannerGroupDialog.vue'
import EditBannerDialog from '@/components/banners/EditBannerDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'

const store = useBannersStore()

// State
const expandedGroups = ref([])

// Dialog States
const isGroupDialogOpen = ref(false)
const selectedGroup = ref(null)

const isBannerDialogOpen = ref(false)
const selectedGroupId = ref(null)
const selectedGroupTitle = ref('')
const selectedBanner = ref(null)

// Action Loading States
const togglingGroupId = ref(null)
const deletingGroupId = ref(null)
const togglingBannerId = ref(null)
const deletingBannerId = ref(null)

// Confirmation Dialog State
const confirmDialog = ref({
  open: false,
  title: '',
  message: '',
  type: 'danger',
  loading: false,
  action: null
})

const handleConfirm = async () => {
  if (!confirmDialog.value.action) return
  confirmDialog.value.loading = true
  try {
    await confirmDialog.value.action()
  } finally {
    confirmDialog.value.loading = false
    confirmDialog.value.open = false
  }
}

onMounted(() => {
  store.fetchBanners()
})

const toggleExpand = (groupId) => {
  const index = expandedGroups.value.indexOf(groupId)
  if (index === -1) {
    expandedGroups.value.push(groupId)
  } else {
    expandedGroups.value.splice(index, 1)
  }
}

// Group Actions
const handleOpenCreateGroup = () => {
  selectedGroup.value = null
  isGroupDialogOpen.value = true
}

const handleOpenEditGroup = (group) => {
  selectedGroup.value = group
  isGroupDialogOpen.value = true
}

const toggleGroupStatus = async (group) => {
  togglingGroupId.value = group.id
  await store.toggleGroupStatus(group.id, !group.is_active)
  togglingGroupId.value = null
}

const confirmDeleteGroup = (group) => {
  confirmDialog.value = {
    open: true,
    title: 'Delete Group',
    message: `Are you sure you want to delete the group "${group.title}"?`,
    type: 'danger',
    loading: false,
    action: async () => {
      deletingGroupId.value = group.id
      await store.deleteGroup(group.id)
      deletingGroupId.value = null
    }
  }
}

// Banner Actions
const handleOpenCreateBanner = (group) => {
  selectedGroupId.value = group.id
  selectedGroupTitle.value = group.title
  selectedBanner.value = null
  isBannerDialogOpen.value = true
  
  // Auto-expand group when adding a banner
  if (!expandedGroups.value.includes(group.id)) {
    expandedGroups.value.push(group.id)
  }
}

const handleOpenEditBanner = (group, banner) => {
  selectedGroupId.value = group.id
  selectedGroupTitle.value = group.title
  selectedBanner.value = banner
  isBannerDialogOpen.value = true
}

const toggleBannerStatus = async (group, banner) => {
  togglingBannerId.value = banner.id
  await store.toggleBannerStatus(group.id, banner.id, !banner.is_active)
  togglingBannerId.value = null
}

const confirmDeleteBanner = (group, banner) => {
  confirmDialog.value = {
    open: true,
    title: 'Delete Banner',
    message: `Are you sure you want to delete the banner "${banner.title}"?`,
    type: 'danger',
    loading: false,
    action: async () => {
      deletingBannerId.value = banner.id
      await store.deleteBanner(group.id, banner.id)
      deletingBannerId.value = null
    }
  }
}

const handleImageError = (e) => {
  e.target.src = '' // Fallback logic can be placed here if needed
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'block' // Show ImageOff icon
}
</script>
