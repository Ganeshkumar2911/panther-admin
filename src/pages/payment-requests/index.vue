<template>
  <div class="px-4 pb-8">
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
      <template v-if="store.loading">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-28 bg-background rounded" />
          <div class="h-6 w-16 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            {{ card.label }}
          </p>
          <p class="text-2xl font-bold" :class="card.color">{{ card.value }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
      >
        <!-- Client Search -->
        <BaseSelect
          v-model="store.filters.user_id"
          :options="clientOptions"
          placeholder="All Clients"
          searchable
          class="w-full sm:w-40 xl:w-40"
          @search="onClientSearch"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Account Search -->
        <BaseSelect
          v-model="store.filters.trading_account_id"
          :options="accountOptions"
          placeholder="All Accounts"
          searchable
          class="w-full sm:w-44 xl:w-44"
          @search="onAccountSearch"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Type -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          :allow-all="true"
          all-label="All Types"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Approval Status -->
        <BaseSelect
          v-model="store.filters.approval_status"
          :options="statusOptions"
          placeholder="All Statuses"
          :allow-all="true"
          all-label="All Statuses"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Date Range -->
        <BaseDatePicker
          v-model="dateRangeValue"
          :range="true"
          placeholder="Filter by date range..."
          class="w-full sm:w-60 xl:w-64"
        />

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-full sm:w-32 xl:w-32"
          @update:modelValue="store.updatePerPage"
        />

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <!-- Logs Button -->
        <button
          v-if="
            hasPermission('payment_requests.platform_view') ||
            hasPermission('payment_request.platform_view')
          "
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 sm:flex-none cursor-pointer"
          @click="router.push('/payment-requests/logs')"
        >
          <FileText class="h-3.5 w-3.5" />
          <span>Logs</span>
        </button>

        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="
              () => {
                store.fetchRequests(true);
              }
            "
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full min-w-275 border-collapse text-left">
        <thead>
          <tr class="border-b border-primary-border bg-card-background">
            <th
              class="w-16 min-w-16 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              ID
            </th>
            <th
              class="min-w-40 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              User
            </th>
            <th
              class="min-w-32.5 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Account
            </th>
            <th
              class="min-w-22.5 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Type
            </th>
            <th
              class="min-w-32.5 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Amount
            </th>
            <th
              class="min-w-45 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Method & Reference
            </th>
            <th
              class="min-w-32.5 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Status
            </th>
            <th
              class="min-w-35 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Timing
            </th>
            <th
              class="min-w-35 text-right text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3"
            >
              Actions
            </th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 8"
            :key="n"
            class="border-b border-primary-border bg-card-background animate-pulse"
          >
            <td class="px-3 py-3.5">
              <div class="h-3 w-8 bg-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-24 bg-background rounded" />
                <div class="h-2.5 w-28 bg-background rounded" />
                <div class="h-2.5 w-12 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-20 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
                <div class="h-2.5 w-12 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="h-5 w-16 bg-background rounded-full" />
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-14 bg-background rounded" />
                <div class="h-2.5 w-10 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-20 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-5 w-14 bg-background rounded-full" />
                <div class="h-5 w-14 bg-background rounded-full" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-20 bg-background rounded" />
            </td>
            <td class="px-3 py-3.5 flex justify-end gap-1">
              <div class="h-6 w-16 bg-background rounded-lg" />
              <div class="h-6 w-14 bg-background rounded-lg" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="9" class="py-20 text-center bg-card-background">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-background flex items-center justify-center"
                >
                  <Receipt class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">
                  No payment requests found
                </p>
                <p class="text-xs text-secondary-text">
                  Try adjusting your filters.
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="req in store.records"
            :key="req.id"
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background/80 transition-colors"
          >
            <!-- ID -->
            <td class="px-3 py-3 text-xs font-semibold text-primary-text/80 font-mono w-16 min-w-16">
              #{{ req.id }}
            </td>

            <!-- User -->
            <td class="px-3 py-3 min-w-40">
              <div class="space-y-0.5 max-w-48">
                <p class="text-xs font-semibold text-primary-text truncate" :title="req.user_name">
                  {{ req.user_name || "—" }}
                </p>
                <p class="text-[11px] text-secondary-text truncate font-mono" :title="req.user_email">
                  {{ req.user_email || "—" }}
                </p>
                <div
                  v-if="getRequestTags(req).length"
                  class="flex flex-wrap items-center gap-1 pt-1"
                >
                  <TagChip
                    v-for="tag in visibleTags(getRequestTags(req))"
                    :key="tag.id"
                    :tag="tag"
                    size="sm"
                  />
                  <Tooltip
                    v-if="remainingTags(getRequestTags(req)).length"
                    position="center"
                    maxWidth="280px"
                  >
                    <span
                      class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary-border bg-background/80 text-secondary-text hover:text-primary-text cursor-help transition-colors"
                    >
                      +{{ remainingTags(getRequestTags(req)).length }}
                    </span>

                    <template #content>
                      <div class="p-1">
                        <p class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider mb-1.5">
                          Additional Tags
                        </p>
                        <div class="flex flex-wrap gap-1 max-w-64">
                          <TagChip
                            v-for="tag in remainingTags(getRequestTags(req))"
                            :key="tag.id"
                            :tag="tag"
                            size="sm"
                          />
                        </div>
                      </div>
                    </template>
                  </Tooltip>
                </div>
              </div>
            </td>

            <!-- Account -->
            <td class="px-3 py-3 min-w-32.5">
              <div class="space-y-0.5 max-w-40">
                <p class="text-xs font-semibold text-primary-text font-mono">
                  {{ req.trading_account_number ? `#${req.trading_account_number}` : "IB Wallet" }}
                </p>
                <p class="text-[11px] text-secondary-text capitalize">
                  <span v-if="req.account_type">{{ req.account_type }}</span>
                  <span v-if="req.broker_currency" class="uppercase font-medium text-primary-text/70 ml-1">
                    · {{ req.broker_currency }}
                  </span>
                </p>
              </div>
            </td>

            <!-- Type -->
            <td class="px-3 py-3 min-w-22.5">
              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-block"
                :class="
                  req.type?.toLowerCase() === 'deposit'
                    ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                "
              >
                {{ req.type }}
              </span>
            </td>

            <!-- Amount & Conversion -->
            <td class="px-3 py-3 min-w-32.5">
              <div class="space-y-0.5">
                <div class="flex items-baseline gap-1">
                  <span class="text-xs font-bold text-primary-text tabular-nums">
                    ${{ fmt(req.amount) }}
                  </span>
                  <span v-if="req.currency && req.currency !== 'USD'" class="text-[10px] text-secondary-text font-medium uppercase">
                    {{ req.currency }}
                  </span>
                </div>

                <!-- Paid Amount & Rate Tag (Compact) -->
                <div
                  v-if="req.paid_amount != null && req.paid_currency"
                  class="flex items-center gap-1 text-[11px] text-secondary-text tabular-nums"
                >
                  <span class="font-medium text-emerald-400">
                    {{ fmt(req.paid_amount) }} {{ req.paid_currency }}
                  </span>
                  <Tooltip
                    v-if="req.conversion_rate?.units_per_usd"
                    :text="`Exchange Rate: 1 ${req.conversion_rate.account_currency || 'USD'} = ${fmtRate(req.conversion_rate.units_per_usd)} ${req.conversion_rate.payment_currency}`"
                    position="center"
                  >
                    <span class="text-[9px] text-secondary-text/70 cursor-help underline decoration-dotted font-mono">
                      (@{{ fmtRate(req.conversion_rate.units_per_usd) }})
                    </span>
                  </Tooltip>
                </div>
              </div>
            </td>

            <!-- Gateway, Method & Identifiers -->
            <td class="px-3 py-3 min-w-42.5">
              <div class="space-y-1">
                <!-- Gateway & Method -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-semibold text-primary-text capitalize">
                    {{ req.gateway || "—" }}
                  </span>
                  <span
                    v-if="req.method"
                    class="text-[9px] font-medium px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text capitalize shrink-0"
                  >
                    {{ req.method }}
                  </span>
                  <span
                    v-if="req.acquirer && req.acquirer.toLowerCase() !== (req.gateway || '').toLowerCase()"
                    class="text-[8px] px-1 py-0.2 rounded bg-background/50 border border-primary-border text-secondary-text/80 capitalize shrink-0"
                    :title="`Acquirer: ${req.acquirer}`"
                  >
                    {{ req.acquirer }}
                  </span>
                </div>

                <!-- Identifiers: Address / TX / Ref -->
                <div class="flex flex-col gap-0.5 text-[10px]">
                  <!-- Address (Crypto) -->
                  <div
                    v-if="getAddress(req)"
                    class="flex items-center gap-1 font-mono text-[10px] text-secondary-text"
                  >
                    <span class="text-[9px] text-secondary-text/60 shrink-0">Addr:</span>
                    <Tooltip :text="getAddress(req)" position="center" textSize="9px">
                      <span class="text-primary-text cursor-help text-[9px] hover:underline">
                        {{ truncateMiddle(getAddress(req), 6, 4) }}
                      </span>
                    </Tooltip>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-background border border-transparent hover:border-primary-border text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                      title="Copy address"
                      @click.stop="copyToClipboard(getAddress(req), `addr_${req.id}`)"
                    >
                      <Check
                        v-if="copiedMap[`addr_${req.id}`]"
                        class="w-2.5 h-2.5 text-emerald-400 shrink-0"
                      />
                      <Copy v-else class="w-2.5 h-2.5 shrink-0" />
                    </button>
                  </div>

                  <!-- TXID -->
                  <div
                    v-if="req.txid"
                    class="flex items-center gap-1 font-mono text-[10px] text-secondary-text"
                  >
                    <span class="text-[9px] text-secondary-text/60 shrink-0">TX:</span>
                    <Tooltip :text="req.txid" position="center" textSize="9px">
                      <span class="text-primary-text font-medium cursor-help hover:underline">
                        {{ truncateMiddle(req.txid, 6, 4) }}
                      </span>
                    </Tooltip>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-background border border-transparent hover:border-primary-border text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                      title="Copy TX ID"
                      @click.stop="copyToClipboard(req.txid, `tx_${req.id}`)"
                    >
                      <Check
                        v-if="copiedMap[`tx_${req.id}`]"
                        class="w-2.5 h-2.5 text-emerald-400 shrink-0"
                      />
                      <Copy v-else class="w-2.5 h-2.5 shrink-0" />
                    </button>
                  </div>

                  <!-- Reference ID -->
                  <div
                    v-if="req.external_payment_id"
                    class="flex items-center gap-1 font-mono text-[10px] text-secondary-text"
                  >
                    <span class="text-[9px] text-secondary-text/60 shrink-0">Ref:</span>
                    <Tooltip :text="req.external_payment_id" position="center" textSize="9px">
                      <span class="text-primary-text font-medium cursor-help hover:underline">
                        {{ truncateMiddle(req.external_payment_id, 6, 4) }}
                      </span>
                    </Tooltip>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-background border border-transparent hover:border-primary-border text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                      title="Copy Reference ID"
                      @click.stop="copyToClipboard(req.external_payment_id, `ref_${req.id}`)"
                    >
                      <Check
                        v-if="copiedMap[`ref_${req.id}`]"
                        class="w-2.5 h-2.5 text-emerald-400 shrink-0"
                      />
                      <Copy v-else class="w-2.5 h-2.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </td>

            <!-- Status (Approval & Payment Status) -->
            <td class="px-3 py-3 min-w-32.5">
              <div class="flex flex-col gap-1 items-start">
                <!-- Approval Status Badge -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1 shrink-0"
                    :class="[
                      approvalStatusClass(req.approval_status),
                      req.approval_status === 'pending' &&
                      (hasPermission('payment_requests.approve') ||
                        hasPermission('payment_requests.reject'))
                        ? 'cursor-pointer hover:opacity-80 transition-opacity'
                        : '',
                    ]"
                    @click="
                      req.approval_status === 'pending' &&
                      (hasPermission('payment_requests.approve') ||
                        hasPermission('payment_requests.reject'))
                        ? openChangeStatusDialog(req)
                        : null
                    "
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
                    <span>{{ req.approval_status || '—' }}</span>
                  </span>

                  <!-- Rejection Tooltip Icon -->
                  <Tooltip
                    v-if="req.rejection_reason"
                    :text="`Reason: ${req.rejection_reason}`"
                    position="center"
                  >
                    <span class="p-0.5 text-primary-red cursor-help bg-primary-red/10 border border-primary-red/20 rounded inline-flex items-center justify-center shrink-0">
                      <AlertCircle class="w-3 h-3 shrink-0" />
                    </span>
                  </Tooltip>
                </div>

                <!-- Payment Status (Compact dot indicator) -->
                <div
                  v-if="req.payment_status"
                  class="flex items-center gap-1.5 text-[10px] text-secondary-text shrink-0"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :class="paymentStatusDotClass(req.payment_status)"
                  ></span>
                  <span class="capitalize font-medium">{{ req.payment_status }}</span>
                </div>
              </div>
            </td>

            <!-- Timing -->
            <td class="px-3 py-3 min-w-35 whitespace-nowrap">
              <div class="space-y-0.5 text-[11px]">
                <div class="text-primary-text font-medium">
                  {{ formatDate(req.created_at) }}
                </div>
                <div v-if="req.approved_at" class="text-[10px] text-secondary-text flex items-center gap-1">
                  <span class="text-secondary-text/60">Done:</span>
                  <span>{{ formatDate(req.approved_at) }}</span>
                </div>
                <div v-else-if="req.converted_at" class="text-[10px] text-secondary-text flex items-center gap-1">
                  <span class="text-secondary-text/60">Conv:</span>
                  <span>{{ formatDate(req.converted_at) }}</span>
                </div>
              </div>
            </td>

            <!-- Actions -->
            <td class="px-3 py-3 min-w-35">
              <div class="flex items-center justify-end gap-1.5">
                <template v-if="req.approval_status === 'pending'">
                  <button
                    v-if="hasPermission('payment_requests.approve')"
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary-green/10 text-primary-green border-primary-green/20 hover:bg-primary-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    @click="openConfirmDialog('approve', req)"
                  >
                    <Check class="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    v-if="hasPermission('payment_requests.reject')"
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary-red/10 text-primary-red border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    @click="openConfirmDialog('reject', req)"
                  >
                    <X class="w-3 h-3" />
                    Reject
                  </button>
                </template>
                <span v-else class="text-[11px] text-secondary-text font-medium"
                  >Processed</span
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <PaymentRequestConfirmDialog
      :open="confirmDialog.open"
      :request="confirmDialog.request"
      :action="confirmDialog.action"
      :loading="isConfirmLoading"
      @close="closeConfirmDialog"
      @confirm="handleConfirm"
    />

    <ChangePaymentStatusDialog
      :open="changeStatusDialog.open"
      :request="changeStatusDialog.request"
      @close="closeChangeStatusDialog"
      @success="handleStatusChangeSuccess"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Receipt, Check, X, RefreshCw, Copy, FileText, AlertCircle } from "lucide-vue-next";
import { usePaymentRequestsStore } from "@/stores/paymentRequests/paymentRequests";
import { useProfileStore } from "@/stores/profile/profile";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import TagChip from "@/components/common/TagChip.vue";
import PaymentRequestConfirmDialog from "@/components/paymentRequests/PaymentRequestConfirmDialog.vue";
import ChangePaymentStatusDialog from "@/components/paymentRequests/ChangePaymentStatusDialog.vue";
import { formatDate } from "@/utils/timeFormatter";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const router = useRouter();
const store = usePaymentRequestsStore();
const profileStore = useProfileStore();
const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const copiedMap = ref({});

// Dummy tags for testing/demonstration
const DUMMY_TAGS = [
  { id: 1, name: "VIP", color: "#F59E0B" },
  { id: 2, name: "High Volume", color: "#3B82F6" },
  { id: 3, name: "KYC Verified", color: "#10B981" },
  { id: 4, name: "Priority", color: "#EF4444" },
  { id: 5, name: "Copy Trader", color: "#8B5CF6" },
  { id: 6, name: "Risk Alert", color: "#EC4899" },
  { id: 7, name: "Affiliate", color: "#6366F1" },
  { id: 8, name: "Fast Payout", color: "#14B8A6" },
  { id: 9, name: "Institutional", color: "#F97316" },
  { id: 10, name: "Whale", color: "#06B6D4" },
];

const getRequestTags = (req) => {
  if (req.tags && req.tags.length) return req.tags;
  // Return dummy tags for testing if request has no tags
  return DUMMY_TAGS;
};

const visibleTags = (tags) => {
  if (!tags) return [];
  return tags.slice(0, 2);
};

const remainingTags = (tags) => {
  if (!tags) return [];
  return tags.slice(2);
};

const remainingTagsText = (tags) => {
  const remaining = remainingTags(tags);
  return remaining.map((t) => t.name).join(", ");
};

const truncateMiddle = (str, start = 6, end = 4) => {
  if (!str) return "";
  const s = String(str);
  if (s.length <= start + end + 2) return s;
  return `${s.slice(0, start)}...${s.slice(-end)}`;
};

const getAddress = (req) =>
  req?.address || req?.wallet_address || req?.details?.address || "";

const copyToClipboard = (text, key) => {
  if (!text) return;
  const str = String(text).trim();

  const onSuccess = () => {
    copiedMap.value[key] = true;
    snackbar.show("Copied to clipboard", "success");
    setTimeout(() => {
      copiedMap.value[key] = false;
    }, 2000);
  };

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(str)
      .then(onSuccess)
      .catch(() => {
        fallbackCopy(str, onSuccess);
      });
  } else {
    fallbackCopy(str, onSuccess);
  }
};

const fallbackCopy = (str, onSuccess) => {
  try {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(el);
    if (successful) {
      onSuccess();
    } else {
      snackbar.show("Unable to copy", "error");
    }
  } catch (e) {
    snackbar.show("Unable to copy", "error");
  }
};

const paymentStatusDotClass = (s) =>
  ({
    paid: "bg-primary-green",
    pending: "bg-primary-yellow",
    processing: "bg-blue-400",
    failed: "bg-primary-red",
    rejected: "bg-primary-red",
  })[s?.toLowerCase()] ?? "bg-secondary-text";

// ── Client / Account search options (populated from store methods) ──
const clientOptions = ref([]);
const accountOptions = ref([]);
const confirmDialog = ref({
  open: false,
  action: "approve",
  request: null,
});

const changeStatusDialog = ref({
  open: false,
  request: null,
});

const openChangeStatusDialog = (request) => {
  changeStatusDialog.value = {
    open: true,
    request,
  };
};

const closeChangeStatusDialog = () => {
  changeStatusDialog.value = {
    open: false,
    request: null,
  };
};

const handleStatusChangeSuccess = () => {
  store.fetchRequests(true);
};

let clientTimer = null;
let accountTimer = null;

const onClientSearch = (q) => {
  clearTimeout(clientTimer);
  clientTimer = setTimeout(async () => {
    const res = await store.fetchAllClients(q);

    const data = res?.data || res || [];
    clientOptions.value = (data || []).map((c) => ({
      label: c.label,
      value: c.value,
      email: c.email,
    }));
  }, 350);
};

const onAccountSearch = (q) => {
  clearTimeout(accountTimer);
  accountTimer = setTimeout(async () => {
    const res = await store.fetchAllAccounts(q);
    const data = res?.data || res || [];
    accountOptions.value = (data || []).map((a) => ({
      label: `#${a.account_number} · ${a.client_name ?? ""}`.trim(),
      value: a.account_id,
    }));
  }, 350);
};

// ── Dropdown options ──
const typeOptions = [
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// ── Date range computed wrapper for BaseDatePicker ──
const dateRangeValue = computed({
  get() {
    if (store.filters.from_date || store.filters.to_date) {
      return {
        start: store.filters.from_date || null,
        end: store.filters.to_date || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.filters.from_date = "";
      store.filters.to_date = "";
    } else if (Array.isArray(val)) {
      store.filters.from_date = val[0] || "";
      store.filters.to_date = val[1] || "";
    } else if (typeof val === "object") {
      store.filters.from_date = val.start || val.from || "";
      store.filters.to_date = val.end || val.to || "";
    }
    store.applyFilters();
  },
});

// ── Filters active check ──
const hasFilters = computed(
  () =>
    store.filters.user_id ||
    store.filters.trading_account_id ||
    store.filters.type ||
    store.filters.approval_status ||
    store.filters.from_date ||
    store.filters.to_date,
);

// ── Summary cards ──
const summaryCards = computed(() => {
  const s = store.summary;
  return [
    {
      label: "Pending Deposits",
      value: s.pending_deposits ?? 0,
      color: "text-primary-yellow",
    },
    {
      label: "Approved Deposits",
      value: s.approved_deposits ?? 0,
      color: "text-primary-green",
    },
    {
      label: "Rejected Deposits",
      value: s.rejected_deposits ?? 0,
      color: "text-primary-red",
    },
    {
      label: "Pending Withdrawals",
      value: s.pending_withdrawals ?? 0,
      color: "text-primary-yellow",
    },
    {
      label: "Approved Withdrawals",
      value: s.approved_withdrawals ?? 0,
      color: "text-primary-green",
    },
    {
      label: "Rejected Withdrawals",
      value: s.rejected_withdrawals ?? 0,
      color: "text-primary-red",
    },
  ];
});

// ── Badge helpers ──
const paymentStatusClass = (s) =>
  ({
    paid: "bg-primary-green/10 text-primary-green border-primary-green/20",
    pending:
      "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    failed: "bg-primary-red/10 text-primary-red border-primary-red/20",
    rejected: "bg-primary-red/10 text-primary-red border-primary-red/20",
  })[s?.toLowerCase()] ?? "bg-background text-secondary-text border-primary-border";

const approvalStatusClass = (s) =>
  ({
    pending:
      "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    approved: "bg-primary-green/10 text-primary-green border-primary-green/20",
    rejected: "bg-primary-red/10 text-primary-red border-primary-red/20",
  })[s?.toLowerCase()] ?? "bg-background text-secondary-text border-primary-border";

const fmt = (v) =>
  (v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtRate = (v) => {
  if (v == null) return "—";
  const num = Number(v);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const isConfirmLoading = computed(() =>
  confirmDialog.value.action === "approve"
    ? store.approveLoading
    : store.rejectLoading,
);

const openConfirmDialog = (action, request) => {
  confirmDialog.value = {
    open: true,
    action,
    request,
  };
};

const closeConfirmDialog = () => {
  if (isConfirmLoading.value) return;

  confirmDialog.value = {
    open: false,
    action: "approve",
    request: null,
  };
};

const handleConfirm = async () => {
  if (!confirmDialog.value.request) return;

  const requestId = confirmDialog.value.request.id;

  try {
    if (confirmDialog.value.action === "approve") {
      await store.approveRequest(requestId);
    } else {
      await store.rejectRequest(requestId);
    }
  } finally {
    closeConfirmDialog();
  }
};

const handlePageChange = (page) => {
  store.setPage(page);
  store.fetchRequests(true);
};

onMounted(() => store.fetchRequests());
</script>
