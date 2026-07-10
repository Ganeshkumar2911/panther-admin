<script setup>
import { ref, computed } from 'vue'
import { LogOut, ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import authToken from '@/common/authToken'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()

// ─── Role Detection ─────────────────────────────────
const role = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.role || profileStore.user?.role || null
  } catch {
    return profileStore.user?.role || null
  }
})

const isFm = computed(() => role.value === 'fm')

// ─── FM Status ──────────────────────────────────────
const fmStatus = computed(() => {
  if (!isFm.value) return null
  const { fm_info, fm_request } = profileStore.user || {}
  if (fm_info && (Array.isArray(fm_info) ? fm_info.length > 0 : Object.keys(fm_info).length > 0)) return 'approved'
  if (fm_request) return 'pending'
  return 'incomplete'
})

// ─── FM Registration Form ───────────────────────────
const showFmForm = ref(false)
const fmForm = ref({
  performance_fee: '',
  fm_share: '',
  broker_share: '',
  ib_pool_percentage: '',
  settlement_type: 'monthly',
  settlement_time: '00:00',
})
const fmFormLoading = ref(false)
const fmFormError = ref(null)

function openFmForm() {
  fmFormError.value = null
  showFmForm.value = true
}

function closeFmForm() {
  showFmForm.value = false
  fmFormError.value = null
}

async function submitFmRegistration() {
  fmFormLoading.value = true
  fmFormError.value = null
  try {
    await profileStore.submitFmRequest({ ...fmForm.value })
    closeFmForm()
    profileStore.fetchUser()
  } catch (err) {
    fmFormError.value = err?.error || 'Submission failed. Please try again.'
  } finally {
    fmFormLoading.value = false
  }
}

// ─── Helpers ────────────────────────────────────────
function logout() {
  authStore.logout()
}

function closeDialog() {
  if (showFmForm.value) {
    closeFmForm()
    return
  }
  emit('close')
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const fmInfoEntries = computed(() => {
  const info = profileStore.user?.fm_info
  if (!info || (Array.isArray(info) && info.length === 0)) return []
  return Object.entries(info).filter(([k]) => k !== 'created_at')
})

const fmRequestEntries = computed(() => {
  const req = profileStore.user?.fm_request
  if (!req) return []
  return Object.entries(req).filter(([k]) => k !== 'created_at' && k !== 'status')
})
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border max-w-md w-full shadow-lg"
      @click.stop
    >
      <!-- ── FM Registration Form ── -->
      <template v-if="showFmForm">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center gap-2">
          <button
            @click="closeFmForm"
            class="text-secondary-text hover:text-primary-text transition mr-1"
            aria-label="Back"
          >
            ←
          </button>
          <h2 class="text-primary-text text-lg font-semibold">FM Registration</h2>
        </div>

        <!-- Form Body -->
        <div class="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p v-if="fmFormError" class="text-primary-red text-xs">{{ fmFormError }}</p>

          <div class="grid grid-cols-2 gap-3">
            <div v-for="field in ['performance_fee', 'fm_share', 'broker_share', 'ib_pool_percentage']" :key="field" class="flex flex-col gap-1">
              <label class="text-secondary-text text-xs">{{ formatLabel(field) }} (%)</label>
              <input
                v-model="fmForm[field]"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs
                       focus:outline-none focus:border-primary transition"
                :placeholder="`e.g. 20`"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-xs">Settlement Type</label>
            <select
              v-model="fmForm.settlement_type"
              class="bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs
                     focus:outline-none focus:border-primary transition"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-xs">Settlement Time (HH:MM)</label>
            <input
              v-model="fmForm.settlement_time"
              type="time"
              class="bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs
                     focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Form Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-2">
          <button
            @click="closeFmForm"
            class="flex-1 px-4 py-2 rounded-lg text-xs font-medium text-primary-text hover:bg-primary-border transition"
          >
            Cancel
          </button>
          <button
            @click="submitFmRegistration"
            :disabled="fmFormLoading"
            class="flex-1 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white
                   hover:opacity-90 disabled:opacity-50 transition"
          >
            {{ fmFormLoading ? 'Submitting…' : 'Submit Request' }}
          </button>
        </div>
      </template>

      <!-- ── Main Profile View ── -->
      <template v-else>
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border">
          <h2 class="text-primary-text text-lg font-semibold">Profile</h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <!-- Avatar + Info -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <span class="text-primary text-sm font-bold">
                {{ profileStore.user?.email?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
            <div>
              <p class="text-primary-text text-sm font-semibold">
                {{ profileStore.user?.email || 'No email' }}
              </p>
              <p class="text-secondary-text text-xs">
                {{ profileStore.user?.name || 'User' }}
              </p>
            </div>
          </div>

          <!-- Meta Info -->
          <div class="pt-4 border-t border-primary-border space-y-2">
            <p class="text-secondary-text text-xs">
              Created:
              <span class="text-primary-text">{{ profileStore.user?.created_at || '-' }}</span>
            </p>
            <p class="text-secondary-text text-xs">
              Status:
              <span :class="profileStore.user?.is_active ? 'text-primary-green' : 'text-primary-red'">
                {{ profileStore.user?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </p>
            <p v-if="role" class="text-secondary-text text-xs">
              Role:
              <span class="text-primary-text capitalize">{{ role }}</span>
            </p>
          </div>

          <!-- ── FM Section ── -->
          <template v-if="isFm">
            <div class="pt-4 border-t border-primary-border">

              <!-- Approved: show fm_info -->
              <template v-if="fmStatus === 'approved'">
                <div class="flex items-center gap-2 mb-3">
                  <CheckCircle2 class="w-4 h-4 text-primary-green" />
                  <span class="text-primary-green text-xs font-semibold">FM Account Approved</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="[key, val] in fmInfoEntries"
                    :key="key"
                    class="bg-background rounded-lg px-3 py-2"
                  >
                    <p class="text-secondary-text text-[10px]">{{ formatLabel(key) }}</p>
                    <p class="text-primary-text text-xs font-medium mt-0.5">{{ val }}</p>
                  </div>
                </div>
              </template>

              <!-- Pending: show fm_request -->
              <template v-else-if="fmStatus === 'pending'">
                <div class="flex items-center gap-2 mb-3">
                  <Clock class="w-4 h-4 text-yellow-500" />
                  <span class="text-yellow-500 text-xs font-semibold">FM Request Pending</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="[key, val] in fmRequestEntries"
                    :key="key"
                    class="bg-background rounded-lg px-3 py-2"
                  >
                    <p class="text-secondary-text text-[10px]">{{ formatLabel(key) }}</p>
                    <p class="text-primary-text text-xs font-medium mt-0.5">{{ val }}</p>
                  </div>
                </div>
              </template>

              <!-- Incomplete: prompt registration -->
              <template v-else>
                <div class="flex items-center gap-2 mb-3">
                  <AlertCircle class="w-4 h-4 text-primary-red" />
                  <span class="text-primary-red text-xs font-semibold">FM Registration Incomplete</span>
                </div>
                <p class="text-secondary-text text-xs mb-3">
                  Complete your Fund Manager registration to get started.
                </p>
                <button
                  @click="openFmForm"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                         text-xs font-medium bg-primary text-white hover:opacity-90 transition"
                >
                  <ClipboardList class="w-3.5 h-3.5" />
                  Complete FM Registration
                </button>
              </template>

            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-2">
          <button
            @click="closeDialog"
            class="flex-1 px-4 py-2 rounded-lg text-xs font-medium
                   text-primary-text hover:bg-primary-border transition"
          >
            Close
          </button>
          <button
            @click="logout"
            class="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg text-xs font-medium
                   text-primary-red hover:bg-primary-red/10 transition"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>