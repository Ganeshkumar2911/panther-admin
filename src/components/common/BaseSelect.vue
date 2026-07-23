<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChevronDown, Check, Search } from 'lucide-vue-next'

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select...',
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  allowAll: {
    type: Boolean,
    default: false,
  },
  allLabel: {
    type: String,
    default: 'All',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },

  // ✅ NEW
  variant: {
    type: String,
    default: 'default', // 'default' | 'surface'
  },
})

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits(['update:modelValue', 'search'])

// ─── State ────────────────────────────────────────────────────────────────────
const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref(null)
const dropdownRef = ref(null)
const searchRef = ref(null)
const dropdownStyle = ref({})

// ─── Computed ─────────────────────────────────────────────────────────────────
const allOption = computed(() => ({ label: props.allLabel, value: null }))

const filteredOptions = computed(() => {
  return props.allowAll
    ? [allOption.value, ...props.options]
    : props.options
})

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return props.allowAll ? props.allLabel : null
  }
  const found = props.options?.find(o => String(o.value) === String(props.modelValue))
  return found ? found.label : null
})

const displayLabel = computed(() => selectedLabel.value ?? props.placeholder)

const isPlaceholder = computed(
  () =>
    (!selectedLabel.value && props.modelValue !== null) ||
    (!props.allowAll && props.modelValue === null)
)

// ✅ Background control
const triggerBgClass = computed(() => {
  return props.variant === 'surface'
    ? 'bg-background'
    : 'bg-card-background'
})

const dropdownBgClass = computed(() => {
  return props.variant === 'surface'
    ? 'bg-background'
    : 'bg-card-background'
})

// ─── Position Calculation ─────────────────────────────────────────────────────
function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  }
}

// ─── Methods ──────────────────────────────────────────────────────────────────
function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    updatePosition()
    nextTick(() => {
      updatePosition()
      if (props.searchable) {
        searchRef.value?.focus()
      }
    })
  }
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function select(option) {
  emit('update:modelValue', option.value)
  close()
}

function isSelected(option) {
  if (option.value === null) {
    return props.modelValue === null || props.modelValue === undefined
  }
  return String(props.modelValue) === String(option.value)
}

// ─── Outside click ────────────────────────────────────────────────────────────
function handleOutsideClick(event) {
  if (
    triggerRef.value &&
    !triggerRef.value.contains(event.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    close()
  }
}

// ─── Scroll & Keyboard ────────────────────────────────────────────────────────
function handleScrollOrResize() {
  if (isOpen.value) {
    updatePosition()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<template>
  <div class="relative w-full min-w-0">

    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
      :class="[
        'flex items-center justify-between w-full min-w-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none cursor-pointer select-none border border-primary-border',
        triggerBgClass
      ]"
    >
      <span
        :class="[
          'truncate',
          isPlaceholder ? 'text-secondary-text' : 'text-primary-text'
        ]"
      >
        {{ displayLabel }}
      </span>

      <ChevronDown
        :size="16"
        class="ml-2 flex-shrink-0 text-secondary-text transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          role="listbox"
          :style="dropdownStyle"
          :class="[
            'max-h-56 flex flex-col rounded-lg overflow-hidden border border-primary-border shadow-lg',
            dropdownBgClass
          ]"
        >
          <!-- Search -->
          <div
            v-if="searchable"
            class="shrink-0 px-3 py-2 border-b border-primary-border"
          >
            <div class="relative flex items-center">
              <Search
                :size="14"
                class="absolute left-2.5 text-secondary-text pointer-events-none"
              />
              <input
                ref="searchRef"
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-background text-primary-text placeholder:text-secondary-text focus:outline-none"
                @input="emit('search', searchQuery)"
              />
            </div>
          </div>

          <!-- Options -->
          <ul class="flex-1 min-h-0 overflow-y-auto py-1">
            <li
              v-if="isLoading"
              class="px-4 py-3 text-sm text-secondary-text text-center italic"
            >
              Loading...
            </li>

            <li
              v-else-if="filteredOptions.length === 0"
              class="px-4 py-3 text-sm text-secondary-text text-center italic"
            >
              No options found
            </li>

            <li
              v-for="option in filteredOptions"
              :key="option.value ?? '__all__'"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled"
              @click="option.disabled ? null : select(option)"
              :class="[
                'flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100',
                option.disabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer text-primary-text hover:bg-background'
              ]"
            >
              <span :class="isSelected(option) && !option.disabled ? 'text-primary font-medium' : ''">
                {{ option.label }}
              </span>

              <Check
                v-if="isSelected(option) && !option.disabled"
                :size="14"
                class="text-primary flex-shrink-0"
              />
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}

ul::-webkit-scrollbar {
  width: 4px;
}
ul::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background-color: var(--color-primary-border, rgba(0, 0, 0, 0.15));
}
</style>
