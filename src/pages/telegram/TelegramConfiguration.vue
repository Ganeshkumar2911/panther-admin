<template>
  <div class="min-h-screen bg-background">
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-primary-text">
            Telegram Configuration
          </h1>
          <p class="text-xs text-secondary-text mt-1">
            Manage your automated Telegram bot settings and event triggers
          </p>
        </div>
        <div v-if="hasPermission('telegram.configure_update')">
          <button
            @click="store.openAdd()"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Add Telegram Configuration</span>
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div
        v-if="store.loading"
        class="w-full border border-primary-border bg-card-background/40 rounded-2xl overflow-hidden p-6 space-y-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="h-12 bg-background/60 animate-pulse rounded-xl"
        />
      </div>

      <!-- Full-Page Professional Empty State -->
      <div
        v-else-if="isEmpty"
        class="relative min-h-[520px] w-full rounded-2xl border border-primary-border bg-card-background/40 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl"
      >
        <!-- Background Ambient Glow -->
        <div
          class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />
        <div
          class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        />

        <!-- Icon Graphic Stack -->
        <div class="relative flex items-center justify-center mb-6">
          <div
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 border border-primary/20 shadow-xl flex items-center justify-center relative group transition-all duration-300 hover:scale-105"
          >
            <Send
              class="w-10 h-10 sm:w-12 sm:h-12 text-primary transition-transform duration-300 group-hover:-rotate-6"
            />
            <div
              class="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-primary flex items-center justify-center text-white shadow-md border-2 border-card-background"
            >
              <Sparkles class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <!-- Headline & Narrative -->
        <h2
          class="text-xl sm:text-2xl font-bold text-primary-text mb-2 tracking-tight"
        >
          No Telegram Configurations Found
        </h2>
        <p
          class="text-xs sm:text-sm text-secondary-text max-w-md mx-auto leading-relaxed mb-8"
        >
          Get started by adding your first Telegram configuration. Set up
          automated bot alerts, webhook triggers, and event notification rules.
        </p>

        <!-- CTA Button -->
        <button
          v-if="hasPermission('telegram.configure_update')"
          @click="store.openAdd()"
          class="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 flex items-center gap-2 cursor-pointer group mb-12"
        >
          <Plus class="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Add Telegram Configuration</span>
        </button>

        <!-- Feature Highlights Preview -->
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl border-t border-primary-border/60 pt-8"
        >
          <div
            class="flex flex-col items-center p-4 rounded-xl bg-background/40 border border-primary-border/40 text-center transition-all hover:border-primary/30"
          >
            <div
              class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2.5 text-primary"
            >
              <Bell class="w-4 h-4" />
            </div>
            <h3 class="text-xs font-semibold text-primary-text mb-1">
              Instant Alerts
            </h3>
            <p class="text-[11px] text-secondary-text leading-normal">
              Receive real-time notifications for system & trading activities.
            </p>
          </div>

          <div
            class="flex flex-col items-center p-4 rounded-xl bg-background/40 border border-primary-border/40 text-center transition-all hover:border-primary/30"
          >
            <div
              class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2.5 text-primary"
            >
              <Bot class="w-4 h-4" />
            </div>
            <h3 class="text-xs font-semibold text-primary-text mb-1">
              Bot Dispatch
            </h3>
            <p class="text-[11px] text-secondary-text leading-normal">
              Connect Telegram bots to designated dispatch channels.
            </p>
          </div>

          <div
            class="flex flex-col items-center p-4 rounded-xl bg-background/40 border border-primary-border/40 text-center transition-all hover:border-primary/30"
          >
            <div
              class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2.5 text-primary"
            >
              <Zap class="w-4 h-4" />
            </div>
            <h3 class="text-xs font-semibold text-primary-text mb-1">
              Event Rules
            </h3>
            <p class="text-[11px] text-secondary-text leading-normal">
              Configure fine-grained success & failure event rules per module.
            </p>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div
        v-else
        class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background/40"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/50">
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Module
              </th>
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Entity
              </th>
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Action
              </th>
              <th
                v-if="hasPermission('telegram.configure_update')"
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in formattedDataList"
              :key="item.id || item.bot_token"
              class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
            >
              <td class="p-3 text-primary-text text-xs font-medium">
                {{ item?.module || item?.bot_token || "-" }}
              </td>
              <td class="p-3 text-primary-text text-xs">
                {{ item?.entity || item?.client_id || "-" }}
              </td>
              <td class="p-3 text-primary-text text-xs">
                {{ item?.action || "-" }}
              </td>
              <td v-if="hasPermission('telegram.configure_update')" class="p-3">
                <div class="flex items-center gap-3">
                  <button
                    :disabled="store.toggleLoading"
                    @click="store.toggleStatus(item)"
                    class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer"
                    :class="
                      item.is_active ? 'bg-primary-green' : 'bg-primary-border'
                    "
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                      :class="
                        item.is_active ? 'translate-x-5' : 'translate-x-0'
                      "
                    />
                  </button>

                  <button
                    @click="store.openEdit(item)"
                    class="text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    :disabled="store.deleteLoading"
                    @click="store.deleteConfiguration(item.id)"
                    class="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>

  <DynamicFormModal
    v-if="store.showModal"
    :title="store.isEdit ? 'Edit Configuration' : 'Add Configuration'"
    description="Configure automated Telegram notification settings"
    :fields="formFields"
    :model-value="store.editingData"
    :loading="store.actionLoading"
    :submit-text="store.isEdit ? 'Update' : 'Save Configuration'"
    @submit="handleSubmit"
    @close="store.closeModal()"
  />
</template>

<script setup>
import { computed, onMounted } from "vue";
import {
  Pencil,
  Trash2,
  Send,
  Sparkles,
  Plus,
  Bell,
  Bot,
  Zap,
} from "lucide-vue-next";
import DynamicFormModal from "@/components/common/DynamicFormModal.vue";
import { useTelegramConfigurationStore } from "@/stores/telegram/telegram-config";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const store = useTelegramConfigurationStore();

const isEmpty = computed(() => {
  if (!store.data) return true;
  if (Array.isArray(store.data)) return store.data.length === 0;
  return Object.keys(store.data).length === 0;
});

const formattedDataList = computed(() => {
  if (!store.data) return [];
  if (Array.isArray(store.data)) return store.data;
  const list = [];
  let index = 1;
  for (const mod in store.data) {
    for (const ent in store.data[mod]) {
      for (const act in store.data[mod][ent]) {
        list.push({
          id: `${mod}-${ent}-${act}-${index++}`,
          module: mod,
          entity: ent,
          action: act,
          is_active:
            store.data[mod][ent][act]?.SUCCESS ||
            store.data[mod][ent][act]?.FAILED,
          raw: store.data[mod][ent][act],
        });
      }
    }
  }
  return list;
});

function handleSubmit(payload) {
  store.submit(payload);
}

onMounted(() => {
  store.fetchConfigurations();
});

const formFields = [
  {
    type: "text",
    label: "Module",
    model: "module",
    placeholder: "e.g., trading",
    required: true,
  },
  {
    type: "text",
    label: "Entity",
    model: "entity",
    placeholder: "e.g., account",
    required: true,
  },
  {
    type: "text",
    label: "Action",
    model: "action",
    placeholder: "e.g., deposit",
    required: true,
  },
  {
    type: "switch",
    label: "Notify on Success",
    model: "notify_on_success",
    hint: "Send Telegram notification when action succeeds",
  },
  {
    type: "switch",
    label: "Notify on Failed",
    model: "notify_on_failed",
    hint: "Send Telegram notification when action fails",
  },
];
</script>
