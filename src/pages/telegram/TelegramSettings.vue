<template>
  <div class="min-h-screen bg-background">
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div class="">
          <h1 class="text-2xl font-bold text-primary-text">Telegram Setting</h1>
          <p class="text-xs text-secondary-text mt-1">
            Manage your telegram settings
          </p>
        </div>
        <div>
          <button
            @click="store.openAdd()"
            class="rounded-lg p-2 text-xs cursor-pointer text-white transition-colors bg-primary sm:flex-none flex items-center justify-center border border-primary-border hover:border-primary-border"
          >
            Add Telegram Bot
          </button>
        </div>
      </div>

      <div
        class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/50">
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Bot Id
              </th>
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Client ID
              </th>
              <th
                class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody v-if="store.isLoading">
            <tr
              v-for="n in 6"
              :key="n"
              class="border-b border-primary-border animate-pulse"
            >
              <td class="p-3">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full bg-card-background shrink-0"
                  />
                  <div class="space-y-1.5">
                    <div class="h-3 w-24 bg-card-background rounded" />
                    <div class="h-2.5 w-28 bg-card-background rounded" />
                  </div>
                </div>
              </td>
              <td class="p-3">
                <div class="space-y-1.5">
                  <div class="h-3 w-20 bg-card-background rounded" />
                  <div class="h-2.5 w-24 bg-card-background rounded" />
                </div>
              </td>
              <td class="p-3">
                <div class="space-y-1.5">
                  <div class="h-3 w-16 bg-card-background rounded" />
                  <div class="h-2.5 w-20 bg-card-background rounded" />
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Empty -->
          <tbody v-else-if="store.data.length === 0">
            <tr>
              <td colspan="4" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
                  >
                    <Settings class="w-5 h-5 text-secondary-text" />
                  </div>
                  <p class="text-sm font-semibold text-primary-text">
                    No telegram settings found
                  </p>
                  <p class="text-xs text-secondary-text">
                    Click "Add Telegram Bot" to create one
                  </p>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Data -->
          <tbody v-else>
            <tr
              v-for="item in store.data"
              :key="item.id"
              class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
            >
              <td class="p-3 text-primary-text">
                {{ item?.bot_token ?? "-" }}
              </td>
              <td class="p-3 text-primary-text">
                {{ item?.client_id ?? "-" }}
              </td>
              <td class="p-3">
                <div class="flex items-center gap-3">
                  <button
                    :disabled="store.toggleLoading"
                    @click="store.toggleStatus(item)"
                    class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
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
                    class="text-secondary-text hover:text-primary-text transition-colors"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    :disabled="store.deleteLoading"
                    @click="store.deleteSetting(item.id)"
                    class="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
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
    :title="store.isEdit ? 'Edit Settings' : 'Add Settings'"
    description="Configure your settings"
    :fields="formFields"
    :model-value="store.editingData"
    :loading="store.actionLoading"
    :submit-text="store.isEdit ? 'Update' : 'Save Settings'"
    @submit="handleSubmit"
    @close="store.closeModal()"
  />
</template>

<script setup>
import { Pencil, Trash2, Settings } from "lucide-vue-next";
import DynamicFormModal from "@/components/common/DynamicFormModal.vue";
import { useTelegramSettingsStore } from "@/stores/telegram/telegram";
import { onMounted } from "vue";

const store = useTelegramSettingsStore();

// ⚠️ NOTE: onMounted / store.fetchSettings() jaanbujh kar hata diya hai
// kyunki abhi API call nahi karni. Data upar store mein dummy hai.

function handleSubmit(payload) {
  console.log(payload);
  store.submit(payload);
}

onMounted(() => {
  store.fetchSettings();
});

const formFields = [
  {
    type: "text",
    label: "Bot ID",
    model: "bot_token",
    placeholder: "Enter Bot ID",
    required: true,
  },
  {
    type: "text",
    label: "Client ID",
    model: "client_id",
    placeholder: "Enter Client ID",
    required: true,
  },
  //   {
  //     type: "select",
  //     label: "Provider",
  //     model: "provider",
  //     placeholder: "Select provider",
  //     options: [
  //       { label: "Brevo", value: "brevo" },
  //       { label: "SMTP", value: "smtp" },
  //     ],
  //     searchable: true, // optional
  //     variant: "surface", // optional
  //     required: true,
  //   },
  //   {
  //     type: "textarea",
  //     label: "Description",
  //     model: "description",
  //     placeholder: "Write a short description...",
  //     rows: 4,
  //   },
];
</script>
