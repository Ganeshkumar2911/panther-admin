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

    <!-- Drawer Panel (Wide for Spreadsheet & Generation Form) -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between gap-4 bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 bg-primary/10 border-primary/20 text-primary"
            >
              <HugeIcon
                v-if="activeTab === 'generate'"
                :icon="SlidersHorizontalIcon"
                :size="20"
                class="text-primary"
              />
              <HugeIcon
                v-else
                :icon="Upload04Icon"
                :size="20"
                class="text-primary"
              />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  {{ activeTab === 'generate' ? 'Generate Dummy Trades' : 'Import Dummy Trades' }}
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1 shadow-2xs"
                >
                  <HugeIcon :icon="User02Icon" :size="11" />
                  {{ labelName }}
                </span>
                <span class="text-xs text-secondary-text font-mono">
                  FM ID: #{{ fmId }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                {{
                  activeTab === 'generate'
                    ? 'Configure simulation parameters to automatically generate realistic dummy trades.'
                    : 'Upload and preview trade history data in Excel (.xlsx, .xls) or CSV format.'
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Template download (Import Tab) -->
            <button
              v-if="activeTab === 'import'"
              type="button"
              @click="downloadTemplate"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
              title="Download sample spreadsheet template"
            >
              <HugeIcon :icon="Download01Icon" :size="14" class="text-primary" />
              <span class="hidden sm:inline">Sample Template</span>
            </button>

            <!-- Reset defaults (Generate Tab) -->
            <button
              v-else-if="activeTab === 'generate' && !generationResult"
              type="button"
              @click="resetGenerateForm"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
              title="Reset simulation parameters to default"
            >
              <HugeIcon :icon="RefreshCwIcon" :size="14" class="text-secondary-text" />
              <span class="hidden sm:inline">Reset Defaults</span>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="handleClose"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>
        </div>

        <!-- Sub-Navigation Tabs Bar (Import Trade vs Generate Trade) -->
        <div
          class="flex items-center gap-1 px-6 pt-2 pb-0 border-b border-primary-border bg-background/30 shrink-0"
        >
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer select-none"
            :class="[
              activeTab === 'import'
                ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/80 rounded-t-lg',
            ]"
            @click="activeTab = 'import'"
          >
            <HugeIcon :icon="Upload04Icon" :size="15" />
            <span>Import Trade</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer select-none"
            :class="[
              activeTab === 'generate'
                ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/80 rounded-t-lg',
            ]"
            @click="activeTab = 'generate'"
          >
            <HugeIcon :icon="SlidersHorizontalIcon" :size="15" />
            <span>Generate Trade</span>
          </button>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB 1: IMPORT TRADE (Spreadsheet Drag & Drop + Preview)   -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-if="activeTab === 'import'" class="space-y-5">
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
                  <HugeIcon :icon="Upload04Icon" :size="26" class="text-primary" />
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
                    <HugeIcon :icon="FileSpreadsheetIcon" :size="24" />
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
                        <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
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
                    <HugeIcon :icon="Delete02Icon" :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- PARSING LOADER / ERROR -->
            <div
              v-if="isParsing"
              class="flex items-center justify-center py-10 gap-3 text-secondary-text"
            >
              <HugeIcon :icon="Loading03Icon" :size="18" class="animate-spin text-primary" />
              <span class="text-xs font-semibold"
                >Reading spreadsheet data...</span
              >
            </div>

            <div
              v-else-if="parseError"
              class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5"
            >
              <HugeIcon :icon="Alert02Icon" :size="16" class="shrink-0 mt-0.5" />
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
                    <HugeIcon :icon="FileSpreadsheetIcon" :size="15" class="text-primary" />
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
                            row.opened_at ||
                            row.Opened_At ||
                            row.openedAt ||
                            "—"
                          }}
                        </td>

                        <!-- Closed At -->
                        <td
                          class="py-2 px-3 text-secondary-text whitespace-nowrap text-[10px]"
                        >
                          {{
                            row.closed_at ||
                            row.Closed_At ||
                            row.closedAt ||
                            "—"
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB 2: GENERATE TRADE (Simulation Algorithm Parameters)   -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'generate'" class="space-y-5">
            <!-- 1. SUCCESS RESULT BANNER (If recently generated) -->
            <div
              v-if="generationResult"
              class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500"
                >
                  <HugeIcon :icon="CheckmarkCircle02Icon" :size="22" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-primary-text">
                    {{ lastSuccessMessage || 'Trades Generated Successfully' }}
                  </h4>
                  <p class="text-xs text-secondary-text">
                    Generated {{ generationResult.generated_count || generationResult.total_trades }} dummy trades for {{ labelName }}.
                  </p>
                </div>
              </div>

              <!-- Metrics Stats Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div class="bg-card-background/70 border border-primary-border rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Generated</span>
                  <span class="text-base font-extrabold text-primary-text font-mono mt-0.5 block">
                    {{ generationResult.generated_count || generationResult.total_trades }} trades
                  </span>
                </div>
                <div class="bg-card-background/70 border border-primary-border rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Buy / Sell</span>
                  <span class="text-base font-extrabold text-primary font-mono mt-0.5 block">
                    {{ generationResult.buy_count }} / {{ generationResult.sell_count }}
                  </span>
                </div>
                <div class="bg-card-background/70 border border-primary-border rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Total Lots</span>
                  <span class="text-base font-extrabold text-primary-text font-mono mt-0.5 block">
                    {{ Number(generationResult.total_lots || 0).toFixed(2) }}
                  </span>
                </div>
                <div class="bg-card-background/70 border border-primary-border rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Net P&L</span>
                  <span
                    class="text-base font-extrabold font-mono mt-0.5 block"
                    :class="Number(generationResult.net_pnl || 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                  >
                    {{ formatPnl(generationResult.net_pnl) }} USD
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  @click="generationResult = null"
                  class="btn-secondary text-xs px-3.5 py-1.5"
                >
                  <HugeIcon :icon="RefreshCwIcon" :size="14" />
                  <span>Generate Another Batch</span>
                </button>
                <button
                  type="button"
                  @click="handleClose"
                  class="btn-primary text-xs px-4 py-1.5"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>

            <!-- GENERATION FORM (When not in success summary mode) -->
            <div v-else class="space-y-4.5">
              <!-- SECTION 1: INSTRUMENT & TIMEFRAME -->
              <div class="bg-background/40 border border-primary-border rounded-2xl p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                    <HugeIcon :icon="Coins01Icon" :size="15" class="text-primary" />
                    <span>Instrument & Candle Timeframe</span>
                  </h4>
                  <span class="text-[10px] text-secondary-text">Validated against Watchlist</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Symbol Input -->
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Instrument Symbol <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model="generateForm.symbol"
                      type="text"
                      placeholder="e.g. XAUUSD, EURUSD"
                      class="input-field px-3 py-2 text-xs font-mono uppercase font-bold"
                    />
                  </div>

                  <!-- Candle Interval Select -->
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Candle Interval
                    </label>
                    <select
                      v-model="generateForm.interval"
                      class="input-field px-3 py-2 text-xs"
                    >
                      <option value="1minute">1 Minute (1m)</option>
                      <option value="5minute">5 Minutes (5m - Default)</option>
                      <option value="15minute">15 Minutes (15m)</option>
                      <option value="30minute">30 Minutes (30m)</option>
                      <option value="1hour">1 Hour (1h)</option>
                      <option value="4hour">4 Hours (4h)</option>
                      <option value="1day">1 Day (1D)</option>
                    </select>
                  </div>
                </div>

                <!-- Quick Symbol Badges -->
                <div class="flex items-center gap-1.5 flex-wrap pt-1">
                  <span class="text-[10px] font-semibold text-secondary-text">Quick Picks:</span>
                  <button
                    v-for="sym in popularSymbols"
                    :key="sym"
                    type="button"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer"
                    :class="
                      (generateForm.symbol || '').toUpperCase() === sym
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-card-background hover:bg-background text-secondary-text border-primary-border'
                    "
                    @click="generateForm.symbol = sym"
                  >
                    {{ sym }}
                  </button>
                </div>
              </div>

              <!-- SECTION 2: DATE RANGE (TIME WINDOW) -->
              <div class="bg-background/40 border border-primary-border rounded-2xl p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                    <HugeIcon :icon="Calendar01Icon" :size="15" class="text-primary" />
                    <span>Simulation Date Range</span>
                  </h4>
                  <span class="text-[10px] text-secondary-text">ISO 8601 Window</span>
                </div>

                <!-- Quick Range Presets -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-semibold text-secondary-text">Presets:</span>
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer"
                    :class="selectedPresetDays === 7 ? 'bg-primary text-white border-primary' : 'bg-card-background hover:bg-background text-secondary-text border-primary-border'"
                    @click="applyDatePreset(7)"
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer"
                    :class="selectedPresetDays === 14 ? 'bg-primary text-white border-primary' : 'bg-card-background hover:bg-background text-secondary-text border-primary-border'"
                    @click="applyDatePreset(14)"
                  >
                    Last 14 Days
                  </button>
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer"
                    :class="selectedPresetDays === 30 ? 'bg-primary text-white border-primary' : 'bg-card-background hover:bg-background text-secondary-text border-primary-border'"
                    @click="applyDatePreset(30)"
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer"
                    :class="selectedPresetDays === 'month' ? 'bg-primary text-white border-primary' : 'bg-card-background hover:bg-background text-secondary-text border-primary-border'"
                    @click="applyDatePreset('month')"
                  >
                    This Month
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Start Date & Time <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model="generateForm.date_from"
                      type="datetime-local"
                      class="input-field px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      End Date & Time <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model="generateForm.date_to"
                      type="datetime-local"
                      class="input-field px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <!-- SECTION 3: TRADE COUNTS & LOT SIZING -->
              <div class="bg-background/40 border border-primary-border rounded-2xl p-4 space-y-3.5">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                    <HugeIcon :icon="SlidersHorizontalIcon" :size="15" class="text-primary" />
                    <span>Trades & Lot Configuration</span>
                  </h4>
                  <span class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {{ totalCalculatedTrades }} Total Trades
                  </span>
                </div>

                <!-- Trade Counts Grid -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Max BUY Trades
                    </label>
                    <input
                      v-model.number="generateForm.max_buy_trades"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10"
                      class="input-field px-3 py-2 text-xs font-mono font-bold"
                      @input="handleTradeCountChange"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Max SELL Trades
                    </label>
                    <input
                      v-model.number="generateForm.max_sell_trades"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10"
                      class="input-field px-3 py-2 text-xs font-mono font-bold"
                      @input="handleTradeCountChange"
                    />
                  </div>
                </div>

                <!-- Lot Mode Selection Switcher -->
                <div class="space-y-2 pt-1">
                  <label class="block text-xs font-semibold text-secondary-text">
                    Lot Sizing Mode <span class="text-primary-red">*</span>
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Range Lot Mode Button -->
                    <button
                      type="button"
                      class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
                      :class="
                        generateForm.lot_mode === 'range'
                          ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/30'
                          : 'border-primary-border bg-card-background hover:bg-background text-secondary-text'
                      "
                      @click="switchLotMode('range')"
                    >
                      <div class="flex items-center justify-between w-full mb-1">
                        <span class="text-xs font-bold text-primary-text">Range Lot Mode</span>
                        <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                          Recommended
                        </span>
                      </div>
                      <p class="text-[11px] text-secondary-text leading-tight">
                        Smooth triangular sampling bounded by min & max lot.
                      </p>
                    </button>

                    <!-- Fixed Lot Mode Button -->
                    <button
                      type="button"
                      class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
                      :class="
                        generateForm.lot_mode === 'fixed'
                          ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/30'
                          : 'border-primary-border bg-card-background hover:bg-background text-secondary-text'
                      "
                      @click="switchLotMode('fixed')"
                    >
                      <div class="flex items-center justify-between w-full mb-1">
                        <span class="text-xs font-bold text-primary-text">Fixed Lot Mode</span>
                        <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-background border border-primary-border text-secondary-text">
                          Strict
                        </span>
                      </div>
                      <p class="text-[11px] text-secondary-text leading-tight">
                        Every single trade receives the exact same fixed lot.
                      </p>
                    </button>
                  </div>
                </div>

                <!-- Mode Specific Inputs -->
                <!-- A: Range Mode Fields -->
                <div v-if="generateForm.lot_mode === 'range'" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Min Lot Per Trade <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model.number="generateForm.min_lot"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.10"
                      class="input-field px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Max Lot Per Trade <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model.number="generateForm.max_lot"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="4.00"
                      class="input-field px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Total Target Lots <span class="text-primary-red">*</span>
                    </label>
                    <input
                      v-model.number="generateForm.total_lots"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="12.00"
                      class="input-field px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <!-- B: Fixed Mode Fields -->
                <div v-else class="space-y-2.5 pt-1">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-secondary-text mb-1">
                        Fixed Lot Per Trade <span class="text-primary-red">*</span>
                      </label>
                      <input
                        v-model.number="generateForm.fixed_lot"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.50"
                        class="input-field px-3 py-2 text-xs font-mono font-bold"
                        @input="syncFixedTotalLots"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-secondary-text mb-1">
                        Total Lots <span class="text-primary-red">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model.number="generateForm.total_lots"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="10.00"
                          class="input-field px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Fixed Mode Exact Math Helper Hint -->
                  <div
                    class="p-2.5 rounded-xl text-xs flex items-center justify-between gap-2"
                    :class="
                      isFixedMathMatched
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    "
                  >
                    <div class="flex items-center gap-1.5 font-mono text-[11px]">
                      <HugeIcon v-if="isFixedMathMatched" :icon="CheckmarkCircle02Icon" :size="14" class="shrink-0" />
                      <HugeIcon v-else :icon="Alert02Icon" :size="14" class="shrink-0" />
                      <span>
                        {{ totalCalculatedTrades }} trades × {{ generateForm.fixed_lot || 0 }} lot =
                        <strong>{{ expectedFixedTotalLots }} lots</strong>
                      </span>
                    </div>

                    <button
                      v-if="!isFixedMathMatched"
                      type="button"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition cursor-pointer"
                      @click="syncFixedTotalLots"
                    >
                      Auto-Match Total Lots
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION 4: P&L TARGETS -->
              <div class="bg-background/40 border border-primary-border rounded-2xl p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                    <HugeIcon :icon="Analytics01Icon" :size="15" class="text-primary" />
                    <span>P&L Simulation Targets (USD)</span>
                  </h4>
                  <span class="text-[10px] text-secondary-text">Scales dynamically with account type</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Min Trade P&L
                    </label>
                    <input
                      v-model.number="generateForm.min_trade_pnl"
                      type="number"
                      step="1"
                      placeholder="-100"
                      class="input-field px-3 py-2 text-xs font-mono text-primary-red font-semibold"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Max Trade P&L
                    </label>
                    <input
                      v-model.number="generateForm.max_trade_pnl"
                      type="number"
                      step="1"
                      placeholder="150"
                      class="input-field px-3 py-2 text-xs font-mono text-primary-green font-semibold"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-secondary-text mb-1">
                      Target Net P&L
                    </label>
                    <input
                      v-model.number="generateForm.target_net_pnl"
                      type="number"
                      step="1"
                      placeholder="500"
                      class="input-field px-3 py-2 text-xs font-mono text-primary font-bold"
                    />
                  </div>
                </div>
              </div>

              <!-- SECTION 5: LIVE SIMULATION SPEC SUMMARY -->
              <div class="border border-primary/25 bg-primary/5 rounded-2xl p-3.5 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-primary-text flex items-center gap-1.5">
                    <HugeIcon :icon="Layers01Icon" :size="15" class="text-primary" />
                    Simulation Overview
                  </span>
                  <span class="text-[11px] font-mono text-secondary-text">
                    {{ generateForm.interval }} Interval
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div class="bg-card-background/80 rounded-lg p-2 border border-primary-border/60">
                    <span class="text-[10px] text-secondary-text block">Trades</span>
                    <span class="font-bold text-primary-text">{{ totalCalculatedTrades }} ({{ generateForm.max_buy_trades }}B / {{ generateForm.max_sell_trades }}S)</span>
                  </div>
                  <div class="bg-card-background/80 rounded-lg p-2 border border-primary-border/60">
                    <span class="text-[10px] text-secondary-text block">Volume</span>
                    <span class="font-bold text-primary-text">{{ Number(generateForm.total_lots || 0).toFixed(2) }} Lots</span>
                  </div>
                  <div class="bg-card-background/80 rounded-lg p-2 border border-primary-border/60">
                    <span class="text-[10px] text-secondary-text block">Target Net P&L</span>
                    <span class="font-bold" :class="Number(generateForm.target_net_pnl || 0) >= 0 ? 'text-primary-green' : 'text-primary-red'">
                      {{ formatPnl(generateForm.target_net_pnl) }} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between gap-3 shrink-0"
        >
          <!-- Left Status/Count Text -->
          <div class="text-xs text-secondary-text">
            <template v-if="activeTab === 'import'">
              <span
                v-if="previewRows.length > 0"
                class="font-mono text-primary-text font-bold"
              >
                {{ previewRows.length }} trades ready to import
              </span>
              <span v-else>
                Please upload a spreadsheet file to preview and import trades.
              </span>
            </template>

            <template v-else-if="activeTab === 'generate'">
              <span v-if="generationResult" class="text-emerald-500 font-bold font-mono flex items-center gap-1">
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="14" />
                Simulation Complete
              </span>
              <span v-else class="font-mono text-primary-text font-semibold">
                Ready to generate {{ totalCalculatedTrades }} trades ({{ Number(generateForm.total_lots || 0).toFixed(2) }} lots)
              </span>
            </template>
          </div>

          <!-- Right Action Buttons -->
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-card-background border border-primary-border text-primary-text hover:bg-background text-xs font-semibold transition cursor-pointer"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              {{ generationResult ? 'Close' : 'Cancel' }}
            </button>

            <!-- Submit Button (Import Tab) -->
            <button
              v-if="activeTab === 'import'"
              type="button"
              class="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="
                !selectedFile ||
                previewRows.length === 0 ||
                isSubmitting
              "
              @click="handleImportSubmit"
            >
              <HugeIcon v-if="isSubmitting" :icon="Loading03Icon" :size="16" class="animate-spin" />
              <HugeIcon v-else :icon="Upload04Icon" :size="16" />
              <span>{{
                isSubmitting ? "Importing Trades..." : "Import Dummy Trades"
              }}</span>
            </button>

            <!-- Submit Button (Generate Tab) -->
            <button
              v-else-if="activeTab === 'generate' && !generationResult"
              type="button"
              class="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
              @click="handleGenerateSubmit"
            >
              <HugeIcon v-if="isSubmitting" :icon="Loading03Icon" :size="16" class="animate-spin" />
              <HugeIcon v-else :icon="SlidersHorizontalIcon" :size="16" />
              <span>{{
                isSubmitting ? "Generating Trades..." : "Generate Dummy Trades"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Upload04Icon,
  FileSpreadsheetIcon,
  SlidersHorizontalIcon,
  Download01Icon,
  RefreshCwIcon,
  Cancel01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Loading03Icon,
  Coins01Icon,
  Calendar01Icon,
  Analytics01Icon,
  Layers01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import * as XLSX from "xlsx";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import { useWatchlistStore } from "@/stores/watchlist/watchlist";

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);

const store = useFmLeaderboardStore();
const snackbar = useSnackbarStore();
const permissionsStore = useMyPermissionsStore();
const watchlistStore = useWatchlistStore();

// Active Tab State: 'import' | 'generate'
const activeTab = ref("import");

// ─── Shared Computed Properties ───────────────────────────
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

// ─── TAB 1: IMPORT TRADE STATE & METHODS ──────────────────
const fileInputRef = ref(null);
const selectedFile = ref(null);
const dragOver = ref(false);
const previewRows = ref([]);
const isParsing = ref(false);
const parseError = ref(null);
const isSubmitting = ref(false);

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
  return String(val || "").trim().toUpperCase() === "BUY";
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
  generationResult.value = null;
  emit("close");
};

// Download Sample Template
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

// ─── TAB 2: GENERATE TRADE STATE & METHODS ────────────────
const popularSymbols = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "USDJPY", "US30", "NAS100"];
const selectedPresetDays = ref(7);
const generationResult = ref(null);
const lastSuccessMessage = ref("");

const formatDateForInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

const getInitialDates = () => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 7);
  past.setHours(0, 0, 0, 0);
  return {
    from: formatDateForInput(past),
    to: formatDateForInput(now),
  };
};

const initialDates = getInitialDates();

const generateForm = ref({
  symbol: "XAUUSD",
  date_from: initialDates.from,
  date_to: initialDates.to,
  interval: "5minute",
  max_buy_trades: 10,
  max_sell_trades: 10,
  lot_mode: "range", // 'range' | 'fixed'
  min_lot: 0.1,
  max_lot: 4.0,
  fixed_lot: 0.5,
  total_lots: 12.0,
  min_trade_pnl: -100,
  max_trade_pnl: 150,
  target_net_pnl: 500,
});

const totalCalculatedTrades = computed(() => {
  const buy = Number(generateForm.value.max_buy_trades) || 0;
  const sell = Number(generateForm.value.max_sell_trades) || 0;
  return buy + sell;
});

const expectedFixedTotalLots = computed(() => {
  const trades = totalCalculatedTrades.value;
  const lot = Number(generateForm.value.fixed_lot) || 0;
  return Number((trades * lot).toFixed(2));
});

const isFixedMathMatched = computed(() => {
  if (generateForm.value.lot_mode !== "fixed") return true;
  const current = Number(generateForm.value.total_lots) || 0;
  return Math.abs(current - expectedFixedTotalLots.value) < 0.001;
});

const switchLotMode = (mode) => {
  generateForm.value.lot_mode = mode;
  if (mode === "fixed") {
    syncFixedTotalLots();
  } else {
    if (!generateForm.value.total_lots || generateForm.value.total_lots <= 0) {
      generateForm.value.total_lots = 12.0;
    }
  }
};

const syncFixedTotalLots = () => {
  generateForm.value.total_lots = expectedFixedTotalLots.value;
};

const handleTradeCountChange = () => {
  if (generateForm.value.lot_mode === "fixed") {
    syncFixedTotalLots();
  }
};

const applyDatePreset = (preset) => {
  selectedPresetDays.value = preset;
  const now = new Date();
  const past = new Date();

  if (preset === "month") {
    past.setDate(1);
    past.setHours(0, 0, 0, 0);
  } else {
    past.setDate(now.getDate() - Number(preset));
    past.setHours(0, 0, 0, 0);
  }

  generateForm.value.date_from = formatDateForInput(past);
  generateForm.value.date_to = formatDateForInput(now);
};

const resetGenerateForm = () => {
  const dates = getInitialDates();
  selectedPresetDays.value = 7;
  generateForm.value = {
    symbol: "XAUUSD",
    date_from: dates.from,
    date_to: dates.to,
    interval: "5minute",
    max_buy_trades: 10,
    max_sell_trades: 10,
    lot_mode: "range",
    min_lot: 0.1,
    max_lot: 4.0,
    fixed_lot: 0.5,
    total_lots: 12.0,
    min_trade_pnl: -100,
    max_trade_pnl: 150,
    target_net_pnl: 500,
  };
};

const formatIsoDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toISOString();
};

// Handle Generate Trade Submission
const handleGenerateSubmit = async () => {
  if (!fmId.value || fmId.value === "—") {
    snackbar.show("Fund Manager ID is missing.", "error");
    return;
  }

  const f = generateForm.value;
  const sym = (f.symbol || "").trim().toUpperCase();
  if (!sym) {
    snackbar.show("Instrument symbol is required (e.g. XAUUSD).", "error");
    return;
  }

  if (!f.date_from || !f.date_to) {
    snackbar.show("Please select start and end dates.", "error");
    return;
  }

  const dFrom = new Date(f.date_from);
  const dTo = new Date(f.date_to);
  if (dFrom > dTo) {
    snackbar.show("Start date cannot be after End date.", "error");
    return;
  }

  if (totalCalculatedTrades.value <= 0) {
    snackbar.show("Please specify at least 1 BUY or SELL trade.", "error");
    return;
  }

  if (f.lot_mode === "range") {
    if (!f.min_lot || Number(f.min_lot) <= 0) {
      snackbar.show("Min lot must be greater than 0.", "error");
      return;
    }
    if (!f.max_lot || Number(f.max_lot) < Number(f.min_lot)) {
      snackbar.show("Max lot must be greater than or equal to min lot.", "error");
      return;
    }
    if (!f.total_lots || Number(f.total_lots) <= 0) {
      snackbar.show("Total lots must be greater than 0.", "error");
      return;
    }
  } else if (f.lot_mode === "fixed") {
    if (!f.fixed_lot || Number(f.fixed_lot) <= 0) {
      snackbar.show("Fixed lot must be greater than 0.", "error");
      return;
    }
    // Auto-match exact math
    syncFixedTotalLots();
  }

  // Construct payload adhering strictly to dummy_trade_api.md
  const payload = {
    symbol: sym,
    date_from: formatIsoDate(f.date_from),
    date_to: formatIsoDate(f.date_to),
    total_lots: Number(f.total_lots),
    interval: f.interval || "5minute",
    min_trade_pnl: Number(f.min_trade_pnl ?? -100),
    max_trade_pnl: Number(f.max_trade_pnl ?? 150),
    target_net_pnl: Number(f.target_net_pnl ?? 500),
  };

  if (Number(f.max_buy_trades) >= 0) {
    payload.max_buy_trades = Number(f.max_buy_trades);
  }
  if (Number(f.max_sell_trades) >= 0) {
    payload.max_sell_trades = Number(f.max_sell_trades);
  }

  if (f.lot_mode === "fixed") {
    payload.total_lots = expectedFixedTotalLots.value;
    payload.lot_config = {
      mode: "fixed",
      lot: Number(f.fixed_lot),
    };
  } else {
    payload.lot_config = {
      mode: "range",
      min_lot: Number(f.min_lot),
      max_lot: Number(f.max_lot),
    };
  }

  isSubmitting.value = true;
  try {
    let res = null;
    if (typeof store.generateDummyTrades === "function") {
      res = await store.generateDummyTrades(fmId.value, payload);
    } else {
      res = await new Promise((resolve, reject) => {
        const endpoint = urls.dummyFm.generateTrades
          ? urls.dummyFm.generateTrades(fmId.value)
          : `/dummy/fm_trades/${fmId.value}`;

        apiRequest(urls.KEYS.POST, endpoint, {
          data: payload,
          isTokenRequired: true,
          onSuccess: (response) => {
            snackbar.show(
              response?.message || "Dummy trades generated successfully",
              "success"
            );
            if (typeof store.fetchFmLeaderboard === "function") {
              store.isFetched = false;
              store.fetchFmLeaderboard(true);
            }
            resolve(response);
          },
          onFailure: (err) => {
            snackbar.show(
              err?.error || err?.message || "Failed to generate dummy trades.",
              "error"
            );
            reject(err);
          },
        });
      });
    }

    generationResult.value = res?.data || {
      generated_count: totalCalculatedTrades.value,
      total_trades: totalCalculatedTrades.value,
      total_lots: payload.total_lots,
      buy_count: payload.max_buy_trades,
      sell_count: payload.max_sell_trades,
      net_pnl: payload.target_net_pnl,
    };
    lastSuccessMessage.value = res?.message || "Successfully generated dummy trades";
    emit("success");
  } catch (err) {
    console.error("Generate trades error:", err);
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      generationResult.value = null;
      if (!generateForm.value.date_from || !generateForm.value.date_to) {
        const dates = getInitialDates();
        generateForm.value.date_from = dates.from;
        generateForm.value.date_to = dates.to;
      }
    }
  }
);

onMounted(() => {
  if (!watchlistStore.symbolsFetched) {
    watchlistStore.fetchSymbols(false);
  }
});
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
