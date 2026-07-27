<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div>
          <h2
            class="text-lg font-semibold text-primary-text flex items-center gap-2"
          >
            <Lock class="w-5 h-5 text-primary" />
            Audit Configuration
          </h2>
          <p class="text-xs text-secondary-text mt-1">
            Authentication related features and events
          </p>
        </div>
      </div>
      <button
        @click="showAddPanel = true"
        class="rounded-lg border-2 bg-primary cursor-pointer text-white px-4 py-2 transition-all flex items-center justify-center gap-2 font-medium text-xs"
      >
        <Plus class="w-4 h-4" />
        Add New Configuration
      </button>
    </div>

    <!-- Module Cards -->
    <div class="space-y-4">
      <div
        v-for="(module, moduleKey) in configurations"
        :key="moduleKey"
        class="bg-card-background border border-primary-border rounded-lg overflow-hidden"
      >
        <!-- Module Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background/50"
        >
          <div class="flex items-center gap-3">
            <Shield class="w-5 h-5 text-primary" />
            <div>
              <h3 class="text-sm font-semibold text-primary-text">
                {{ moduleKey }}
              </h3>
              <span class="text-xs text-secondary-text"> Module </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="
                openAddEntityModule({
                  moduleKey: moduleKey,
                  type: 'ENTITY_CREATE',
                })
              "
              class="text-secondary-text transition-colors text-xs border cursor-pointer px-2 py-1 border-secondary hover:bg-primary/10 rounded-lg"
            >
              Add Entity
            </button>
            <button
              @click="toggleModule(moduleKey)"
              class="text-secondary-text cursor-pointer hover:text-primary-text transition-colors"
            >
              <ChevronDown
                class="w-5 h-5 transition-transform"
                :class="{ 'rotate-180': expandedModules[moduleKey] }"
              />
            </button>
          </div>
        </div>

        <!-- Module Content (Entities) -->
        <div
          v-if="expandedModules[moduleKey]"
          class="divide-y divide-primary-border"
        >
          <div
            v-for="(entity, entityKey) in module"
            :key="entityKey"
            class="px-6 py-4"
          >
            <!-- Entity Header -->
            <div class="flex items-center justify-between mb-4 cursor-pointer">
              <div
                class="flex items-center gap-3 flex-1"
                @click="toggleEntity(moduleKey, entityKey)"
              >
                <Users class="w-4 h-4 text-secondary-text" />
                <div>
                  <p
                    class="text-xs font-medium text-primary-text uppercase tracking-widest"
                  >
                    {{ entityKey }}
                  </p>
                  <span class="text-xs text-secondary-text"> Entity </span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-xs">
                  <span class="flex items-center gap-1">
                    <Check class="w-3.5 h-3.5 text-green-500" />
                    <span class="text-green-600 font-medium">
                      Success: {{ countSuccess(entity) }}
                    </span>
                  </span>
                  <span class="flex items-center gap-1 ml-3">
                    <X class="w-3.5 h-3.5 text-red-500" />
                    <span class="text-red-600 font-medium">
                      Failed: {{ countFailed(entity) }}
                    </span>
                  </span>
                </div>
                <button
                  @click="openEdit(moduleKey, entityKey)"
                  class="text-secondary-text transition-colors text-xs border cursor-pointer px-2 py-1 border-secondary hover:bg-primary/10 rounded-lg"
                >
                  Add Actions
                </button>

                <button
                  @click="toggleEntity(moduleKey, entityKey)"
                  class="text-secondary-text cursor-pointer hover:text-primary-text transition-colors"
                >
                  <ChevronDown
                    class="w-5 h-5 transition-transform"
                    :class="{
                      'rotate-180':
                        expandedEntities[`${moduleKey}-${entityKey}`],
                    }"
                  />
                </button>
              </div>
            </div>

            <!-- Actions Table -->
            <div
              v-if="expandedEntities[`${moduleKey}-${entityKey}`]"
              class="mt-4 bg-background rounded-lg overflow-hidden"
            >
              <table class="w-full">
                <thead>
                  <tr class="border-b border-primary-border">
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Action
                    </th>
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Success
                    </th>
                    <th
                      class="text-left text-xs font-medium text-secondary-text uppercase tracking-widest px-4 py-3 bg-card-background/50"
                    >
                      Failed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(actionValue, actionKey) in entity"
                    :key="actionKey"
                    class="border-b border-primary-border last:border-none hover:bg-card-background/40 transition-colors"
                  >
                    <td class="px-4 py-3 text-xs font-medium text-primary-text">
                      {{ actionKey }}
                    </td>
                    <td class="px-4 py-3">
                      <button
                        @click="
                          handleToggleConfiguration({
                            moduleKey,
                            entityKey,
                            actionKey,
                            status: 'SUCCESS',
                            value: !actionValue.SUCCESS,
                          })
                        "
                        :disabled="
                          store.toggleAction.toggleField ===
                            `${moduleKey}-${entityKey}-${actionKey}-SUCCESS` &&
                          store.toggleAction.togglePending
                        "
                        class="relative cursor-pointer w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                        :class="
                          actionValue.SUCCESS === true
                            ? 'bg-primary-green'
                            : 'bg-primary-border'
                        "
                      >
                        <span
                          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                          :class="
                            actionValue.SUCCESS === true
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          "
                        />
                      </button>
                    </td>
                    <td class="px-4 py-3">
                      <button
                        @click="
                          handleToggleConfiguration({
                            moduleKey,
                            entityKey,
                            actionKey,
                            status: 'FAILED',
                            value: !actionValue.FAILED,
                          })
                        "
                        :disabled="
                          store.toggleAction.toggleField ===
                            `${moduleKey}-${entityKey}-${actionKey}-FAILED` &&
                          store.toggleAction.togglePending
                        "
                        class="relative cursor-pointer w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                        :class="
                          actionValue.FAILED === true
                            ? 'bg-primary-green'
                            : 'bg-primary-border'
                        "
                      >
                        <span
                          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                          :class="
                            actionValue.FAILED === true
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          "
                        />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Configuration Panel -->
    <AddConfigurationPanel
      :open="showAddPanel"
      @close="showAddPanel = false"
      @submit="handleAddConfiguration"
    />

    <!-- Create Entity (supports multiple entities + multiple actions each) -->
    <CreateEntity
      :open="isAddEntity"
      :module="addConfigue"
      @close="isAddEntity = false"
      @submit="handleCreateEntities"
    />

    <!-- Edit Configuration Panel -->
    <ConfigurationEditPanel
      v-if="editingConfig"
      :open="showEditPanel"
      :module-key="editingConfig.moduleKey"
      :entity-key="editingConfig.entityKey"
      :actions="editingConfig.actions"
      @close="closeEditPanel"
      @submit="handleEditConfiguration"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import {
  Lock,
  Shield,
  ChevronDown,
  Users,
  Check,
  X,
  Plus,
  Pencil,
} from "lucide-vue-next";
import AddConfigurationPanel from "./AddConfigurationPanel.vue";
import ConfigurationEditPanel from "./ConfigurationEditPanel.vue";
import { useTelegramConfigurationStore } from "@/stores/dev_telegram/telegram-config";
import CreateEntity from "./CreateEntity.vue";

const store = useTelegramConfigurationStore();
const showAddPanel = ref(false);
const showEditPanel = ref(false);
const expandedModules = ref({});
const expandedEntities = ref({});
const editingConfig = ref(null);
const isAddEntity = ref(false);
const addConfigue = ref({});
const configurations = computed(() => store.auditLogData);

const countSuccess = (entity) => {
  return Object.values(entity).filter((action) => action.SUCCESS).length;
};

const countFailed = (entity) => {
  return Object.values(entity).filter((action) => action.FAILED).length;
};

const toggleModule = (moduleKey) => {
  expandedModules.value[moduleKey] = !expandedModules.value[moduleKey];
};

const toggleEntity = (moduleKey, entityKey) => {
  const key = `${moduleKey}-${entityKey}`;
  expandedEntities.value[key] = !expandedEntities.value[key];
};

const openEdit = (moduleKey, entityKey) => {
  editingConfig.value = {
    moduleKey,
    entityKey,
    actions: JSON.parse(
      JSON.stringify(store.auditLogData[moduleKey][entityKey]),
    ),
  };
  showEditPanel.value = true;
};

const openAddEntityModule = (module) => {
  isAddEntity.value = true;
  addConfigue.value = module;
};

const closeEditPanel = () => {
  showEditPanel.value = false;
  editingConfig.value = null;
};

const handleAddConfiguration = (newConfig) => {
  store.addConfiguration(newConfig);
  showAddPanel.value = false;
};

// CreateEntity already calls store.createEntitiesWithActions() itself
// and only emits 'submit' after that succeeds — so here we just close
// the panel and reset local state.
const handleCreateEntities = () => {
  isAddEntity.value = false;
  addConfigue.value = {};
};

const handleEditConfiguration = async (updatedConfig) => {
  await store.updateAuditLogConfiguration(updatedConfig);
  closeEditPanel();
};
const handleToggleConfiguration = (updatedConfig) => {
  store.toggleAuditLogAction(updatedConfig);
};

watchEffect(() => {
  console.log(store.toggleAction);
});

onMounted(() => {
  store.fetchConfigurations();
});
</script>

<style scoped></style>
