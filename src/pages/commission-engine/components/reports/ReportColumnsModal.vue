<script setup>
import { ref, computed } from "vue";
import {
  Settings2,
  X,
  Check,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  allColumns: {
    type: Array,
    default: () => [], // [ { key, label, visible, default } ]
  },
});

const emit = defineEmits(["update:modelValue", "toggle-column", "select-all", "reset-columns"]);

const searchQuery = ref("");

const filteredColumns = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return props.allColumns;
  return props.allColumns.filter(
    (col) =>
      col.label.toLowerCase().includes(q) || col.key.toLowerCase().includes(q)
  );
});

const visibleCount = computed(() => {
  return props.allColumns.filter((c) => c.visible).length;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-3.5 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <Settings2 :size="16" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-primary-text flex items-center gap-1.5">
                  <span>Manage Table Columns</span>
                </h3>
                <p class="text-xs text-secondary-text">
                  Showing {{ visibleCount }} of {{ allColumns.length }} columns
                </p>
              </div>
            </div>
            <button
              type="button"
              class="btn-icon"
              @click="emit('update:modelValue', false)"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Search & Controls -->
          <div class="p-3 bg-background border-b border-primary-border space-y-2">
            <div class="relative">
              <Search
                :size="14"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search columns..."
                class="input-field pl-9 pr-3 py-1.5 text-xs w-full"
              />
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                class="text-primary hover:underline font-semibold cursor-pointer"
                @click="emit('select-all', true)"
              >
                Select All
              </button>
              <button
                type="button"
                class="text-secondary-text hover:text-primary-text font-medium cursor-pointer"
                @click="emit('select-all', false)"
              >
                Clear All
              </button>
              <button
                type="button"
                class="text-secondary-text hover:text-primary-text flex items-center gap-1 font-medium cursor-pointer"
                @click="emit('reset-columns')"
              >
                <RotateCcw :size="11" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          <!-- Column List -->
          <div class="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-primary-border/40">
            <label
              v-for="col in filteredColumns"
              :key="col.key"
              class="flex items-center justify-between p-2.5 rounded-lg hover:bg-background cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  :checked="col.visible"
                  class="custom-checkbox"
                  @change="emit('toggle-column', col.key)"
                />
                <span class="text-xs font-medium text-primary-text">{{ col.label }}</span>
              </div>
              <span class="text-[10px] font-mono text-secondary-text bg-background px-1.5 py-0.5 rounded border border-primary-border">
                {{ col.key }}
              </span>
            </label>

            <div
              v-if="filteredColumns.length === 0"
              class="py-8 text-center text-xs text-secondary-text"
            >
              No columns matching "{{ searchQuery }}"
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-primary-border bg-card-background flex justify-end">
            <button
              type="button"
              class="btn-primary text-xs px-4 py-1.5"
              @click="emit('update:modelValue', false)"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
