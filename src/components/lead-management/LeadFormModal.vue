<script setup>
import { ref, computed, watch } from "vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { countries } from "@/utils/countries.js";
import {
  X,
  UserPlus,
  Edit,
  ArrowRightLeft,
  Upload,
  Check,
} from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "add" }, // 'add', 'edit', 'moveStage', 'import'
  lead: { type: Object, default: null },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "save-lead", "import-csv"]);

// Staff options for BaseSelect
const staffOptions = computed(() => {
  return props.staffList.map((s) => ({
    value: s.id,
    label: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

// Country options derived from @/utils/countries.js
const countryOptions = computed(() => {
  return countries.map((c) => ({
    value: c.label,
    label: c.label,
  }));
});

// Source options (Enum: website, support, csv_import, google_ads, facebook, referral)
const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "support", label: "Support" },
  { value: "csv_import", label: "CSV Import" },
  { value: "google_ads", label: "Google Ads" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Referral" },
];

// Priority options (Enum: low, medium, high)
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Stage options for BaseSelect
const stageSelectOptions = computed(() => {
  if (props.stages && props.stages.length > 0) {
    return props.stages.map((s) => ({
      value: s.code || s.key,
      label: s.name || s.label || s.key,
    }));
  }
  return [
    { value: "NEW", label: "New Lead" },
    { value: "CONTACTED", label: "Contacted" },
    { value: "INTERESTED", label: "Interested" },
  ];
});

const formData = ref({
  lead_code: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "AE (🇦🇪 United Arab Emirates)",
  source: "website",
  priority: "medium",
  stage: "NEW",
  assigned_staff_id: null,
  remarks: "",
});

watch(
  () => props.lead,
  (newLead) => {
    if (newLead) {
      let initialCountry = newLead.country || "";
      const matchedCountry = countries.find(
        (c) =>
          c.label.toLowerCase().includes((initialCountry || "").toLowerCase()) ||
          c.value.toLowerCase() === (initialCountry || "").toLowerCase()
      );
      if (matchedCountry) {
        initialCountry = matchedCountry.label;
      } else if (!initialCountry) {
        initialCountry = "AE (🇦🇪 United Arab Emirates)";
      }

      formData.value = {
        lead_code: newLead.lead_code || `L-${newLead.id || "001"}`,
        first_name: newLead.first_name || newLead.name?.split(" ")[0] || "",
        last_name: newLead.last_name || newLead.name?.split(" ").slice(1).join(" ") || "",
        email: newLead.email || "",
        phone: newLead.phone || "",
        country: initialCountry,
        source: (newLead.source || "website").toLowerCase(),
        priority: (newLead.priority || "medium").toLowerCase(),
        stage: newLead.current_stage?.code || newLead.stage || "NEW",
        assigned_staff_id: newLead.assigned_staff?.id || newLead.assigned_staff_id || null,
        remarks: newLead.remarks || "",
      };
    } else {
      formData.value = {
        lead_code: `L-${Math.floor(100 + Math.random() * 900)}`,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "AE (🇦🇪 United Arab Emirates)",
        source: "website",
        priority: "medium",
        stage: "NEW",
        assigned_staff_id: null,
        remarks: "",
      };
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (props.mode === "import") {
    emit("import-csv");
    return;
  }

  const payload = {
    lead_code: formData.value.lead_code || `L-${Date.now().toString().slice(-4)}`,
    first_name: formData.value.first_name.trim(),
    last_name: formData.value.last_name.trim(),
    email: formData.value.email.trim(),
    phone: formData.value.phone.trim(),
    country: formData.value.country,
    source: formData.value.source,
    priority: formData.value.priority,
    remarks: formData.value.remarks,
    ...(formData.value.stage ? { stage: formData.value.stage } : {}),
    ...(formData.value.assigned_staff_id ? { assigned_staff_id: formData.value.assigned_staff_id } : {}),
  };

  emit("save-lead", { mode: props.mode, leadId: props.lead?.id, payload });
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] md:w-[560px] max-w-full bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <UserPlus v-if="mode === 'add'" class="w-5 h-5" />
              <Edit v-else-if="mode === 'edit'" class="w-5 h-5" />
              <ArrowRightLeft v-else-if="mode === 'moveStage'" class="w-5 h-5" />
              <Upload v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-primary-text">
                <span v-if="mode === 'add'">Create New Lead</span>
                <span v-else-if="mode === 'edit'">Edit Lead Details</span>
                <span v-else-if="mode === 'moveStage'">Move Lead Stage</span>
                <span v-else>Import Leads from CSV</span>
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                <span v-if="mode === 'add'">Add a new lead to the CRM onboarding pipeline.</span>
                <span v-else-if="mode === 'edit'">Update lead contact or details according to API schema.</span>
                <span v-else-if="mode === 'moveStage'">Advance lead status to the next funnel stage.</span>
                <span v-else>Upload CSV batch file to import leads.</span>
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-lg hover:bg-background/80 flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Form -->
        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Mode: Move Stage Only -->
            <div v-if="mode === 'moveStage'" class="space-y-3">
              <p class="text-xs text-primary-text font-medium">
                Select target stage for lead
                <strong class="text-primary">{{ lead?.first_name ? `${lead.first_name} ${lead.last_name || ''}` : lead?.name }}</strong>:
              </p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-for="s in stageSelectOptions"
                  :key="s.value"
                  @click="formData.stage = s.value"
                  :class="[
                    'p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer',
                    formData.stage === s.value
                      ? 'border-primary bg-primary/10 font-bold text-primary shadow-xs'
                      : 'border-primary-border bg-background hover:border-primary/40 text-primary-text',
                  ]"
                >
                  <span class="text-[11px] uppercase tracking-tight">{{ s.label }}</span>
                  <Check v-if="formData.stage === s.value" class="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>

            <!-- Mode: Import CSV -->
            <div v-else-if="mode === 'import'" class="space-y-4 text-center py-8">
              <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <Upload class="w-8 h-8" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-primary-text">Upload CSV File</h4>
                <p class="text-xs text-secondary-text mt-1 max-w-xs mx-auto">
                  Drag and drop your lead export CSV or click browse to select file (.csv, .xlsx).
                </p>
              </div>
              <div class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 transition-colors bg-background/50 cursor-pointer">
                <span class="text-xs text-primary font-medium">Browse File from Computer</span>
              </div>
            </div>

            <!-- Mode: Add or Edit -->
            <div v-else class="space-y-4">
              <!-- Lead Code & Email -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">
                    Lead Code <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.lead_code"
                    required
                    type="text"
                    placeholder="e.g. L-101"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary uppercase font-mono transition-all"
                  />
                </div>
                <div>
                  <label class="block text-secondary-text font-medium mb-1">Email Address</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="john@example.com"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <!-- First Name & Last Name -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">
                    First Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.first_name"
                    required
                    type="text"
                    placeholder="e.g. John"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label class="block text-secondary-text font-medium mb-1">Last Name</label>
                  <input
                    v-model="formData.last_name"
                    type="text"
                    placeholder="e.g. Doe"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <!-- Phone & Country -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">Phone Number</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+1 234 567 890"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1">Country</label>
                  <BaseSelect
                    v-model="formData.country"
                    :options="countryOptions"
                    placeholder="Search country..."
                    searchable
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Source & Priority -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">Lead Source</label>
                  <BaseSelect
                    v-model="formData.source"
                    :options="sourceOptions"
                    placeholder="Select source..."
                    variant="surface"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1">Priority</label>
                  <BaseSelect
                    v-model="formData.priority"
                    :options="priorityOptions"
                    placeholder="Select priority..."
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Pipeline Stage & Staff Assignment -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">Pipeline Stage</label>
                  <BaseSelect
                    v-model="formData.stage"
                    :options="stageSelectOptions"
                    placeholder="Select pipeline stage..."
                    variant="surface"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1">Assigned Staff</label>
                  <BaseSelect
                    v-model="formData.assigned_staff_id"
                    :options="staffOptions"
                    placeholder="Select staff member..."
                    searchable
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Remarks / Notes -->
              <div>
                <label class="block text-secondary-text font-medium mb-1">Remarks / Notes</label>
                <textarea
                  v-model="formData.remarks"
                  rows="3"
                  placeholder="Enter initial lead notes or remarks..."
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs resize-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="pt-4 mt-6 border-t border-primary-border flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span v-if="mode === 'add'">Create Lead</span>
              <span v-else-if="mode === 'edit'">Save Changes</span>
              <span v-else-if="mode === 'moveStage'">Update Stage</span>
              <span v-else>Import File</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
