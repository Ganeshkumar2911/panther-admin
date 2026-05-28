<template>
  <div class="px-4 mx-auto">
    <!-- Skeleton -->
    <div v-if="store.detailLoading" class="space-y-4 animate-pulse">
      <div class="h-5 w-48 bg-card-background rounded" />
      <div
        class="bg-card-background border border-primary-border rounded-xl p-5 space-y-3"
      >
        <div class="h-4 w-64 bg-background rounded" />
        <div class="h-3 w-full bg-background rounded" />
        <div class="h-3 w-3/4 bg-background rounded" />
      </div>
    </div>

    <template v-else-if="store.detail">
      <!-- Header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-secondary-text">{{
              store.detail.ticket_number
            }}</span>
            <span
              class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
              :class="priorityClass(store.detail.priority)"
            >
              {{ store.detail.priority }}
            </span>
            <button
              class="text-[11px] font-medium px-2 py-0.5 rounded-full border transition-opacity"
              :class="[
                statusClass(store.detail.status),
                store.detail.status !== 'closed' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'
              ]"
              @click="openStatusDialog"
              :disabled="store.detail.status === 'closed'"
            >
              {{ store.detail.status }}
            </button>
          </div>
          <h1 class="text-base font-semibold text-primary-text">
            {{ store.detail.subject }}
          </h1>
          <p class="text-[11px] text-secondary-text mt-0.5">
            Created {{ formatDate(store.detail.created_at) }}
            <span v-if="store.detail.updated_at !== store.detail.created_at">
              · Updated {{ formatDate(store.detail.updated_at) }}</span
            >
          </p>
        </div>
      </div>

      <!-- Description -->
      <div
        class="bg-card-background border border-primary-border rounded-xl p-5 mb-4"
      >
        <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-2">
          Description
        </p>
        <p class="text-sm text-primary-text leading-relaxed">
          {{ store.detail.description }}
        </p>
      </div>

      <!-- Attachments -->
      <div
        class="bg-card-background border border-primary-border rounded-xl mb-4 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-5 py-3.5 border-b border-primary-border"
        >
          <div class="flex items-center gap-2">
            <Paperclip class="w-3.5 h-3.5 text-secondary-text" />
            <span class="text-xs font-medium text-primary-text"
              >Attachments</span
            >
            <span
              class="text-[11px] text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-full"
            >
              {{ store.detail.attachments.length }}
            </span>
          </div>
          <!-- <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-medium transition-colors"
            @click="openDialog('attachment')"
          >
            <Plus class="w-3 h-3" /> Add
          </button> -->
        </div>

        <div
          v-if="store.detail.attachments.length === 0"
          class="py-8 text-center"
        >
          <p class="text-xs text-secondary-text">No attachments yet</p>
        </div>

        <div v-else class="divide-y divide-primary-border">
          <div
            v-for="att in store.detail.attachments"
            :key="att.id"
            class="flex items-center justify-between px-5 py-3 hover:bg-background transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-7 h-7 rounded-lg bg-background border border-primary-border flex items-center justify-center shrink-0"
              >
                <FileIcon class="w-3.5 h-3.5 text-secondary-text" />
              </div>
              <div>
                <p class="text-xs text-primary-text">{{ att.file_name }}</p>
                <p class="text-[10px] text-secondary-text">
                  {{ formatDate(att.created_at) }}
                </p>
              </div>
            </div>

            <a
              :href="att.file_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 text-[11px] text-secondary-text hover:text-primary-text transition-colors"
              :aria-label="`Open ${att.file_name}`"
            >
              <ExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div
        class="bg-card-background border border-primary-border rounded-xl overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-5 py-3.5 border-b border-primary-border"
        >
          <div class="flex items-center gap-2">
            <MessageSquare class="w-3.5 h-3.5 text-secondary-text" />
            <span class="text-xs font-medium text-primary-text">Comments</span>
            <span
              class="text-[11px] text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-full"
            >
              {{ store.detail.comments.length }}
            </span>
          </div>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-medium transition-colors"
            @click="openDialog('comment')"
          >
            <Plus class="w-3 h-3" /> Add
          </button>
        </div>

        <div v-if="store.detail.comments.length === 0" class="py-8 text-center">
          <p class="text-xs text-secondary-text">No comments yet</p>
        </div>

        <div v-else class="divide-y divide-primary-border">
          <div
            v-for="c in store.detail.comments"
            :key="c.id"
            class="px-5 py-4 hover:bg-background transition-colors"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-black shrink-0"
              >
                {{ c.role?.charAt(0).toUpperCase() ?? "U" }}
              </div>
              <span class="text-xs font-medium text-primary-text">{{
                c.role ?? "User"
              }}</span>
              <span class="text-[11px] text-secondary-text ml-auto">{{
                formatDate(c.created_at)
              }}</span>
            </div>
            <p class="text-xs text-secondary-text leading-relaxed pl-8">
              {{ c.comment }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <TicketActionDialog
      :open="dialog.open"
      :mode="dialog.mode"
      :ticket-id="ticketId"
      @close="dialog.open = false"
    />
    <TicketStatusDialog
      :open="statusDialog.open"
      :status="store.detail?.status"
       :ticketId="ticketId"
      @close="statusDialog.open = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  Paperclip,
  MessageSquare,
  Plus,
  File as FileIcon,
  ExternalLink,
} from "lucide-vue-next";
import { usePlatfromTicketsStore } from "@/stores/platformTickets/platformTickets";
import TicketActionDialog from "@/components/platformTickets/TicketActionDialog.vue";
import TicketStatusDialog from "@/components/platformTickets/TicketStatusDialog.vue";

const store = usePlatfromTicketsStore();
const route = useRoute();

const ticketId = computed(() => route.params.id);
const dialog = ref({ open: false, mode: "comment" });
const statusDialog = ref({ open: false });

const openDialog = (mode) => {
  dialog.value = { open: true, mode };
};

const openStatusDialog = () => {
  if (store.detail?.status !== "closed") {
    statusDialog.value.open = true;
  }
};

const formatDate = (val) =>
  new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const priorityClass = (p) =>
  ({
    low: "bg-green-50 text-green-800 border-green-200",
    medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
    high: "bg-red-50 text-red-800 border-red-200",
  })[p] ?? "bg-background text-secondary-text border-primary-border";

const statusClass = (s) =>
  ({
    open: "bg-blue-50 text-blue-800 border-blue-200",
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    resolved: "bg-green-50 text-green-800 border-green-200",
    closed: "bg-background text-secondary-text border-primary-border",
  })[s] ?? "bg-background text-secondary-text border-primary-border";

onMounted(() => store.fetchTicketDetail(ticketId.value));
</script>
