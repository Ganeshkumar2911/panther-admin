<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import TagChip from "@/components/common/TagChip.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import { formatDate } from "@/utils/timeFormatter";
import {
  Eye,
  Edit,
  ArrowRightLeft,
  UserX,
  Phone,
  Mail,
  Plus,
  Tag,
} from "lucide-vue-next";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  leads: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: () => ({ page: 1, per_page: 10, total_items: 0, total_pages: 1 }),
  },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
  selectedStage: { type: String, default: "" },
});

const emit = defineEmits([
  "open-drawer",
  "edit-lead",
  "move-stage",
  "add-lead",
  "page-change",
  "per-page-change",
  "assign-staff",
  "manage-tags",
  "bulk-manage-tags",
]);

const { hasPermission, hasAnyPermission } = usePermissionCheck();

const selectedLeads = ref([]);
const selectedLeadIds = computed(() =>
  selectedLeads.value.map((l) => (typeof l === "object" ? l.id : l))
);

watch(
  () => props.leads,
  () => {
    selectedLeads.value = [];
  }
);

const canAssignTags = computed(() => {
  return (
    hasAnyPermission(["tags.assign", "tags.update", "tags.remove"]) ||
    hasPermission("lead.update")
  );
});

const visibleTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(0, 2);
};

const remainingTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(2);
};

function getActions(lead) {
  return [
    {
      label: "View Details",
      icon: Eye,
      handler: () => emit("open-drawer", lead),
    },
    {
      label: "Move Stage",
      icon: ArrowRightLeft,
      handler: () => emit("move-stage", lead),
    },
    {
      label: "Edit Lead",
      icon: Edit,
      handler: () => emit("edit-lead", lead),
    },
  ];
}

const isKycStatusVisible = computed(() => {
  if (!props.selectedStage) return true;
  const stage = props.selectedStage.toUpperCase();
  return ["REGISTERED", "KYC", "TRADING_ACCOUNT"].includes(stage);
});

const columns = computed(() => {
  const cols = [
    { key: "lead_code", label: "Lead Code", sortable: false },
    { key: "lead", label: "Lead", sortable: false },
    { key: "tags", label: "Tags", sortable: false },
    { key: "phone", label: "Phone", sortable: false },
    { key: "country", label: "Country", sortable: false },
    { key: "source", label: "Source", sortable: false },
    { key: "assigned_staff", label: "Assigned Staff", sortable: false },
    { key: "current_stage", label: "Current Stage", sortable: false },
  ];

  if (isKycStatusVisible.value) {
    cols.push({ key: "kyc_status", label: "KYC Status", sortable: false });
  }

  cols.push(
    { key: "priority", label: "Priority", sortable: false },
    { key: "created_at", label: "Date", sortable: false },
    { key: "actions", label: "Actions", align: "right", sortable: false },
  );

  return cols;
});

const formattedPagination = computed(() => ({
  page: props.pagination?.page || 1,
  total_pages: props.pagination?.total_pages || 1,
  total_items: props.pagination?.total_items || 0,
  per_page: props.pagination?.per_page || 10,
}));

const staffOptions = computed(() => {
  return props.staffList.map((s) => ({
    value: s.id,
    label:
      s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

function getLeadName(lead) {
  if (lead.first_name || lead.last_name) {
    return `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
  }
  return lead.name || "Unnamed Lead";
}

function getStaffName(lead) {
  if (lead.assigned_staff) {
    return (
      lead.assigned_staff.name || lead.assigned_staff.email || "Unassigned"
    );
  }
  return "Unassigned";
}

function getStageBadge(lead) {
  const current = lead.current_stage || {};
  const stageCode = current.code || lead.stage || props.stages?.[0]?.code || "";
  const stageName =
    current.name ||
    current.code ||
    lead.stage ||
    props.stages?.[0]?.name ||
    props.stages?.[0]?.code ||
    "NEW_USER";
  const matched = props.stages.find((s) => (s.code || s.key) === stageCode);
  const color = current.color || matched?.color || "var(--color-primary-blue)";

  return {
    label: stageName,
    code: stageCode,
    color,
  };
}

function getKycStatusBadge(kycStatus) {
  const status = (kycStatus || "pending").toLowerCase().replace(/_/g, " ");
  let badgeClass = "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/30";

  if (["approved", "verified", "completed"].includes(status)) {
    badgeClass = "bg-primary-green/10 text-primary-green border border-primary-green/30";
  } else if (["rejected", "failed", "declined"].includes(status)) {
    badgeClass = "bg-primary-red/10 text-primary-red border border-primary-red/30";
  }

  return {
    label: status,
    class: badgeClass,
  };
}

function getPriorityBadge(priority) {
  const p = (priority || "").toLowerCase();
  switch (p) {
    case "high":
      return "bg-primary-red/10 text-primary-red border-primary-red/30";
    case "medium":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/30";
    case "low":
      return "bg-primary-green/10 text-primary-green border-primary-green/30";
    default:
      return "bg-secondary-text/10 text-secondary-text border-secondary-text/30";
  }
}

function formatSourceLabel(source) {
  const s = (source || "").toLowerCase();
  switch (s) {
    case "website":
      return "Website";
    case "support":
      return "Support";
    case "csv_import":
      return "CSV Import";
    case "google_ads":
      return "Google Ads";
    case "facebook":
      return "Facebook";
    case "referral":
      return "Referral";
    default:
      return source || "Website";
  }
}
</script>

<template>
  <DataTable
    :data="leads"
    :columns="columns"
    :loading="loading"
    :pagination="formattedPagination"
    :selectable="canAssignTags"
    v-model:selected="selectedLeads"
    :per-page-options="[10, 25, 50, 100]"
    :min-table-width="1100"
    :row-class="() => 'cursor-pointer'"
    row-key="id"
    table-key="lead-management-table"
    empty-title="No Leads Found"
    empty-text="No lead records match your search or filter parameters. Try resetting your filters or create a new lead."
    @page-change="emit('page-change', $event)"
    @per-page-change="emit('per-page-change', Number($event))"
    @row-click="({ row }) => emit('open-drawer', row)"
  >
    <!-- Toolbar Slot: Header info & bulk actions -->
    <template #toolbar>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-semibold text-primary-text uppercase tracking-wider"
          >
            Lead Records
          </span>
          <span
            class="text-[11px] text-secondary-text bg-background border border-primary-border px-2.5 py-0.5 rounded-full font-medium"
          >
            Showing {{ (leads && leads.length) || 0 }} of
            {{ formattedPagination.total_items || (leads && leads.length) || 0 }} Leads
          </span>
        </div>

        <div v-if="canAssignTags && selectedLeadIds.length > 0" class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('bulk-manage-tags', selectedLeadIds)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
          >
            <Tag class="w-3.5 h-3.5" />
            <span>Manage Tags ({{ selectedLeadIds.length }})</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Empty State Slot -->
    <template #empty>
      <div class="py-16 text-center space-y-3 px-4">
        <div
          class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto"
        >
          <UserX class="w-6 h-6" />
        </div>
        <div class="max-w-md mx-auto">
          <h3 class="text-sm font-semibold text-primary-text">No Leads Found</h3>
          <p class="text-xs text-secondary-text mt-1">
            No lead records match your search or filter parameters. Try resetting
            your filters or create a new lead.
          </p>
        </div>
        <button
          type="button"
          @click="emit('add-lead')"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>
      </div>
    </template>

    <!-- Lead Code -->
    <template #cell-lead_code="{ row }">
      <span class="font-mono text-[11px] text-secondary-text whitespace-nowrap">
        {{ row.lead_code || `L-${row.id}` }}
      </span>
    </template>

    <!-- Lead Name & Email -->
    <template #cell-lead="{ row }">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform"
        >
          {{ getLeadName(row).charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p
            class="font-semibold text-primary-text truncate group-hover:text-primary transition-colors"
          >
            {{ getLeadName(row) }}
          </p>
          <p
            v-if="row.email"
            class="text-[11px] text-secondary-text truncate flex items-center gap-1"
          >
            <Mail class="w-2.5 h-2.5 shrink-0" />
            {{ row.email }}
          </p>
        </div>
      </div>
    </template>

    <!-- Tags Column -->
    <template #cell-tags="{ row }">
      <div class="flex flex-wrap items-center gap-1 max-w-[200px]" @click.stop>
        <TagChip
          v-for="tag in visibleTags(row.tags)"
          :key="tag.id"
          :tag="tag"
          size="sm"
        />
        <Tooltip
          v-if="remainingTags(row.tags).length"
          position="center"
          maxWidth="280px"
        >
          <span
            class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary-border bg-background/80 text-secondary-text hover:text-primary-text cursor-help transition-colors"
          >
            +{{ remainingTags(row.tags).length }}
          </span>

          <template #content>
            <div class="p-1">
              <p class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider mb-1.5">
                Additional Tags
              </p>
              <div class="flex flex-wrap gap-1 max-w-64">
                <TagChip
                  v-for="tag in remainingTags(row.tags)"
                  :key="tag.id"
                  :tag="tag"
                  size="sm"
                />
              </div>
            </div>
          </template>
        </Tooltip>
        <button
          v-if="canAssignTags"
          type="button"
          @click="emit('manage-tags', row)"
          class="p-1 rounded hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          title="Manage Tags"
        >
          <Plus class="w-3 h-3" />
        </button>
      </div>
    </template>

    <!-- Phone -->
    <template #cell-phone="{ row }">
      <span class="flex items-center gap-1 text-secondary-text whitespace-nowrap">
        <Phone class="w-3 h-3 text-secondary-text/70 shrink-0" />
        {{ row.phone || "-" }}
      </span>
    </template>

    <!-- Country -->
    <template #cell-country="{ row }">
      <span
        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-primary-border text-[11px] text-primary-text font-medium whitespace-nowrap"
      >
        <span
          v-if="row.country && getFlagCode(row.country)"
          :class="[
            'fi',
            `fi-${getFlagCode(row.country)}`,
            'fis',
            'rounded-full',
            'w-[18px]',
            'h-[18px]',
            'flex-shrink-0',
          ]"
        ></span>
        <span>{{ cleanCountryLabel(row.country) || "-" }}</span>
      </span>
    </template>

    <!-- Source -->
    <template #cell-source="{ row }">
      <span
        class="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20 whitespace-nowrap"
      >
        {{ formatSourceLabel(row.source) }}
      </span>
    </template>

    <!-- Assigned Staff -->
    <template #cell-assigned_staff="{ row }">
      <div class="whitespace-nowrap" @click.stop>
        <div v-if="row.assigned_staff" class="flex items-center gap-2">
          <div
            class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-btn-text-primary shrink-0"
          >
            {{ getStaffName(row).charAt(0).toUpperCase() }}
          </div>
          <span class="text-primary-text font-medium text-xs">{{
            getStaffName(row)
          }}</span>
        </div>
        <div v-else class="w-36">
          <BaseSelect
            :model-value="null"
            :options="staffOptions"
            placeholder="Assign Staff..."
            searchable
            variant="surface"
            @update:model-value="
              (staffId) =>
                emit('assign-staff', { leadId: row.id, staffId })
            "
          />
        </div>
      </div>
    </template>

    <!-- Stage Badge -->
    <template #cell-current_stage="{ row }">
      <span
        class="text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase shadow-xs whitespace-nowrap inline-block"
        :style="{
          backgroundColor: `${getStageBadge(row).color}15`,
          color: getStageBadge(row).color,
          borderColor: `${getStageBadge(row).color}40`,
        }"
      >
        {{ getStageBadge(row).label }}
      </span>
    </template>

    <!-- KYC Status -->
    <template #cell-kyc_status="{ row }">
      <span
        :class="[
          'text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider capitalize whitespace-nowrap inline-block',
          getKycStatusBadge(row.kyc_status || row.kycStatus).class,
        ]"
      >
        {{ getKycStatusBadge(row.kyc_status || row.kycStatus).label }}
      </span>
    </template>

    <!-- Priority -->
    <template #cell-priority="{ row }">
      <span
        :class="[
          'text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize whitespace-nowrap inline-block',
          getPriorityBadge(row.priority),
        ]"
      >
        {{ row.priority || "medium" }}
      </span>
    </template>

    <!-- Created Date -->
    <template #cell-created_at="{ row }">
      <div class="flex flex-col gap-0.5 whitespace-nowrap text-[11px] text-secondary-text">
        <span>
          <strong class="font-bold text-primary-text">Created:&nbsp;</strong>
          {{ formatDate(row.created_at) }}
        </span>
        <span>
          <strong class="font-bold text-primary-text">Updated:&nbsp;</strong>
          {{ formatDate(row.updated_at) }}
        </span>
      </div>
    </template>

    <!-- Actions -->
    <template #cell-actions="{ row }">
      <div class="flex items-center justify-end" @click.stop>
        <DropdownMenu :items="getActions(row)" position="bottom-end" />
      </div>
    </template>
  </DataTable>
</template>
