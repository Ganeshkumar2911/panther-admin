<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-background/50 border border-primary-border rounded-2xl p-5 shadow-xs"
    >
      <div>
        <div class="flex items-center gap-2.5">
          <ShieldAlert class="w-5 h-5 text-primary" />
          <h3 class="text-base font-bold text-primary-text">
            Global Transaction Restrictions
          </h3>
        </div>
        <p class="text-xs text-secondary-text mt-1">
          Enable or restrict deposit, withdrawal, and internal transfer permissions globally across all registered client accounts.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-primary-border text-xs font-semibold text-primary-text">
          <Users class="w-3.5 h-3.5 text-primary" />
          <span>Scope: All Clients</span>
        </span>
      </div>
    </div>

    <!-- Direct Toggle Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- 1. Deposit Restriction Card -->
      <div
        class="bg-card-background border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-200 shadow-xs relative overflow-hidden group"
        :class="
          store.restrictions.restrict_deposit
            ? 'border-red-500/30 hover:border-red-500/50'
            : 'border-primary-border hover:border-primary/40'
        "
      >
        <!-- Top status bar -->
        <div
          class="absolute inset-x-0 top-0 h-1 transition-colors"
          :class="store.restrictions.restrict_deposit ? 'bg-primary-red' : 'bg-primary-green'"
        />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.restrictions.restrict_deposit ? 'bg-red-500/10 text-primary-red' : 'bg-green-500/10 text-primary-green'">
              <ArrowDownLeft class="w-4 h-4" />
            </div>

            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
              :class="
                store.restrictions.restrict_deposit
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-green-500/10 text-green-700 border-green-500/20'
              "
            >
              {{ store.restrictions.restrict_deposit ? 'Restricted' : 'Allowed' }}
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">Client Deposits</h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              {{
                store.restrictions.restrict_deposit
                  ? 'Deposits are BLOCKED. Clients cannot add funds through any channel.'
                  : 'Deposits are ALLOWED. Clients can freely deposit funds.'
              }}
            </p>
          </div>
        </div>

        <!-- Toggle Row -->
        <div class="pt-4 border-t border-primary-border/40 flex items-center justify-between">
          <span class="text-xs font-semibold text-primary-text">
            {{ store.restrictions.restrict_deposit ? 'Restrict Deposits' : 'Allow Deposits' }}
          </span>

          <button
            type="button"
            :disabled="store.updateLoading || !hasPermission(['client.update', 'payment_methods.update', 'xtention_dev.view'])"
            @click="toggleRestriction('restrict_deposit')"
            class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="store.restrictions.restrict_deposit ? 'bg-primary-red' : 'bg-primary-border'"
            :title="store.restrictions.restrict_deposit ? 'Click to Allow Deposits' : 'Click to Restrict Deposits'"
          >
            <span
              v-if="store.updatingKey !== 'restrict_deposit'"
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              :class="store.restrictions.restrict_deposit ? 'translate-x-6' : 'translate-x-0'"
            />
            <Loader2
              v-else
              class="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin"
            />
          </button>
        </div>
      </div>

      <!-- 2. Withdrawal Restriction Card -->
      <div
        class="bg-card-background border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-200 shadow-xs relative overflow-hidden group"
        :class="
          store.restrictions.restrict_withdrawal
            ? 'border-red-500/30 hover:border-red-500/50'
            : 'border-primary-border hover:border-primary/40'
        "
      >
        <!-- Top status bar -->
        <div
          class="absolute inset-x-0 top-0 h-1 transition-colors"
          :class="store.restrictions.restrict_withdrawal ? 'bg-primary-red' : 'bg-primary-green'"
        />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.restrictions.restrict_withdrawal ? 'bg-red-500/10 text-primary-red' : 'bg-green-500/10 text-primary-green'">
              <ArrowUpRight class="w-4 h-4" />
            </div>

            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
              :class="
                store.restrictions.restrict_withdrawal
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-green-500/10 text-green-700 border-green-500/20'
              "
            >
              {{ store.restrictions.restrict_withdrawal ? 'Restricted' : 'Allowed' }}
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">Client Withdrawals</h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              {{
                store.restrictions.restrict_withdrawal
                  ? 'Withdrawals are BLOCKED. Payout requests are disallowed.'
                  : 'Withdrawals are ALLOWED. Clients can request fund withdrawals.'
              }}
            </p>
          </div>
        </div>

        <!-- Toggle Row -->
        <div class="pt-4 border-t border-primary-border/40 flex items-center justify-between">
          <span class="text-xs font-semibold text-primary-text">
            {{ store.restrictions.restrict_withdrawal ? 'Restrict Withdrawals' : 'Allow Withdrawals' }}
          </span>

          <button
            type="button"
            :disabled="store.updateLoading || !hasPermission(['client.update', 'payment_methods.update', 'xtention_dev.view'])"
            @click="toggleRestriction('restrict_withdrawal')"
            class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="store.restrictions.restrict_withdrawal ? 'bg-primary-red' : 'bg-primary-border'"
            :title="store.restrictions.restrict_withdrawal ? 'Click to Allow Withdrawals' : 'Click to Restrict Withdrawals'"
          >
            <span
              v-if="store.updatingKey !== 'restrict_withdrawal'"
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              :class="store.restrictions.restrict_withdrawal ? 'translate-x-6' : 'translate-x-0'"
            />
            <Loader2
              v-else
              class="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin"
            />
          </button>
        </div>
      </div>

      <!-- 3. Internal Transfer Restriction Card -->
      <div
        class="bg-card-background border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-200 shadow-xs relative overflow-hidden group"
        :class="
          store.restrictions.restrict_internal_transfer
            ? 'border-red-500/30 hover:border-red-500/50'
            : 'border-primary-border hover:border-primary/40'
        "
      >
        <!-- Top status bar -->
        <div
          class="absolute inset-x-0 top-0 h-1 transition-colors"
          :class="store.restrictions.restrict_internal_transfer ? 'bg-primary-red' : 'bg-primary-green'"
        />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.restrictions.restrict_internal_transfer ? 'bg-red-500/10 text-primary-red' : 'bg-green-500/10 text-primary-green'">
              <RefreshCw class="w-4 h-4" />
            </div>

            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
              :class="
                store.restrictions.restrict_internal_transfer
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-green-500/10 text-green-700 border-green-500/20'
              "
            >
              {{ store.restrictions.restrict_internal_transfer ? 'Restricted' : 'Allowed' }}
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">Internal Transfers</h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              {{
                store.restrictions.restrict_internal_transfer
                  ? 'Internal transfers are BLOCKED between wallets and accounts.'
                  : 'Internal transfers are ALLOWED between wallets and accounts.'
              }}
            </p>
          </div>
        </div>

        <!-- Toggle Row -->
        <div class="pt-4 border-t border-primary-border/40 flex items-center justify-between">
          <span class="text-xs font-semibold text-primary-text">
            {{ store.restrictions.restrict_internal_transfer ? 'Restrict Transfers' : 'Allow Transfers' }}
          </span>

          <button
            type="button"
            :disabled="store.updateLoading || !hasPermission(['client.update', 'payment_methods.update', 'xtention_dev.view'])"
            @click="toggleRestriction('restrict_internal_transfer')"
            class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="store.restrictions.restrict_internal_transfer ? 'bg-primary-red' : 'bg-primary-border'"
            :title="store.restrictions.restrict_internal_transfer ? 'Click to Allow Internal Transfers' : 'Click to Restrict Internal Transfers'"
          >
            <span
              v-if="store.updatingKey !== 'restrict_internal_transfer'"
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              :class="store.restrictions.restrict_internal_transfer ? 'translate-x-6' : 'translate-x-0'"
            />
            <Loader2
              v-else
              class="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Information & Impact Notice -->
    <div class="bg-card-background/60 border border-primary-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-primary-text">
            Real-time System Synchronization
          </h4>
          <p class="text-[11px] text-secondary-text mt-0.5">
            Toggling any option immediately triggers the bulk restriction update API for all clients.
          </p>
        </div>
      </div>

      <div v-if="store.restrictions.updated_count !== null" class="flex items-center gap-2 text-xs font-mono text-secondary-text shrink-0 bg-background px-3 py-1.5 rounded-xl border border-primary-border">
        <span>Last Impact:</span>
        <strong class="text-primary-text">{{ store.restrictions.updated_count.toLocaleString() }} clients updated</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ShieldAlert,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Coins,
  Loader2,
} from "lucide-vue-next";
import { usePaymentSettingsStore } from "@/stores/paymentSettings/paymentSettings";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = usePaymentSettingsStore();
const { hasPermission } = usePermissionCheck();

const toggleRestriction = (key) => {
  const nextValue = !store.restrictions[key];

  const payload = {
    restrict_deposit: key === "restrict_deposit" ? nextValue : Boolean(store.restrictions.restrict_deposit),
    restrict_withdrawal: key === "restrict_withdrawal" ? nextValue : Boolean(store.restrictions.restrict_withdrawal),
    restrict_internal_transfer: key === "restrict_internal_transfer" ? nextValue : Boolean(store.restrictions.restrict_internal_transfer),
  };

  store.updateBulkRestrictions(payload, key);
};
</script>
