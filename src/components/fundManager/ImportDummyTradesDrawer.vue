<template>
  <div>
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="handleClose"
      />
    </Transition>

    <!-- Drawer Panel (Wide for Spreadsheet Preview) -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between gap-4 bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 bg-primary/10 border-primary/20 text-primary"
            >
              <FileSpreadsheet class="w-5 h-5 text-primary" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  Import Dummy Trades
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles class="w-3 h-3" />
                  {{ labelName }}
                </span>
                <span class="text-xs text-secondary-text font-mono">
                  FM ID: #{{ fmId }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                Upload and preview trade history data in Excel (.xlsx, .xls) or
                CSV format.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Download Sample Template Button -->
            <button
              type="button"
              @click="downloadTemplate"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
              title="Download sample spreadsheet template"
            >
              <Download class="w-3.5 h-3.5 text-primary" />
              <span class="hidden sm:inline">Sample Template</span>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- UPLOAD DROPZONE AREA -->
          <div
            class="border-2 border-dashed rounded-2xl p-6 transition-all duration-200 text-center relative"
            :class="[
              dragOver
                ? 'border-primary bg-primary/5 scale-[0.99]'
                : selectedFile
                  ? 'border-primary/40 bg-card-background/60'
                  : 'border-primary-border hover:border-primary/50 bg-background/30 hover:bg-background/50',
            ]"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
              class="hidden"
              @change="onFileSelected"
            />

            <!-- Empty State / Drag Prompt -->
            <div
              v-if="!selectedFile"
              class="flex flex-col items-center justify-center py-4 cursor-pointer"
              @click="triggerFileInput"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-xs"
              >
                <UploadCloud class="w-7 h-7 text-primary animate-bounce-slow" />
              </div>
              <h4 class="text-sm font-bold text-primary-text mb-1">
                Drop your Excel or CSV file here, or
                <span class="text-primary underline">browse</span>
              </h4>
              <p class="text-xs text-secondary-text max-w-sm">
                Supports .xlsx, .xls and .csv files formatted with standard
                trade columns (ticket, symbol, type, lot, entry_price,
                exit_price, pnl, status, etc.).
              </p>
            </div>

            <!-- File Selected Banner -->
            <div
              v-else
              class="flex flex-col sm:flex-row items-center justify-between gap-4 py-2"
            >
              <div class="flex items-center gap-3.5 min-w-0">
                <div
                  class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0"
                >
                  <FileSpreadsheet class="w-6 h-6" />
                </div>
                <div class="text-left min-w-0">
                  <h4
                    class="text-sm font-bold text-primary-text truncate"
                    :title="selectedFile.name"
                  >
                    {{ selectedFile.name }}
                  </h4>
                  <div
                    class="flex items-center gap-2 text-xs text-secondary-text mt-0.5"
                  >
                    <span class="font-mono">{{
                      formatFileSize(selectedFile.size)
                    }}</span>
                    <span>•</span>
                    <span
                      class="text-emerald-500 font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5" />
                      {{ previewRows.length }} rows parsed
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="px-3 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary-text transition cursor-pointer"
                >
                  Change File
                </button>
                <button
                  type="button"
                  @click="clearFile"
                  class="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition cursor-pointer"
                  title="Remove File"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- PARSING LOADER / ERROR -->
          <div
            v-if="isParsing"
            class="flex items-center justify-center py-10 gap-3 text-secondary-text"
          >
            <Loader2 class="w-5 h-5 animate-spin text-primary" />
            <span class="text-xs font-semibold"
              >Reading spreadsheet data...</span
            >
          </div>

          <div
            v-else-if="parseError"
            class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5"
          >
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="font-bold">Error reading file</p>
              <p class="text-rose-400 mt-0.5">{{ parseError }}</p>
            </div>
          </div>

          <!-- SPREADSHEET PREVIEW TABLE -->
          <div v-else-if="previewRows.length > 0" class="space-y-3">
            <!-- Preview Metrics Summary Bar -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                class="bg-background/60 border border-primary-border/60 rounded-xl p-3"
              >
                <span
                  class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block"
                  >Total Trades</span
                >
                <span
                  class="text-base font-extrabold text-primary-text font-mono mt-0.5 block"
                >
                  {{ previewRows.length }}
                </span>
              </div>
              <div
                class="bg-background/60 border border-primary-border/60 rounded-xl p-3"
              >
                <span
                  class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block"
                  >Buy / Sell</span
                >
                <span
                  class="text-base font-extrabold text-primary font-mono mt-0.5 block"
                >
                  {{ buyCount }}
                  <span class="text-xs font-normal text-secondary-text"
                    >BUY</span
                  >
                  / {{ sellCount }}
                  <span class="text-xs font-normal text-secondary-text"
                    >SELL</span
                  >
                </span>
              </div>
              <div
                class="bg-background/60 border border-primary-border/60 rounded-xl p-3"
              >
                <span
                  class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block"
                  >Total Net PnL</span
                >
                <span
                  class="text-base font-extrabold font-mono mt-0.5 block"
                  :class="
                    totalPnL >= 0 ? 'text-primary-green' : 'text-primary-red'
                  "
                >
                  {{ totalPnL >= 0 ? "+" : ""
                  }}{{
                    totalPnL.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}
                </span>
              </div>
              <div
                class="bg-background/60 border border-primary-border/60 rounded-xl p-3"
              >
                <span
                  class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block"
                  >Status Split</span
                >
                <span
                  class="text-base font-extrabold text-primary-text font-mono mt-0.5 block"
                >
                  {{ closedCount }}
                  <span class="text-xs font-normal text-secondary-text"
                    >Closed</span
                  >
                  / {{ openCount }}
                  <span class="text-xs font-normal text-secondary-text"
                    >Open</span
                  >
                </span>
              </div>
            </div>

            <!-- Table Container (Spreadsheet Look) -->
            <div
              class="border border-primary-border rounded-2xl overflow-hidden bg-card-background/60 shadow-xs"
            >
              <div
                class="px-4 py-3 border-b border-primary-border bg-background/50 flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-2">
                  <FileSpreadsheet class="w-4 h-4 text-primary" />
                  <span class="text-xs font-bold text-primary-text"
                    >Spreadsheet Preview</span
                  >
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                  >
                    Showing {{ previewRows.length }} rows
                  </span>
                </div>

                <span class="text-[11px] text-secondary-text">
                  Scroll horizontally to view all columns
                </span>
              </div>

              <div class="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table
                  class="w-full min-w-[920px] border-collapse text-left text-xs"
                >
                  <thead
                    class="sticky top-0 z-10 bg-background border-b border-primary-border shadow-2xs"
                  >
                    <tr
                      class="text-[10px] font-bold uppercase tracking-wider text-secondary-text"
                    >
                      <th class="py-2.5 px-3">#</th>
                      <th class="py-2.5 px-3">Ticket</th>
                      <th class="py-2.5 px-3">Symbol</th>
                      <th class="py-2.5 px-3">Type</th>
                      <th class="py-2.5 px-3 text-right">Lot</th>
                      <th class="py-2.5 px-3 text-right">Entry Price</th>
                      <th class="py-2.5 px-3 text-right">Exit Price</th>
                      <th class="py-2.5 px-3 text-right">SL</th>
                      <th class="py-2.5 px-3 text-right">TP</th>
                      <th class="py-2.5 px-3 text-right">PnL</th>
                      <th class="py-2.5 px-3 text-center">Status</th>
                      <th class="py-2.5 px-3">Opened At</th>
                      <th class="py-2.5 px-3">Closed At</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-border/60">
                    <tr
                      v-for="(row, idx) in previewRows"
                      :key="idx"
                      class="hover:bg-background/50 transition-colors font-mono text-[11px]"
                    >
                      <!-- Index -->
                      <td class="py-2 px-3 text-secondary-text text-[10px]">
                        {{ idx + 1 }}
                      </td>

                      <!-- Ticket -->
                      <td class="py-2 px-3 font-bold text-primary-text">
                        {{ row.ticket || row.Ticket || "—" }}
                      </td>

                      <!-- Symbol -->
                      <td class="py-2 px-3 font-extrabold text-primary-text">
                        <span
                          class="px-1.5 py-0.5 rounded bg-background border border-primary-border"
                        >
                          {{ row.symbol || row.Symbol || "—" }}
                        </span>
                      </td>

                      <!-- Type (BUY/SELL) -->
                      <td class="py-2 px-3">
                        <span
                          class="px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider border"
                          :class="
                            isBuyType(row.type || row.Type)
                              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                              : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                          "
                        >
                          {{ (row.type || row.Type || "BUY").toUpperCase() }}
                        </span>
                      </td>

                      <!-- Lot -->
                      <td
                        class="py-2 px-3 text-right text-primary-text font-bold"
                      >
                        {{ row.lot ?? row.Lot ?? "—" }}
                      </td>

                      <!-- Entry Price -->
                      <td class="py-2 px-3 text-right text-primary-text">
                        {{
                          formatNum(
                            row.entry_price ??
                              row.Entry_Price ??
                              row.entryPrice,
                          )
                        }}
                      </td>

                      <!-- Exit Price -->
                      <td class="py-2 px-3 text-right text-primary-text">
                        {{
                          formatNum(
                            row.exit_price ?? row.Exit_Price ?? row.exitPrice,
                          )
                        }}
                      </td>

                      <!-- SL -->
                      <td class="py-2 px-3 text-right text-secondary-text">
                        {{
                          formatNum(
                            row.stop_loss ?? row.Stop_Loss ?? row.stopLoss,
                          )
                        }}
                      </td>

                      <!-- TP -->
                      <td class="py-2 px-3 text-right text-secondary-text">
                        {{
                          formatNum(
                            row.take_profit ??
                              row.Take_Profit ??
                              row.takeProfit,
                          )
                        }}
                      </td>

                      <!-- PnL -->
                      <td
                        class="py-2 px-3 text-right font-bold"
                        :class="
                          Number(row.pnl ?? row.PnL ?? row.p_n_l ?? 0) >= 0
                            ? 'text-primary-green'
                            : 'text-primary-red'
                        "
                      >
                        {{ formatPnl(row.pnl ?? row.PnL ?? row.p_n_l) }}
                      </td>

                      <!-- Status -->
                      <td class="py-2 px-3 text-center">
                        <span
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                          :class="
                            String(
                              row.status || row.Status || '',
                            ).toLowerCase() === 'open'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          "
                        >
                          {{ row.status || row.Status || "closed" }}
                        </span>
                      </td>

                      <!-- Opened At -->
                      <td
                        class="py-2 px-3 text-secondary-text whitespace-nowrap text-[10px]"
                      >
                        {{
                          row.opened_at || row.Opened_At || row.openedAt || "—"
                        }}
                      </td>

                      <!-- Closed At -->
                      <td
                        class="py-2 px-3 text-secondary-text whitespace-nowrap text-[10px]"
                      >
                        {{
                          row.closed_at || row.Closed_At || row.closedAt || "—"
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between gap-3 shrink-0"
        >
          <div class="text-xs text-secondary-text">
            <span
              v-if="previewRows.length > 0"
              class="font-mono text-primary-text font-bold"
            >
              {{ previewRows.length }} trades ready to import
            </span>
            <span v-else>
              Please upload a spreadsheet file to preview and import trades.
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-card-background border border-primary-border text-primary-text hover:bg-background text-xs font-semibold transition cursor-pointer"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              Cancel
            </button>

            <button
              type="button"
              class="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="
                !selectedFile || previewRows.length === 0 || isSubmitting
              "
              @click="handleImportSubmit"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <FileSpreadsheet v-else class="w-4 h-4" />
              <span>{{
                isSubmitting ? "Importing Trades..." : "Import Dummy Trades"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-vue-next";
import * as XLSX from "xlsx";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);

const store = useFmLeaderboardStore();
const snackbar = useSnackbarStore();

const fileInputRef = ref(null);
const selectedFile = ref(null);
const dragOver = ref(false);
const previewRows = ref([]);
const isParsing = ref(false);
const parseError = ref(null);
const isSubmitting = ref(false);

const fmId = computed(() => {
  return (
    props.item?.fm_id ||
    props.item?.dummy_fm?.fm_id ||
    props.item?.fund_manager?.id ||
    props.item?.id ||
    "—"
  );
});

const labelName = computed(() => {
  return (
    props.item?.label_name ||
    props.item?.fund_manager?.label_name ||
    props.item?.user_name ||
    `FM #${fmId.value}`
  );
});

// Metrics computed for preview
const buyCount = computed(() => {
  return previewRows.value.filter((r) => isBuyType(r.type || r.Type)).length;
});

const sellCount = computed(() => {
  return previewRows.value.length - buyCount.value;
});

const totalPnL = computed(() => {
  return previewRows.value.reduce((acc, r) => {
    const val = Number(r.pnl ?? r.PnL ?? r.p_n_l ?? 0) || 0;
    return acc + val;
  }, 0);
});

const closedCount = computed(() => {
  return previewRows.value.filter(
    (r) => String(r.status || r.Status || "").toLowerCase() !== "open",
  ).length;
});

const openCount = computed(() => {
  return previewRows.value.length - closedCount.value;
});

const isBuyType = (val) => {
  return (
    String(val || "")
      .trim()
      .toUpperCase() === "BUY"
  );
};

const formatNum = (val) => {
  if (val === "" || val === null || val === undefined) return "—";
  const num = Number(val);
  return isNaN(num) ? String(val) : num.toString();
};

const formatPnl = (val) => {
  if (val === "" || val === null || val === undefined) return "0.00";
  const num = Number(val) || 0;
  return (num >= 0 ? "+" : "") + num.toFixed(2);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
};

const onDrop = (e) => {
  dragOver.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  const isExtValid = /\.(xlsx|xls|csv)$/i.test(file.name);
  if (!isExtValid) {
    snackbar.show("Please upload an Excel (.xlsx, .xls) or CSV file.", "error");
    return;
  }

  selectedFile.value = file;
  isParsing.value = true;
  parseError.value = null;
  previewRows.value = [];

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!json || json.length === 0) {
        parseError.value = "The uploaded spreadsheet contains no data rows.";
        isParsing.value = false;
        return;
      }

      previewRows.value = json;
      isParsing.value = false;
    } catch (err) {
      console.error("File parsing error:", err);
      parseError.value =
        "Could not parse the file. Please ensure it is a valid spreadsheet.";
      isParsing.value = false;
    }
  };

  reader.onerror = () => {
    parseError.value = "Error reading the uploaded file.";
    isParsing.value = false;
  };

  reader.readAsArrayBuffer(file);
};

const clearFile = () => {
  selectedFile.value = null;
  previewRows.value = [];
  parseError.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const handleClose = () => {
  if (isSubmitting.value) return;
  clearFile();
  emit("close");
};

// Download Sample Template matching the exact screenshot
const downloadTemplate = () => {
  const sampleData = [
    {
      ticket: 100001,
      symbol: "EURUSD",
      type: "BUY",
      lot: 1,
      entry_price: 1.085,
      exit_price: 1.0895,
      stop_loss: 1.081,
      take_profit: 1.092,
      pnl: 450,
      status: "closed",
      opened_at: "2026-08-10 10:00:00",
      closed_at: "2026-08-10 12:30:00",
    },
    {
      ticket: 100002,
      symbol: "GBPUSD",
      type: "SELL",
      lot: 0.5,
      entry_price: 1.27,
      exit_price: 1.264,
      stop_loss: 1.275,
      take_profit: 1.26,
      pnl: 300,
      status: "closed",
      opened_at: "2026-08-10 11:15:00",
      closed_at: "2026-08-10 14:20:00",
    },
    {
      ticket: 100003,
      symbol: "USDJPY",
      type: "BUY",
      lot: 0.5,
      entry_price: 150.25,
      exit_price: 149.8,
      stop_loss: 149.5,
      take_profit: 151.2,
      pnl: -150,
      status: "closed",
      opened_at: "2026-08-11 09:30:00",
      closed_at: "2026-08-11 10:45:00",
    },
    {
      ticket: 100004,
      symbol: "XAUUSD",
      type: "BUY",
      lot: 0.2,
      entry_price: 2500.5,
      exit_price: 2525,
      stop_loss: 2480,
      take_profit: 2540,
      pnl: 490,
      status: "closed",
      opened_at: "2026-08-11 13:00:00",
      closed_at: "2026-08-11 16:30:00",
    },
    {
      ticket: 100005,
      symbol: "BTCUSD",
      type: "BUY",
      lot: 0.1,
      entry_price: 62500,
      exit_price: 64100,
      stop_loss: 61000,
      take_profit: 65000,
      pnl: 1600,
      status: "closed",
      opened_at: "2026-08-12 08:00:00",
      closed_at: "2026-08-12 18:00:00",
    },
    {
      ticket: 100006,
      symbol: "AUDUSD",
      type: "BUY",
      lot: 2,
      entry_price: 0.655,
      exit_price: 0.659,
      stop_loss: 0.651,
      take_profit: 0.662,
      pnl: 800,
      status: "closed",
      opened_at: "2026-08-12 10:10:00",
      closed_at: "2026-08-12 11:50:00",
    },
    {
      ticket: 100007,
      symbol: "USDCAD",
      type: "SELL",
      lot: 1.5,
      entry_price: 1.355,
      exit_price: 1.359,
      stop_loss: 1.36,
      take_profit: 1.348,
      pnl: -441.5,
      status: "closed",
      opened_at: "2026-08-12 14:00:00",
      closed_at: "2026-08-12 15:30:00",
    },
    {
      ticket: 100008,
      symbol: "EURUSD",
      type: "SELL",
      lot: 1,
      entry_price: 1.088,
      exit_price: 1.0835,
      stop_loss: 1.092,
      take_profit: 1.08,
      pnl: 450,
      status: "closed",
      opened_at: "2026-08-13 09:00:00",
      closed_at: "2026-08-13 11:20:00",
    },
    {
      ticket: 100009,
      symbol: "XAUUSD",
      type: "SELL",
      lot: 0.5,
      entry_price: 2530,
      exit_price: 2510,
      stop_loss: 2545,
      take_profit: 2500,
      pnl: 1000,
      status: "closed",
      opened_at: "2026-08-13 12:00:00",
      closed_at: "2026-08-13 17:00:00",
    },
    {
      ticket: 100010,
      symbol: "GBPUSD",
      type: "BUY",
      lot: 1,
      entry_price: 1.268,
      exit_price: 1.268,
      stop_loss: 1.262,
      take_profit: 1.278,
      pnl: 0,
      status: "open",
      opened_at: "2026-08-14 08:30:00",
      closed_at: "",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dummy Trades");
  XLSX.writeFile(wb, "dummy_trades_template.xlsx");
};

// Handle Import Submit
const handleImportSubmit = async () => {
  if (!selectedFile.value || !fmId.value || fmId.value === "—") return;

  isSubmitting.value = true;
  try {
    await store.importDummyTrades(fmId.value, selectedFile.value);
    emit("success");
    handleClose();
  } catch (_) {
    // Error snackbar handled by store
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 2s infinite ease-in-out;
}
</style>
