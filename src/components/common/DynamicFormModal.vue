<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-card-background border-b border-primary-border px-6 py-5 flex items-center justify-between"
        >
          <div>
            <h2 class="text-lg font-semibold text-primary-text">
              {{ title }}
            </h2>
            <p v-if="description" class="sub-text text-secondary-text mt-0.5">
              {{ description }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-6">
          <div v-for="field in fields" :key="field.model" class="space-y-2">
            <label
              v-if="!['checkbox', 'radio'].includes(field.type)"
              class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text"
            >
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
            <!-- Text input -->
            <input
              v-if="field.type === 'text'"
              v-model="form[field.model]"
              type="text"
              :placeholder="field.placeholder"
              class="input-field px-4 py-2.5 w-full"
            />

            <!-- Radio -->
            <div
              v-else-if="field.type === 'radio'"
              class="flex flex-wrap gap-4"
            >
              <label
                v-for="opt in field.options"
                :key="opt.value"
                class="flex items-center gap-2 text-sm text-primary-text cursor-pointer"
              >
                <input
                  type="radio"
                  :name="field.model"
                  :value="opt.value"
                  v-model="form[field.model]"
                  class="accent-primary"
                />
                {{ opt.label }}
              </label>
            </div>

            <!-- Checkbox (single) -->
            <div
              v-else-if="field.type === 'checkbox-group'"
              class="flex flex-wrap gap-6"
            >
              <label
                v-for="option in field.options"
                :key="option.value"
                class="flex items-center gap-2 cursor-pointer text-sm text-primary-text"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  v-model="form[field.model]"
                  class="accent-primary"
                />
                {{ option.label }}
              </label>
            </div>

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="form[field.model]"
              :placeholder="field.placeholder"
              :rows="field.rows || 3"
              class="input-field px-4 py-2.5 w-full"
            />

            <!-- Select -->
            <!-- <select
              v-else-if="field.type === 'select'"
              v-model="form[field.model]"
              class="input-field px-4 py-2.5 w-full"
            >
              <option value="" disabled>
                {{ field.placeholder || "Select an option" }}
              </option>
              <option
                v-for="opt in field.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select> -->

            <BaseSelect
              v-else-if="field.type === 'select'"
              v-model="form[field.model]"
              :options="field.options"
              :placeholder="field.placeholder || 'Select an option'"
              :searchable="field.searchable || false"
              :allow-all="field.allowAll || false"
              :all-label="field.allLabel || 'All'"
              :is-loading="field.isLoading || false"
              :variant="field.variant || 'default'"
            />

            <p v-if="field.hint" class="text-[11px] text-secondary-text">
              {{ field.hint }}
            </p>
            <p v-if="errors[field.model]" class="text-[11px] text-red-500">
              {{ errors[field.model] }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 bg-card-background border-t border-primary-border px-6 py-4 flex items-center justify-end gap-3"
        >
          <button
            @click="$emit('close')"
            class="border border-primary-border bg-card-background text-primary-text hover:bg-background transition-colors rounded-lg px-5 py-2.5 font-medium text-sm"
          >
            {{ cancelText }}
          </button>
          <button
            @click="submit"
            :disabled="loading"
            class="bg-primary text-white hover:bg-primary-hover transition-colors rounded-lg px-5 py-2.5 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ loading ? "Saving..." : submitText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { X, Save, Loader2 } from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";

/**
 * FIELD CONFIG (only text / textarea / select for now)
 * {
 *   type: "text" | "textarea" | "select",
 *   label: "Bot ID",
 *   model: "bot_id",              // key inside form object
 *   placeholder: "Enter Bot ID",
 *   required: true,
 *   rows: 4,                      // textarea only
 *   options: [{ label, value }],  // select only
 *   hint: "helper text"
 * }
 */

const props = defineProps({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  fields: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: "Save" },
  cancelText: { type: String, default: "Cancel" },
});

const emit = defineEmits(["close", "submit", "update:modelValue"]);

function buildDefaultForm() {
  const base = {};
  props.fields.forEach((f) => {
    base[f.model] = "";
  });
  return base;
}

const form = ref({ ...buildDefaultForm(), ...props.modelValue });
const errors = ref({});

watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...buildDefaultForm(), ...(val || {}) };
    errors.value = {};
  },
);

function validate() {
  const newErrors = {};
  props.fields.forEach((f) => {
    if (f.required && !form.value[f.model]) {
      newErrors[f.model] = `${f.label || f.model} is required`;
    }
  });
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function submit() {
  if (!validate()) return;
  emit("update:modelValue", { ...form.value });
  emit("submit", { ...form.value });
}
</script>
