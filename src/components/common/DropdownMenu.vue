<template>
  <div class="inline-block" :class="$attrs.class" ref="triggerWrapperRef">
    <!-- Trigger button -->
    <button
      type="button"
      ref="triggerRef"
      @click.stop="toggle"
      class="rounded-lg text-secondary-text transition cursor-pointer"
      :class="[
        hasCustomTrigger
          ? 'w-full block'
          : 'p-2 hover:bg-background hover:text-primary-text',
        { 'bg-background text-primary-text': open && !hasCustomTrigger },
        triggerClass,
      ]"
    >
      <slot name="trigger">
        <MoreVertical class="w-4 h-4" />
      </slot>
    </button>

    <!-- Teleported Menu -->
    <Teleport to="body">
      <!-- ─── MOBILE BOTTOM SHEET VIEW (< 768px) ─── -->
      <template v-if="mobileSheet && isMobile">
        <!-- Backdrop Overlay -->
        <Transition name="dm-sheet-backdrop">
          <div
            v-if="open"
            class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs cursor-pointer"
            @click="close"
          />
        </Transition>

        <!-- Bottom Sheet Panel -->
        <Transition name="dm-sheet-slide">
          <div
            v-if="open"
            class="fixed inset-x-0 bottom-0 z-[111] max-h-[85vh] bg-card-background border-t border-primary-border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden pb-safe"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <!-- Pull Handle Indicator -->
            <div class="pt-2.5 pb-1 flex justify-center shrink-0">
              <div class="w-10 h-1 rounded-full bg-secondary-text/30" />
            </div>

            <!-- Header -->
            <div class="px-5 py-3 border-b border-primary-border flex items-center justify-between shrink-0">
              <!-- Client Context (if client provided) -->
              <div v-if="effectiveHeader" class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0"
                >
                  {{ effectiveHeader.avatarText || effectiveHeader.name?.charAt(0)?.toUpperCase() || 'C' }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-primary-text truncate">
                      {{ effectiveHeader.name }}
                    </p>
                    <span
                      v-if="effectiveHeader.is_active !== undefined"
                      class="text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                      :class="
                        effectiveHeader.is_active
                          ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                          : 'bg-background text-secondary-text border-primary-border'
                      "
                    >
                      {{ effectiveHeader.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <p v-if="effectiveHeader.subtitle || effectiveHeader.email" class="text-[11px] text-secondary-text truncate">
                    {{ effectiveHeader.subtitle || effectiveHeader.email }}
                  </p>
                </div>
              </div>

              <!-- Generic Title (fallback) -->
              <div v-else>
                <h3 class="text-sm font-semibold text-primary-text">{{ title }}</h3>
                <p v-if="subtitle" class="text-[11px] text-secondary-text mt-0.5">{{ subtitle }}</p>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-primary-border text-secondary-text hover:text-primary-text transition cursor-pointer shrink-0 ml-2"
                @click="close"
                aria-label="Close"
              >
                <X :size="15" />
              </button>
            </div>

            <!-- Scrollable Action List -->
            <div class="flex-1 overflow-y-auto px-4 py-2 space-y-1 overscroll-contain">
              <template v-for="(item, i) in visibleItems" :key="item.id ?? i">
                <!-- Divider -->
                <div v-if="item.divider" class="my-2 h-px bg-primary-border/60" />

                <!-- Action Button -->
                <button
                  v-else
                  type="button"
                  :disabled="item.disabled"
                  @click="handleSelect(item, $event)"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-left group"
                  :class="[
                    item.danger
                      ? 'text-primary-red hover:bg-primary-red/10 active:bg-primary-red/15'
                      : item.success
                        ? 'text-primary-green hover:bg-primary-green/10 active:bg-primary-green/15'
                        : 'text-primary-text hover:bg-background active:bg-background/80'
                  ]"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      :class="[
                        item.danger
                          ? 'bg-primary-red/10 text-primary-red group-hover:bg-primary-red/20'
                          : item.success
                            ? 'bg-primary-green/10 text-primary-green group-hover:bg-primary-green/20'
                            : 'bg-background border border-primary-border text-secondary-text group-hover:text-primary-text'
                      ]"
                    >
                      <component :is="item.icon" v-if="item.icon" class="w-4 h-4 shrink-0" />
                    </div>
                    <span class="truncate">{{ item.label }}</span>
                  </div>

                  <ChevronRight
                    class="w-4 h-4 text-secondary-text/40 shrink-0 group-hover:text-secondary-text transition-colors"
                  />
                </button>
              </template>

              <div v-if="!visibleItems.length" class="py-8 text-center text-xs text-secondary-text">
                No actions available
              </div>
            </div>

            <!-- Footer Dismiss -->
            <div class="p-3 border-t border-primary-border shrink-0 bg-card-background">
              <button
                type="button"
                @click="close"
                class="w-full py-2.5 rounded-xl border border-primary-border bg-background hover:bg-primary-border/20 text-xs font-semibold text-secondary-text hover:text-primary-text transition cursor-pointer active:scale-[0.99]"
              >
                Cancel
              </button>
            </div>
          </div>
        </Transition>
      </template>

      <!-- ─── DESKTOP FLOATING DROPDOWN VIEW (>= 768px) ─── -->
      <template v-else>
        <Transition name="dm-fade">
          <div
            v-if="open"
            ref="menuRef"
            class="fixed z-999 min-w-45 rounded-xl border border-primary-border bg-card-background shadow-lg py-1 overflow-hidden"
            :style="menuStyle"
          >
            <template v-for="(item, i) in visibleItems" :key="item.id ?? i">
              <div v-if="item.divider" class="my-1 h-px bg-primary-border" />

              <button
                v-else
                type="button"
                :disabled="item.disabled"
                @click="handleSelect(item, $event)"
                class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                :class="item.danger
                  ? 'text-red-600 hover:bg-red-500/10'
                  : item.success
                    ? 'text-green-600 hover:bg-green-500/10'
                    : 'text-primary-text hover:bg-background'"
              >
                <component :is="item.icon" v-if="item.icon" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </button>
            </template>

            <div v-if="!visibleItems.length" class="px-3.5 py-2 text-sm text-secondary-text">
              No actions available
            </div>
          </div>
        </Transition>
      </template>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue'
import { MoreVertical, X, ChevronRight } from 'lucide-vue-next'

const slots = useSlots()
const hasCustomTrigger = computed(() => !!slots.trigger)

/**
 * item shape:
 * {
 *   id?: string | number,
 *   label: string,
 *   icon?: Component,
 *   action?: string,        // key you switch on in the parent
 *   handler?: () => void,   // OR pass a direct function instead of using 'select' event
 *   danger?: boolean,       // red/destructive styling (e.g. Remove, Deactivate)
 *   success?: boolean,      // green/positive styling (e.g. Activate, Approve)
 *   disabled?: boolean,
 *   hidden?: boolean,       // conditionally hide (e.g. client.is_ib === true)
 *   divider?: boolean       // renders a separator line, ignores other fields
 * }
 */

const props = defineProps({
  items: { type: Array, required: true },
  position: {
    type: String,
    default: 'bottom-end',
    validator: (v) => [
      'top', 'bottom', 'left', 'right',
      'top-start', 'top-end',
      'bottom-start', 'bottom-end',
      'left-start', 'left-end',
      'right-start', 'right-end',
    ].includes(v),
  },
  offset: { type: Number, default: 8 },
  mobileSheet: { type: Boolean, default: true },
  title: { type: String, default: 'Actions' },
  subtitle: { type: String, default: '' },
  client: { type: Object, default: null },
  headerInfo: { type: Object, default: null },
  triggerClass: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const open = ref(false)
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
const triggerRef = ref(null)
const triggerWrapperRef = ref(null)
const menuRef = ref(null)
const menuStyle = ref({})

const visibleItems = computed(() => props.items.filter((i) => !i.hidden))

const effectiveHeader = computed(() => {
  if (props.client) {
    return {
      name: props.client.name,
      email: props.client.email,
      subtitle: props.client.email || `ID: #${props.client.id}`,
      is_active: props.client.is_active,
      avatarText: props.client.name?.charAt(0)?.toUpperCase(),
    }
  }
  if (props.headerInfo) {
    return props.headerInfo
  }
  return null
})

function checkMobile() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

function toggle() {
  open.value ? close() : show()
}

async function show() {
  checkMobile()
  open.value = true
  await nextTick()

  if (props.mobileSheet && isMobile.value) {
    document.body.style.overflow = 'hidden'
  } else {
    positionMenu()
    window.addEventListener('scroll', close, true)
  }

  document.addEventListener('mousedown', handleClickOutside, true)
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
}

function close() {
  if (!open.value) return
  open.value = false
  document.body.style.overflow = ''
  document.removeEventListener('mousedown', handleClickOutside, true)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
}

function handleResize() {
  checkMobile()
  if (open.value) {
    if (props.mobileSheet && isMobile.value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      positionMenu()
    }
  }
}

function handleClickOutside(e) {
  if (props.mobileSheet && isMobile.value) return // modal sheet backdrop handles outside clicks
  if (
    menuRef.value && !menuRef.value.contains(e.target) &&
    triggerWrapperRef.value && !triggerWrapperRef.value.contains(e.target)
  ) {
    close()
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') close()
}

function handleSelect(item, event) {
  if (item.disabled) return
  if (typeof item.handler === 'function') item.handler(event)
  emit('select', item, event)
  close()
}

function positionMenu() {
  if (!triggerRef.value || !menuRef.value) return
  const trigger = triggerRef.value.getBoundingClientRect()
  const menu = menuRef.value.getBoundingClientRect()
  const { offset } = props
  const vw = window.innerWidth
  const vh = window.innerHeight

  let top, left
  const [side, align] = props.position.split('-')

  switch (side) {
    case 'top':
      top = trigger.top - menu.height - offset
      left = trigger.left
      break
    case 'bottom':
      top = trigger.bottom + offset
      left = trigger.left
      break
    case 'left':
      top = trigger.top
      left = trigger.left - menu.width - offset
      break
    case 'right':
      top = trigger.top
      left = trigger.right + offset
      break
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'end') left = trigger.right - menu.width
    if (!align) left = trigger.left + trigger.width / 2 - menu.width / 2
  }
  if (side === 'left' || side === 'right') {
    if (align === 'end') top = trigger.bottom - menu.height
    if (!align) top = trigger.top + trigger.height / 2 - menu.height / 2
  }

  if (left + menu.width > vw - 8) left = vw - menu.width - 8
  if (left < 8) left = 8
  if (top + menu.height > vh - 8) {
    top = side === 'bottom' ? trigger.top - menu.height - offset : vh - menu.height - 8
  }
  if (top < 8) top = 8

  menuStyle.value = { top: `${top}px`, left: `${left}px` }
}

onMounted(() => {
  checkMobile()
})

onBeforeUnmount(() => {
  close()
})

defineExpose({ close })
</script>

<style scoped>
/* Desktop Dropdown Transition */
.dm-fade-enter-active,
.dm-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dm-fade-enter-from,
.dm-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-2px);
}

/* Mobile Bottom Sheet Backdrop Transition */
.dm-sheet-backdrop-enter-active,
.dm-sheet-backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.dm-sheet-backdrop-enter-from,
.dm-sheet-backdrop-leave-to {
  opacity: 0;
}

/* Mobile Bottom Sheet Slide Up Transition */
.dm-sheet-slide-enter-active,
.dm-sheet-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dm-sheet-slide-enter-from,
.dm-sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>