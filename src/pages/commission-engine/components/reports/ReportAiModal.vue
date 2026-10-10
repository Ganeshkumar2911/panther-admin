<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  X,
  TrendingUp,
  Award,
  AlertCircle,
  BarChart3,
  Layers,
  RefreshCw,
} from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  reportType: {
    type: String,
    default: "Daily Performance",
  },
  reportSummary: {
    type: Object,
    default: () => ({}),
  },
  reportItems: {
    type: Array,
    default: () => [],
  },
  reportFilters: {
    type: Object,
    default: () => ({}),
  },
  periodLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const snackbar = useSnackbarStore();

const userInput = ref("");
const isAnalyzing = ref(false);
const chatHistory = ref([]);
const messagesContainer = ref(null);
const copiedIndex = ref(null);

const formatUSD = (num) => {
  const val = Number(num || 0);
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLots = (num) => {
  const val = Number(num || 0);
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " lots";
};

// Quick suggested prompt chips
const promptSuggestions = [
  {
    icon: TrendingUp,
    label: "Executive Summary",
    prompt: "Provide a quick executive summary of this report's key metrics, volumes, and payouts.",
  },
  {
    icon: Award,
    label: "Top 5 Performers",
    prompt: "Who are the top 5 contributors by commission and trading lot volume in this period?",
  },
  {
    icon: Layers,
    label: "Sub-IB vs Direct Split",
    prompt: "Analyze the proportion of commissions coming directly vs through sub-IB downlines.",
  },
  {
    icon: AlertCircle,
    label: "Pending Payout Risk",
    prompt: "Assess the pending approval commission liability and potential anomalies.",
  },
];

const generateAiAnalysis = (promptText) => {
  const s = props.reportSummary || {};
  const items = props.reportItems || [];
  const totalComm = Number(s.total_commission || items.reduce((acc, r) => acc + Number(r.total_commission || 0), 0));
  const totalLots = Number(s.total_lots || items.reduce((acc, r) => acc + Number(r.total_lots || 0), 0));
  const entryCount = Number(s.entry_count || items.reduce((acc, r) => acc + Number(r.entry_count || 1), 0));
  
  const pendingComm = Number(s.by_status?.pending?.commission || 0);
  const approvedComm = Number(s.by_status?.approved?.commission || 0);
  const rejectedComm = Number(s.by_status?.rejected?.commission || 0);

  const directComm = Number(s.performance_commission || 0);
  const subIbComm = Number(s.commission_from_subibs || 0);

  // Sort top 5 performers
  const topItems = [...items]
    .sort((a, b) => Number(b.total_commission || 0) - Number(a.total_commission || 0))
    .slice(0, 5);

  const lower = promptText.toLowerCase();

  if (lower.includes("top") || lower.includes("performer") || lower.includes("winner")) {
    if (topItems.length === 0) {
      return `### 🏆 Top Performers Analysis\n\nNo partner records found in the active dataset for this period.`;
    }
    let res = `### 🏆 Top Performers in ${props.reportType} (${props.periodLabel || "Current Period"})\n\n`;
    topItems.forEach((item, idx) => {
      const name = item.ib_name || item.name || item.symbol || `Partner #${item.ib_id || item.user_id || idx + 1}`;
      const comm = formatUSD(item.total_commission || item.commission || 0);
      const lots = formatLots(item.total_lots || item.lots || 0);
      const share = totalComm > 0 ? ((Number(item.total_commission || 0) / totalComm) * 100).toFixed(1) : "0";
      res += `**${idx + 1}. ${name}** (ID: \`${item.ib_id || item.user_id || "-"}\`)\n`;
      res += `   - **Total Commission:** ${comm} (${share}% of total payout)\n`;
      res += `   - **Volume:** ${lots} • **Direct Entries:** ${item.entry_count || 0}\n\n`;
    });
    res += `> **Takeaway:** The top ${topItems.length} entities represent **${((topItems.reduce((acc, t) => acc + Number(t.total_commission || 0), 0) / (totalComm || 1)) * 100).toFixed(1)}%** of the entire commission output.`;
    return res;
  }

  if (lower.includes("sub-ib") || lower.includes("direct") || lower.includes("split") || lower.includes("downline")) {
    const directPct = totalComm > 0 ? ((directComm / totalComm) * 100).toFixed(1) : "0";
    const subIbPct = totalComm > 0 ? ((subIbComm / totalComm) * 100).toFixed(1) : "0";

    return `### 🌐 Direct vs Sub-IB Commission Split\n\n` +
      `- **Direct Client Volume:** ${formatUSD(directComm)} (${directPct}%)\n` +
      `- **Sub-IB Downline Overrides:** ${formatUSD(subIbComm)} (${subIbPct}%)\n` +
      `- **Total Commission:** ${formatUSD(totalComm)}\n\n` +
      `**Key Observations:**\n` +
      `1. **Network Health:** ${Number(subIbPct) > 30 ? "Strong multi-tier partner network generating substantial recursive downline revenue." : "Primarily driven by direct trading accounts with opportunity to expand multi-tier IB recruitment."}\n` +
      `2. **Entries Count:** Direct entries account for ${s.entry_count_direct || 0} trades vs ${s.entry_count_from_subibs || 0} downline trades.`;
  }

  if (lower.includes("pending") || lower.includes("risk") || lower.includes("liability") || lower.includes("approved")) {
    const pendingShare = totalComm > 0 ? ((pendingComm / totalComm) * 100).toFixed(1) : "0";
    return `### ⚖️ Commission Status & Payout Liability Assessment\n\n` +
      `| Status | Volume (Lots) | Commissions ($) | Count | Share |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **Pending** | ${formatLots(s.by_status?.pending?.lots)} | **${formatUSD(pendingComm)}** | ${s.by_status?.pending?.entry_count || 0} | ${pendingShare}% |\n` +
      `| **Approved** | ${formatLots(s.by_status?.approved?.lots)} | **${formatUSD(approvedComm)}** | ${s.by_status?.approved?.entry_count || 0} | ${totalComm > 0 ? ((approvedComm / totalComm) * 100).toFixed(1) : 0}% |\n` +
      `| **Rejected** | ${formatLots(s.by_status?.rejected?.lots)} | **${formatUSD(rejectedComm)}** | ${s.by_status?.rejected?.entry_count || 0} | ${totalComm > 0 ? ((rejectedComm / totalComm) * 100).toFixed(1) : 0}% |\n\n` +
      `**Audit Recommendations:**\n` +
      `- **Pending Settlements:** There are **${formatUSD(pendingComm)}** waiting in draft status requiring batch approval before wallet crediting.\n` +
      `- **Rejection Rate:** Rejections represent **${totalComm > 0 ? ((rejectedComm / totalComm) * 100).toFixed(2) : 0}%** of total volume.`;
  }

  // Default: Executive Summary
  const avgLotPerEntry = entryCount > 0 ? (totalLots / entryCount).toFixed(2) : "0.00";
  const avgCommPerLot = totalLots > 0 ? (totalComm / totalLots).toFixed(2) : "0.00";

  return `### 📊 Executive Report Overview: ${props.reportType}\n\n` +
    `**Period:** \`${props.periodLabel || "Active Period Window"}\` • **Total Rows:** \`${items.length}\`\n\n` +
    `#### Key Metrics & Totals:\n` +
    `- 💰 **Grand Total Commission:** **${formatUSD(totalComm)}**\n` +
    `- 📈 **Total Traded Volume:** **${formatLots(totalLots)}**\n` +
    `- ⚡ **Executed Entries:** **${entryCount.toLocaleString()} trades**\n` +
    `- 🏷️ **Average Rebate / Lot:** **$${avgCommPerLot} / lot**\n` +
    `- 📊 **Avg Trade Size:** **${avgLotPerEntry} lots / deal**\n\n` +
    `#### Status Breakdown:\n` +
    `- **Pending Payouts:** ${formatUSD(pendingComm)} (${s.by_status?.pending?.entry_count || 0} trades)\n` +
    `- **Approved / Settled:** ${formatUSD(approvedComm)} (${s.by_status?.approved?.entry_count || 0} trades)\n` +
    `- **Rejected:** ${formatUSD(rejectedComm)}\n\n` +
    `*Generated automatically by PantherCapitals AI Commission Analyst.*`;
};

const initChat = () => {
  if (chatHistory.value.length === 0) {
    chatHistory.value.push({
      role: "assistant",
      content: generateAiAnalysis("Executive Summary"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }
};

const handleSend = () => {
  const text = userInput.value.trim();
  if (!text || isAnalyzing.value) return;

  chatHistory.value.push({
    role: "user",
    content: text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  userInput.value = "";
  isAnalyzing.value = true;

  scrollToBottom();

  setTimeout(() => {
    const aiResponse = generateAiAnalysis(text);
    chatHistory.value.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    isAnalyzing.value = false;
    scrollToBottom();
  }, 450);
};

const handleSelectSuggestion = (suggestion) => {
  userInput.value = suggestion.prompt;
  handleSend();
};

const copyContent = (text, idx) => {
  navigator.clipboard.writeText(text);
  copiedIndex.value = idx;
  snackbar.show("Analysis copied to clipboard", "success");
  setTimeout(() => {
    if (copiedIndex.value === idx) copiedIndex.value = null;
  }, 2000);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      initChat();
      scrollToBottom();
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-2xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-3.5 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-2xs"
              >
                <Sparkles :size="18" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
                  <span>Ask AI Report Analyst</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  >
                    AI Intelligence
                  </span>
                </h3>
                <p class="text-xs text-secondary-text">
                  Analyzing {{ reportType }} • {{ periodLabel || "Live Data" }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="btn-icon"
              @click="emit('update:modelValue', false)"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Quick Suggestions Bar -->
          <div
            class="px-5 py-2.5 bg-background border-b border-primary-border flex items-center gap-2 overflow-x-auto no-scrollbar"
          >
            <span class="text-[11px] font-semibold text-secondary-text whitespace-nowrap">Suggested:</span>
            <button
              v-for="(sug, idx) in promptSuggestions"
              :key="idx"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-[11px] font-medium text-secondary-text hover:text-primary-text hover:border-purple-500/40 hover:bg-purple-500/5 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
              @click="handleSelectSuggestion(sug)"
            >
              <component :is="sug.icon" :size="12" class="text-purple-500" />
              <span>{{ sug.label }}</span>
            </button>
          </div>

          <!-- Chat Conversation Body -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50"
          >
            <div
              v-for="(msg, idx) in chatHistory"
              :key="idx"
              class="flex gap-3 text-xs leading-relaxed"
              :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
            >
              <!-- Avatar -->
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs"
                :class="
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                "
              >
                <User v-if="msg.role === 'user'" :size="14" />
                <Bot v-else :size="14" />
              </div>

              <!-- Message Bubble -->
              <div
                class="max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs"
                :class="
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-xs'
                    : 'bg-card-background border border-primary-border text-primary-text rounded-tl-xs'
                "
              >
                <!-- Formatted Content -->
                <div
                  v-if="msg.role === 'assistant'"
                  class="prose prose-xs dark:prose-invert max-w-none space-y-2"
                >
                  <div
                    v-for="(paragraph, pIdx) in msg.content.split('\n\n')"
                    :key="pIdx"
                    class="space-y-1"
                  >
                    <p
                      v-if="!paragraph.startsWith('#') && !paragraph.startsWith('|') && !paragraph.startsWith('-') && !paragraph.startsWith('>')"
                      class="text-xs text-primary-text leading-relaxed"
                    >
                      {{ paragraph }}
                    </p>
                    <h4
                      v-else-if="paragraph.startsWith('###')"
                      class="text-xs font-bold text-primary-text flex items-center gap-1.5"
                    >
                      {{ paragraph.replace('###', '').trim() }}
                    </h4>
                    <div
                      v-else-if="paragraph.startsWith('-')"
                      class="space-y-1 pl-2 border-l-2 border-purple-500/30"
                    >
                      <div
                        v-for="(line, lIdx) in paragraph.split('\n')"
                        :key="lIdx"
                        class="text-xs text-secondary-text"
                      >
                        {{ line.replace(/^[-\*\+]\s*/, '• ') }}
                      </div>
                    </div>
                    <blockquote
                      v-else-if="paragraph.startsWith('>')"
                      class="px-3 py-1.5 rounded-lg bg-purple-500/5 border-l-2 border-purple-500 text-[11px] text-purple-700 dark:text-purple-300"
                    >
                      {{ paragraph.replace(/^>\s*/, '') }}
                    </blockquote>
                    <pre
                      v-else
                      class="bg-background border border-primary-border p-2 rounded-lg text-[11px] overflow-x-auto font-mono text-secondary-text"
                    >{{ paragraph }}</pre>
                  </div>
                </div>
                <p v-else class="text-xs text-white">
                  {{ msg.content }}
                </p>

                <!-- Footer Timestamp & Copy -->
                <div
                  class="flex items-center justify-between mt-2 pt-1 border-t border-primary-border/20 text-[10px] text-secondary-text/70"
                >
                  <span>{{ msg.timestamp }}</span>
                  <button
                    v-if="msg.role === 'assistant'"
                    type="button"
                    class="hover:text-primary-text flex items-center gap-1 cursor-pointer transition-colors"
                    @click="copyContent(msg.content, idx)"
                  >
                    <Check v-if="copiedIndex === idx" :size="11" class="text-primary-green" />
                    <Copy v-else :size="11" />
                    <span>{{ copiedIndex === idx ? 'Copied' : 'Copy' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Analyzing Indicator -->
            <div v-if="isAnalyzing" class="flex gap-3 items-center text-xs text-secondary-text">
              <div
                class="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center animate-pulse"
              >
                <Bot :size="14" />
              </div>
              <div
                class="px-4 py-2.5 rounded-2xl bg-card-background border border-primary-border flex items-center gap-2"
              >
                <RefreshCw :size="12" class="animate-spin text-purple-500" />
                <span class="text-xs text-secondary-text font-medium">Synthesizing report insights...</span>
              </div>
            </div>
          </div>

          <!-- Input Footer -->
          <div class="p-3.5 border-t border-primary-border bg-card-background">
            <form
              class="flex items-center gap-2"
              @submit.prevent="handleSend"
            >
              <input
                v-model="userInput"
                type="text"
                placeholder="Ask anything about this report (e.g., 'Show top earners', 'Analyze pending lots')..."
                class="input-field px-3.5 py-2 text-xs flex-1"
                :disabled="isAnalyzing"
              />
              <button
                type="submit"
                :disabled="!userInput.trim() || isAnalyzing"
                class="btn-primary px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Send :size="14" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
