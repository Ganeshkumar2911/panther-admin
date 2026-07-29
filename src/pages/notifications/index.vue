<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import CreateNotificationModal from '@/components/notifications/CreateNotificationModal.vue'
import SendNotificationConfirmModal from '@/components/notifications/SendNotificationConfirmModal.vue'
import {
  Plus,
  RotateCw,
  Radio,
  Send,
} from 'lucide-vue-next'

const store = useNotificationsStore()

const createModalOpen = ref(false)
const sendConfirmModalOpen = ref(false)
const selectedSendNotification = ref(null)

function openSendConfirm(notification) {
  selectedSendNotification.value = notification
  sendConfirmModalOpen.value = true
}

onMounted(() => {
  store.fetchAdminNotifications()
})

function handleRefresh() {
  store.fetchAdminNotifications(true)
}

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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 border-b border-primary-border pb-4">

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="handleRefresh"
          :disabled="store.adminLoading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Logs"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.adminLoading }" />
          <span>Refresh</span>
        </button>

        <button
          @click="createModalOpen = true"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Create Notification</span>
        </button>
      </div>
    </div>

    <!-- SYSTEM DISPATCH LOGS (ADMIN) -->
    <div class="space-y-4">
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
                <th class="px-4 py-3 text-right">Date Dispatched</th>
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

                <td class="px-4 py-3.5 text-secondary-text text-right whitespace-nowrap text-[11px]">
                  {{ formatDate(item.created_at) }}
                </td>

                <td class="px-4 py-3.5 text-right whitespace-nowrap">
                  <button
                    v-if="!item.is_active"
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
