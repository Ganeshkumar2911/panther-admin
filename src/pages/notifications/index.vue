<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import CreateNotificationModal from '@/components/notifications/CreateNotificationModal.vue'
import SendNotificationConfirmModal from '@/components/notifications/SendNotificationConfirmModal.vue'
import {
  Bell,
  CheckCheck,
  Plus,
  RotateCw,
  Search,
  Filter,
  ExternalLink,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  User,
  Radio,
  FileText,
  Send,
} from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'

const statusFilterOptions = [
  { label: 'Unread Only', value: 'unread' },
  { label: 'Read Only', value: 'read' },
]

const priorityFilterOptions = [
  { label: 'High Priority', value: 'HIGH' },
  { label: 'Medium Priority', value: 'MEDIUM' },
  { label: 'Low Priority', value: 'LOW' },
]

const typeFilterOptions = [
  { label: 'Announcement', value: 'ANNOUNCEMENT' },
  { label: 'System Alert', value: 'SYSTEM' },
  { label: 'Promotion', value: 'PROMOTION' },
  { label: 'Critical Alert', value: 'ALERT' },
]

const store = useNotificationsStore()

const activeTab = ref('my') // 'my' or 'admin'
const createModalOpen = ref(false)
const sendConfirmModalOpen = ref(false)
const selectedSendNotification = ref(null)

function openSendConfirm(notification) {
  selectedSendNotification.value = notification
  sendConfirmModalOpen.value = true
}

// Filters for My Notifications
const searchQuery = ref('')
const selectedReadStatus = ref(null)
const selectedPriority = ref(null)
const selectedType = ref(null)

onMounted(() => {
  store.fetchMyNotifications()
  store.fetchAdminNotifications()
})

function handleRefresh() {
  if (activeTab.value === 'my') {
    store.fetchMyNotifications(true)
  } else {
    store.fetchAdminNotifications(true)
  }
}

// Filtered My Notifications
const filteredMyNotifications = computed(() => {
  return store.myNotifications.filter((n) => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = n.title.toLowerCase().includes(q)
      const matchMsg = n.message.toLowerCase().includes(q)
      if (!matchTitle && !matchMsg) return false
    }

    if (selectedReadStatus.value === 'unread' && n.is_read) return false
    if (selectedReadStatus.value === 'read' && !n.is_read) return false

    if (selectedPriority.value && n.priority !== selectedPriority.value) return false
    if (selectedType.value && n.type !== selectedType.value) return false

    return true
  })
})

function getPriorityBadge(priority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
  }
}

function getTypeBadge(type) {
  switch (type) {
    case 'ANNOUNCEMENT':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'SYSTEM':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    case 'PROMOTION':
      return 'bg-teal-500/10 text-teal-400 border-teal-500/30'
    case 'ALERT':
      return 'bg-red-500/10 text-red-400 border-red-500/30'
    default:
      return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="px-4 mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="handleRefresh"
          :disabled="store.myLoading || store.adminLoading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Notifications"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.myLoading || store.adminLoading }" />
          <span>Refresh</span>
        </button>

        <button
          v-if="store.unreadCount > 0"
          @click="store.markAllAsRead"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>

        <button
          @click="createModalOpen = true"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold  shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Create Notification</span>
        </button>
      </div>
    </div>

    <!-- Tabs Header -->
    <div class="flex items-center gap-2 border-b border-primary-border pb-1">
      <button
        @click="activeTab = 'my'"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2',
          activeTab === 'my'
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
        ]"
      >
        <Bell class="w-3.5 h-3.5" />
        <span>My Notifications</span>
        <span
          v-if="store.unreadCount > 0"
          :class="[
            'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
            activeTab === 'my' ? 'bg-white text-primary' : 'bg-primary text-white'
          ]"
        >
          {{ store.unreadCount }}
        </span>
      </button>

      <button
        @click="activeTab = 'admin'"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2',
          activeTab === 'admin'
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
        ]"
      >
        <Radio class="w-3.5 h-3.5" />
        <span>System Dispatch Logs (Admin)</span>
      </button>
    </div>

    <!-- TAB 1: MY NOTIFICATIONS -->
    <div v-if="activeTab === 'my'" class="space-y-4">
      <!-- Filter Bar (Single Row Alignment) -->
      <div class="bg-card-background border border-primary-border rounded-lg p-3.5 flex flex-col md:flex-row items-center gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 w-xs">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search notification title or content..."
            class="w-xs pl-9 pr-3 py-2 text-xs bg-background border border-primary-border rounded-lg text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <BaseSelect
            v-model="selectedReadStatus"
            :options="statusFilterOptions"
            :allowAll="true"
            allLabel="All Status"
            placeholder="All Status"
            class="w-36"
          />

          <BaseSelect
            v-model="selectedPriority"
            :options="priorityFilterOptions"
            :allowAll="true"
            allLabel="All Priorities"
            placeholder="All Priorities"
            class="w-36"
          />

          <BaseSelect
            v-model="selectedType"
            :options="typeFilterOptions"
            :allowAll="true"
            allLabel="All Types"
            placeholder="All Types"
            class="w-36"
          />
        </div>
      </div>

      <!-- Notifications Grid / List -->
      <div v-if="store.myLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-24 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
      </div>

      <div v-else-if="filteredMyNotifications.length === 0" class="bg-card-background border border-primary-border rounded-2xl py-16 text-center space-y-2">
        <Bell class="w-8 h-8 text-secondary-text mx-auto opacity-50" />
        <h3 class="text-xs font-semibold text-primary-text">No Notifications Found</h3>
        <p class="text-[11px] text-secondary-text">You have no notifications matching your filters.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in filteredMyNotifications"
          :key="item.id"
          :class="[
            'bg-card-background border rounded-2xl p-4.5 transition-all duration-200 hover:border-primary/40 relative overflow-hidden flex flex-col justify-between shadow-sm',
            item.is_read ? 'border-primary-border opacity-90' : 'border-primary/40 bg-gradient-to-r from-primary/5 via-card-background to-card-background shadow-md shadow-primary/5'
          ]"
        >
          <!-- Left Status Indicator Bar -->
          <span
            v-if="!item.is_read"
            class="absolute inset-y-0 left-0 w-1 bg-primary"
          />

          <div>
            <!-- Top Tag row -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getTypeBadge(item.type)]">
                  {{ item.type }}
                </span>
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getPriorityBadge(item.priority)]">
                  {{ item.priority }}
                </span>
              </div>

              <span class="text-[11px] text-secondary-text font-mono">
                {{ formatDate(item.created_at) }}
              </span>
            </div>

            <!-- Title & Message -->
            <h3 class="text-sm font-bold text-primary-text mb-1">
              {{ item.title }}
            </h3>

            <p class="text-xs text-secondary-text leading-relaxed">
              {{ item.message }}
            </p>
          </div>

          <!-- Bottom Actions -->
          <div class="mt-4 pt-3 border-t border-primary-border/50 flex items-center justify-between text-xs">
            <div>
              <span v-if="item.is_read" class="text-[10px] text-secondary-text font-medium flex items-center gap-1">
                <CheckCheck class="w-3 h-3 text-emerald-400" />
                Read at {{ formatDate(item.read_at) }}
              </span>
              <span v-else class="text-[10px] text-primary font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Unread Notification
              </span>
            </div>

            <div class="flex items-center gap-2">
              <a
                v-if="item.action_url"
                :href="item.action_url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                <span>Open Link</span>
                <ExternalLink class="w-3 h-3" />
              </a>

              <button
                v-if="!item.is_read"
                @click="store.markAsRead(item.id)"
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-card-background border border-primary-border text-xs text-primary font-medium transition-colors cursor-pointer"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Mark as Read</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: SYSTEM DISPATCH LOGS (ADMIN) -->
    <div v-else class="space-y-4">
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-background/50">
          <div class="flex items-center gap-2">
            <Radio class="w-4 h-4 text-primary" />
            <span class="text-xs font-semibold text-primary-text uppercase tracking-wider">
              Admin Dispatched Notifications Log
            </span>
            <span class="text-[11px] text-secondary-text bg-card-background border border-primary-border px-2.5 py-0.5 rounded-full">
              {{ store.adminNotifications.length }} Total Dispatched
            </span>
          </div>
        </div>

        <div v-if="store.adminLoading" class="p-8 text-center text-xs text-secondary-text">
          Loading system notification history...
        </div>

        <div v-else-if="store.adminNotifications.length === 0" class="py-16 text-center text-xs text-secondary-text">
          No system notifications created yet. Click "+ Create Notification" to dispatch one.
        </div>

        <div v-else class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr class="border-b border-primary-border bg-background/50 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                <th class="px-5 py-3">ID</th>
                <th class="px-4 py-3">Notification</th>
                <th class="px-4 py-3">Type & Priority</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Target Recipients</th>
                <th class="px-4 py-3">Date Dispatched</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60 text-xs">
              <tr
                v-for="item in store.adminNotifications"
                :key="item.id"
                class="hover:bg-background/80 transition-colors"
              >
                <td class="px-5 py-3.5 font-mono text-secondary-text font-bold">
                  #{{ item.id }}
                </td>

                <td class="px-4 py-3.5">
                  <div>
                    <h4 class="font-bold text-primary-text">{{ item.title }}</h4>
                    <p class="text-[11px] text-secondary-text line-clamp-1 max-w-sm">
                      {{ item.message }}
                    </p>
                    <p v-if="item.note" class="text-[10px] text-secondary-text italic mt-0.5">
                      Memo: {{ item.note }}
                    </p>
                  </div>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getTypeBadge(item.type)]">
                      {{ item.type }}
                    </span>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getPriorityBadge(item.priority)]">
                      {{ item.priority }}
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap">
                  <span
                    :class="[
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase',
                      item.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    ]"
                  >
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <td class="px-4 py-3.5">
                  <div class="flex flex-wrap items-center gap-1">
                    <span
                      v-for="(t, idx) in item.targets"
                      :key="idx"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border border-primary-border text-primary-text"
                    >
                      <span v-if="t.target_type === 'ALL'" class="text-primary font-extrabold">Broadcast ALL</span>
                      <span v-else-if="t.target_type === 'ROLE'">ROLE: {{ t.target_id }}</span>
                      <span v-else>USER: #{{ t.target_id }}</span>
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3.5 text-secondary-text whitespace-nowrap text-[11px]">
                  {{ formatDate(item.created_at) }}
                </td>

                <td class="px-4 py-3.5 text-right whitespace-nowrap">
                  <button
                    @click="openSendConfirm(item)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    :disabled="store.sendLoadingId === item.id"
                  >
                    <Send class="w-3 h-3" />
                    <span>{{ store.sendLoadingId === item.id ? 'Sending...' : 'Send' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Notification Modal -->
    <CreateNotificationModal
      :open="createModalOpen"
      @close="createModalOpen = false"
    />

    <!-- Trigger/Send Confirmation Modal -->
    <SendNotificationConfirmModal
      :open="sendConfirmModalOpen"
      :notification="selectedSendNotification"
      @close="sendConfirmModalOpen = false"
    />
  </div>
</template>
