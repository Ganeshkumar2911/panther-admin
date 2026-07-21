<script setup>
import { onMounted, computed, ref } from 'vue'
import { Search, Users, UserPen, Eye, UserX, UserCheck, Pencil, UserPlus, Plus, RefreshCw, Trash2, Link2 } from 'lucide-vue-next'
import { useClientListStore } from '@/stores/clientList/clientList'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import DropdownMenu from '@/components/common/DropdownMenu.vue'
import ChangeIBDialog from '@/components/common/ChangeIBDialog.vue'
import ChangeStatusDialog from '@/components/common/ChangeStatusDialog.vue'
import ClientDialog from '@/components/common/ClientDialog.vue'
import MakeIBDialog from '@/components/common/MakeIBDialog.vue'
import DeleteClientDialog from '@/components/common/DeleteClientDialog.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import UpdateReferralLinkDrawer from '@/components/common/UpdateReferralLinkDrawer.vue'
import { useRouter } from "vue-router";
import { useGoToTradingAccount } from '@/composables/useGoToTradingAccount'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const router = useRouter();
const { hasPermission } = usePermissionCheck()

const store = useClientListStore()

let searchTimer = null
let ibSearchTimer = null

const changeIBDialogOpen = ref(false)
const selectedClientForChangeIB = ref(null)

const makeIBDialogOpen = ref(false)
const selectedClientForMakeIB = ref(null)

const changeStatusDialogOpen = ref(false)
const selectedClientForChangeStatus = ref(null)

const editClientDialogOpen = ref(false)
const selectedClientForEdit = ref(null)

const createClientDialogOpen = ref(false)

const deleteClientDialogOpen = ref(false)
const selectedClientForDelete = ref(null)

const updateReferralLinkDrawerOpen = ref(false)
const selectedClientForReferralLink = ref(null)

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer)
  ibSearchTimer = setTimeout(() => store.searchIbs(query), 350)
}

const hasFilters = computed(() => store.filters.search || store.filters.ib_id)

const handlePageChange = (page) => store.fetchClients(page)

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function getRowActions(client) {
  const actions = []

  if (hasPermission('client.update')) {
    actions.push(
      { action: 'edit', label: 'Edit Client', icon: Pencil },
      { action: 'changeIB', label: 'Change IB', icon: UserPen },
      { action: 'makeIB', label: 'Make IB', icon: UserPlus, hidden: client.is_ib === true },
      { action: 'updateReferralLink', label: 'Update Referral Link', icon: Link2 },
      { divider: true },
      {
        action: 'toggleStatus',
        label: client.is_active ? 'Deactivate Client' : 'Activate Client',
        icon: client.is_active ? UserX : UserCheck,
        danger: client.is_active,
      }
    )
  }

  if (client.kyc_status === 'pending' && hasPermission('client.delete')) {
    if (actions.length > 0) {
      actions.push({ divider: true })
    }
    actions.push(
      { action: 'delete', label: 'Delete Client', icon: Trash2, danger: true }
    )
  }

  return actions
}

function onMenuSelect(item, client) {
  switch (item.action) {
    case 'edit': return openEditClientDialog(client)
    case 'changeIB': return openChangeIBDialog(client)
    case 'makeIB': return openMakeIBDialog(client)
    case 'updateReferralLink': return openUpdateReferralLinkDrawer(client)
    case 'toggleStatus': return openChangeStatusDialog(client)
    case 'depth': return openClientDepth(client)
    case 'delete': return openDeleteClientDialog(client)
  }
}

const openDeleteClientDialog = (client) => {
  selectedClientForDelete.value = client
  deleteClientDialogOpen.value = true
}

const closeDeleteClientDialog = () => {
  deleteClientDialogOpen.value = false
  selectedClientForDelete.value = null
}

const handleDeleteSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const { goToTradingAccount } = useGoToTradingAccount()

const openChangeIBDialog = (client) => {
  selectedClientForChangeIB.value = client
  changeIBDialogOpen.value = true
}

const openClientDepth = (client) => {

  localStorage.setItem("active_client", JSON.stringify(client));
  router.push(`/client/details/${client.id}`)

}

const closeChangeIBDialog = () => {
  changeIBDialogOpen.value = false
  selectedClientForChangeIB.value = null
}

const handleChangeIBSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const openMakeIBDialog = (client) => {
  selectedClientForMakeIB.value = client
  makeIBDialogOpen.value = true
}

const closeMakeIBDialog = () => {
  makeIBDialogOpen.value = false
  selectedClientForMakeIB.value = null
}

const handleMakeIBSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const openChangeStatusDialog = (client) => {
  selectedClientForChangeStatus.value = client
  changeStatusDialogOpen.value = true
}

const closeChangeStatusDialog = () => {
  changeStatusDialogOpen.value = false
  selectedClientForChangeStatus.value = null
}

const handleChangeStatusSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const openEditClientDialog = (client) => {
  selectedClientForEdit.value = client
  editClientDialogOpen.value = true
}

const closeEditClientDialog = () => {
  editClientDialogOpen.value = false
  selectedClientForEdit.value = null
}

const handleEditClientSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const openCreateClientDialog = () => {
  createClientDialogOpen.value = true
}

const closeCreateClientDialog = () => {
  createClientDialogOpen.value = false
}

const handleCreateClientSuccess = () => {
  store.fetchClients(1)
}

const openUpdateReferralLinkDrawer = (client) => {
  selectedClientForReferralLink.value = client
  updateReferralLinkDrawerOpen.value = true
}

const closeUpdateReferralLinkDrawer = () => {
  updateReferralLinkDrawerOpen.value = false
  selectedClientForReferralLink.value = null
}

const handleUpdateReferralLinkSuccess = () => {
  store.fetchClients(store.pagination.page)
}

const getKycClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-green-500/10 text-green-700 border-green-500/20'
  if (s === 'pending') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
  return 'bg-red-500/10 text-red-700 border-red-500/20'
}

onMounted(() => store.fetchClients())
</script>

<template>
  <div class="px-4">

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <div class="relative w-full sm:w-56 xl:w-56">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search clients..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          v-model="store.filters.ib_id"
          :options="store.ibOptions"
          :isLoading="store.searchLoading"
          placeholder="Search IB..."
          searchable
          class="w-full sm:w-52 xl:w-52"
          @search="onIbSearch"
          @update:modelValue="store.applyFilters()"
        />

        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-full sm:w-32 xl:w-32"
          @update:modelValue="store.updatePerPage"
        />
             <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="
              () => {
                store.fetchClients();
              }
            "
          >
      <RefreshCw
      class="h-3.5 w-3.5"
      :class="{ 'animate-spin': store.loading }"
    />
            
          </button>
        </Tooltip>

        <span class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text bg-background border border-primary-border sm:ml-auto sm:flex-none">
          {{ store.pagination.total_items }} clients
        </span>

        <button
          v-if="hasPermission('client.create')"
          class="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer sm:flex-none"
          @click="openCreateClientDialog"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Client</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Contact</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Address</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Referral Campaign</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">KYC Status</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Doc Status</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Sumsub ID</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Accounts</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Dates</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Actions</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.isLoading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-card-background shrink-0" />
                <div class="space-y-1.5">
                  <div class="h-3 w-24 bg-card-background rounded" />
                  <div class="h-2.5 w-28 bg-card-background rounded" />
                </div>
              </div>
            </td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-20 bg-card-background rounded" /><div class="h-2.5 w-24 bg-card-background rounded" /></div></td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-16 bg-card-background rounded" /><div class="h-2.5 w-20 bg-card-background rounded" /></div></td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-20 bg-card-background rounded" /><div class="h-2.5 w-24 bg-card-background rounded" /></div></td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-16 bg-card-background rounded" /><div class="h-2.5 w-20 bg-card-background rounded" /></div></td>
            <td class="p-3"><div class="h-5 w-16 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-5 w-16 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-5 w-20 bg-card-background rounded" /></td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-12 bg-card-background rounded" /><div class="h-2.5 w-16 bg-card-background rounded" /></div></td>
            <td class="p-3"><div class="space-y-1.5"><div class="h-3 w-16 bg-card-background rounded" /><div class="h-2.5 w-20 bg-card-background rounded" /></div></td>
            <td class="p-3 text-right"><div class="h-5 w-14 bg-card-background rounded-full ml-auto" /></td>
            <td class="p-3 text-right"><div class="h-7 w-20 bg-card-background rounded-lg ml-auto" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="12" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No clients found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="client in store.data"
            :key="client.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-white shrink-0">
                  {{ client.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-xs font-medium text-primary-text">{{ client.name }}</p>
                  <p class="text-[10px] text-secondary-text">ID: {{ client.id }}</p>
                </div>
              </div>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">{{ client.email ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text">{{ client.phone_number ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text" v-if="client.date_of_birth">DOB: {{ formatDate(client.date_of_birth) }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">{{ client.address ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text">{{ client.city ?? '—' }}, {{ client.state ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text">{{ client.country ?? '—' }} {{ client.zip_code ? `(${client.zip_code})` : '' }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">{{ client.ib_name ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text">{{ client.ib_email ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text" v-if="client.ib_id">
                Ref: {{ client.ib_referral_code ?? '' }} (ID: {{ client.ib_id }})
              </p>
            </td>

            <!-- Referral Link Column -->
            <td class="p-3">
              <div v-if="client.referral_link_code" class="space-y-1">
                <span
                  class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-1.5 py-0.5 rounded-full select-all"
                  :title="client.referral_link_name"
                >
                  <Link2 class="w-2.5 h-2.5 shrink-0" />
                  <span>{{ client.referral_link_code }}</span>
                </span>
                <p class="text-[10px] text-primary-text truncate max-w-[120px]" :title="client.referral_link_name">
                  {{ client.referral_link_name }}
                </p>
              </div>
              <span v-else class="text-xs text-secondary-text/50">—</span>
            </td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize block mb-1"
                :class="getKycClass(client.kyc_status)"
              >
                {{ client.kyc_status || 'not started' }}
              </span>
              <p class="text-[10px] text-secondary-text">{{ client.verification_channel ?? '—' }}</p>
              <p v-if="client.kyc_verified_at" class="text-[10px] text-secondary-text">✓ {{ formatDate(client.kyc_verified_at) }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text mb-1 text-nowrap">
                <span :class="client.docs_uploaded === 'True' ? 'text-green-600' : 'text-orange-600'">
                  Docs: {{ client.docs_uploaded ?? '—' }}
                </span>
              </p>
              <p class="text-xs text-primary-text mb-1">{{ client.doc_approved ?? '—' }}</p>
              <p v-if="client.kyc_reject_reason" class="text-[10px] text-red-600">Reject: {{ client.kyc_reject_reason }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs font-mono text-primary-text">{{ client.sumsub_applicant_id ?? '—' }}</p>
            </td>

            <td class="p-3 max-w-[200px]">
              <div>
                <span class="text-xs font-semibold text-primary-text block mb-1">
                  {{ client.total_accounts || 0 }} Acct{{ (client.total_accounts || 0) !== 1 ? 's' : '' }}
                </span>

                <div
                  v-if="client.account_numbers?.length"
                  class="flex flex-wrap gap-1 mb-1 max-h-10 overflow-y-auto"
                >
                  <span
                    v-for="num in client.account_numbers"
                    :key="num"
                    @click="goToTradingAccount(num)"
                    class="font-mono text-[9px] px-1 py-0.5 rounded bg-background border border-primary-border text-secondary-text cursor-pointer hover:bg-primary-hover/10 hover:text-primary transition-all duration-150"
                  >
                    {{ num }}
                  </span>
                </div>

                <div
                  v-if="client.account_types?.length"
                  class="text-[9px] text-secondary-text capitalize truncate"
                >
                  {{ client.account_types.join(', ') }}
                </div>
              </div>
            </td>

            <td class="p-3">
              <p class="text-[10px] text-nowrap text-secondary-text mb-1">Joined: {{ formatDate(client.created_at) }}</p>
              <p class="text-[10px] text-nowrap text-secondary-text mb-1">Updated: {{ formatDate(client.updated_at) }}</p>
              <p class="text-[10px] text-nowrap  text-secondary-text">Tracking ID: {{ client.tracking_id ?? '—' }}</p>
            </td>

            <td class="p-3 text-right">
              <Tooltip :text="`Click to ${client.is_active ? 'deactivate' : 'activate'}`" position="left">
                <button
                  :disabled="!hasPermission('client.update')"
                  @click="openChangeStatusDialog(client)"
                  class="text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  :class="client.is_active
                    ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-background text-secondary-text border-primary-border hover:bg-secondary-text/10'"
                >
                  {{ client.is_active ? 'Active' : 'Inactive' }}
                </button>
              </Tooltip>
            </td>

            <td class="p-3 align-middle text-center">
              <DropdownMenu
                :items="getRowActions(client)"
                @select="(item) => onMenuSelect(item, client)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <template v-if="store.isLoading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-background" />
            <div class="space-y-1.5 flex-1">
              <div class="h-3 w-32 bg-background rounded" />
              <div class="h-2.5 w-40 bg-background rounded" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="m in 6" :key="m" class="h-8 bg-background rounded-lg" />
          </div>
        </div>
      </template>

      <div v-else-if="store.data.length === 0" class="py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <Users class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No clients found</p>
        </div>
      </div>

      <div
        v-else
        v-for="client in store.data"
        :key="client.id"
        class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-white shrink-0">
              {{ client.name?.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-primary-text truncate">{{ client.name }}</p>
              <p class="text-[11px] text-secondary-text truncate">{{ client.email }}</p>
              <p v-if="client.phone_number" class="text-[10px] text-secondary-text/80 truncate">{{ client.phone_number }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 items-end shrink-0">
            <button
              class="text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
              :class="client.is_active
                ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                : 'bg-background text-secondary-text border-primary-border hover:bg-secondary-text/10'"
              @click="openChangeStatusDialog(client)"
            >
              {{ client.is_active ? 'Active' : 'Inactive' }}
            </button>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize"
              :class="getKycClass(client.kyc_status)"
            >
              {{ client.kyc_status || 'not started' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Email</p>
            <p class="font-medium text-primary-text text-[11px] truncate">{{ client.email ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Phone</p>
            <p class="font-medium text-primary-text text-[11px] truncate">{{ client.phone_number ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Date of Birth</p>
            <p class="font-medium text-primary-text text-[11px]">{{ client.date_of_birth ? formatDate(client.date_of_birth) : '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">City</p>
            <p class="font-medium text-primary-text text-[11px] truncate">{{ client.city ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Address</p>
            <p class="font-medium text-primary-text text-[11px] truncate">{{ client.address ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">State</p>
            <p class="font-medium text-primary-text text-[11px]">{{ client.state ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Zip Code</p>
            <p class="font-medium text-primary-text text-[11px]">{{ client.zip_code ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">IB Information</p>
            <p class="font-medium text-primary-text text-[11px] truncate">{{ client.ib_name ?? '—' }}</p>
            <p class="text-[10px] text-secondary-text truncate">{{ client.ib_email ?? '—' }}</p>
            <p class="text-[10px] text-secondary-text">Ref: {{ client.ib_referral_code ?? '—' }} | ID: {{ client.ib_id ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2" v-if="client.referral_link_code">
            <p class="text-[10px] text-secondary-text mb-0.5">Referral Campaign</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-2 py-0.5 rounded-full">
                <Link2 class="w-2.5 h-2.5 shrink-0" />
                <span>{{ client.referral_link_code }}</span>
              </span>
              <span class="text-[10px] text-primary-text font-medium truncate">{{ client.referral_link_name }}</span>
            </div>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">KYC Information</p>
            <p class="text-[10px] text-primary-text mb-1">Channel: {{ client.verification_channel ?? '—' }}</p>
            <p v-if="client.kyc_verified_at" class="text-[10px] text-green-600 mb-1">✓ Verified: {{ formatDate(client.kyc_verified_at) }}</p>
            <p v-if="client.kyc_reject_reason" class="text-[10px] text-red-600">Reject Reason: {{ client.kyc_reject_reason }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Document Status</p>
            <p class="text-[10px] text-primary-text mb-1">Uploaded: <span :class="client.docs_uploaded === 'True' ? 'text-green-600' : 'text-orange-600'">{{ client.docs_uploaded ?? '—' }}</span></p>
            <p class="text-[10px] text-primary-text mb-1">Approved: {{ client.doc_approved ?? '—' }}</p>
            <p class="text-[10px] text-secondary-text">SumSub ID: {{ client.sumsub_applicant_id ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Accounts ({{ client.total_accounts || 0 }})</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="num in client.account_numbers"
                :key="num"
                @click="goToTradingAccount(num)"
                class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-card-background border border-primary-border text-secondary-text cursor-pointer hover:bg-primary-hover/10 hover:text-primary transition-all duration-150"
              >
                {{ num }}
              </span>
              <span v-if="!client.account_numbers?.length" class="text-secondary-text">—</span>
            </div>
            <p v-if="client.account_types?.length" class="text-[10px] text-secondary-text mt-1 capitalize">
              Types: {{ client.account_types.join(', ') }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Timeline</p>
            <p class="text-[10px] text-primary-text">Joined: {{ formatDate(client.created_at) }}</p>
            <p class="text-[10px] text-primary-text">Updated: {{ formatDate(client.updated_at) }}</p>
            <p class="text-[10px] text-secondary-text">Tracking ID: {{ client.tracking_id ?? '—' }}</p>
          </div>
          <div v-if="hasPermission('client.update') || (client.kyc_status === 'pending' && hasPermission('client.delete'))" class="bg-background rounded-lg px-3 py-2 col-span-2 flex flex-wrap items-center justify-center gap-2">
            <button
              v-if="hasPermission('client.update')"
              @click="openEditClientDialog(client)"
              class="flex-1 min-w-[70px] text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Edit
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openChangeIBDialog(client)"
              class="flex-1 min-w-[80px] text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Change IB
            </button>
            <button
              v-if="client.is_ib === false && hasPermission('client.update')"
              @click="openMakeIBDialog(client)"
              class="flex-1 min-w-[80px] text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition animate-all duration-200 cursor-pointer"
            >
              Make IB
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openUpdateReferralLinkDrawer(client)"
              class="flex-1 min-w-[100px] text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Referral Link
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openChangeStatusDialog(client)"
              class="flex-1 min-w-[70px] text-xs font-medium py-1.5 rounded-lg transition animate-all duration-200 cursor-pointer"
              :class="client.is_active
                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'"
            >
              Status
            </button>
            <button
              v-if="client.kyc_status === 'pending' && hasPermission('client.delete')"
              @click="openDeleteClientDialog(client)"
              class="flex-1 min-w-[70px] text-xs font-medium py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition animate-all duration-200 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Change IB Dialog -->
    <ChangeIBDialog
      :open="changeIBDialogOpen"
      :client="selectedClientForChangeIB || {}"
      @close="closeChangeIBDialog"
      @success="handleChangeIBSuccess"
    />

    <!-- Change Status Dialog -->
    <ChangeStatusDialog
      :open="changeStatusDialogOpen"
      :client="selectedClientForChangeStatus || {}"
      @close="closeChangeStatusDialog"
      @success="handleChangeStatusSuccess"
    />

    <!-- Edit Client Dialog -->
    <ClientDialog
      :open="editClientDialogOpen"
      :client="selectedClientForEdit"
      @close="closeEditClientDialog"
      @success="handleEditClientSuccess"
    />

    <!-- Make IB Dialog -->
    <MakeIBDialog
      :open="makeIBDialogOpen"
      :client="selectedClientForMakeIB || {}"
      @close="closeMakeIBDialog"
      @success="handleMakeIBSuccess"
    />

    <!-- Create Client Dialog -->
    <ClientDialog
      :open="createClientDialogOpen"
      :client="null"
      @close="closeCreateClientDialog"
      @success="handleCreateClientSuccess"
    />

    <!-- Delete Client Dialog -->
    <DeleteClientDialog
      :open="deleteClientDialogOpen"
      :client="selectedClientForDelete || {}"
      @close="closeDeleteClientDialog"
      @success="handleDeleteSuccess"
    />

    <!-- Update Referral Link Drawer -->
    <UpdateReferralLinkDrawer
      :open="updateReferralLinkDrawerOpen"
      :client="selectedClientForReferralLink || {}"
      @close="closeUpdateReferralLinkDrawer"
      @success="handleUpdateReferralLinkSuccess"
    />

  </div>
</template>
