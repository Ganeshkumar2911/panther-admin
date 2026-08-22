<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex h-full">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40 backdrop-blur-xs cursor-pointer" @click="handleClose" />

      <!-- Panel -->
      <div
        class="w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Wallet class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold text-primary-text">
                  {{ isEdit ? 'Edit Payment Method' : 'Create Payment Method' }}
                </h2>
                <span v-if="form.gateway" class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                  {{ form.gateway }}
                </span>
                <span v-if="form.payment_method_code" class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-background border border-primary-border text-secondary-text">
                  {{ form.payment_method_code }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ isEdit ? `Configure settings for ${form.wallet_label || 'this payment method'}` : 'Configure gateway, aggregator code, limits, and dynamic client form fields' }}
              </p>
            </div>
          </div>

          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            :disabled="submitting"
            @click="handleClose"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <div ref="formBodyRef" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">

          <!-- Validation Error Alert Banner -->
          <div
            v-if="validationErrors.length > 0"
            class="p-3.5 rounded-xl bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs space-y-1.5 animate-in fade-in duration-200"
          >
            <div class="flex items-center gap-1.5 font-bold">
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>Please resolve the following issues before saving:</span>
            </div>
            <ul class="list-disc list-inside space-y-0.5 pl-1 text-[11px] opacity-90">
              <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
            </ul>
          </div>

          <!-- SECTION 1: Core Method & Gateway Info -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                <span>1. Core Gateway Configuration</span>
              </span>
              <span class="text-[10px] text-secondary-text">General Details</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Wallet Label -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-primary-text mb-1">
                  Payment Method Label <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.wallet_label"
                  type="text"
                  placeholder="e.g. Paymaxis JazzCash, Paymaxis IMPS, UPI"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.wallet_label ? 'border-primary-red' : 'border-primary-border'"
                />
                <p v-if="fieldErrors.wallet_label" class="text-[10px] text-primary-red mt-1">
                  {{ fieldErrors.wallet_label }}
                </p>
                <p v-else class="text-[10px] text-secondary-text mt-1">
                  Public title displayed to clients in deposit/withdrawal lists.
                </p>
              </div>

              <!-- Gateway -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1">
                  Gateway Provider <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.gateway"
                  type="text"
                  placeholder="e.g. paymaxis, upi, bank, crypto, internal"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.gateway ? 'border-primary-red' : 'border-primary-border'"
                />
                <p v-if="fieldErrors.gateway" class="text-[10px] text-primary-red mt-1">
                  {{ fieldErrors.gateway }}
                </p>
                <p v-else class="text-[10px] text-secondary-text mt-1">
                  Gateway identifier (e.g. paymaxis, upi, bank, internal).
                </p>
              </div>

              <!-- Method Type -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1">
                  Method Type <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.method_type"
                  type="text"
                  placeholder="e.g. wallet, bank, upi, card, hpp, crypto"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.method_type ? 'border-primary-red' : 'border-primary-border'"
                />
                <p v-if="fieldErrors.method_type" class="text-[10px] text-primary-red mt-1">
                  {{ fieldErrors.method_type }}
                </p>
                <p v-else class="text-[10px] text-secondary-text mt-1">
                  Category type (e.g. wallet, bank, upi, card, hpp).
                </p>
              </div>

              <!-- Payment Method Code (for Aggregators) -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1">
                  Payment Method Code / Aggregator Sub-code
                </label>
                <input
                  v-model="form.payment_method_code"
                  type="text"
                  placeholder="e.g. JAZZCASH, EASYPAISA, IMPS, BANKTRANSFER, BASIC_CARD"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border border-primary-border text-xs font-mono uppercase text-primary-text outline-none focus:border-primary transition"
                  @input="form.payment_method_code = form.payment_method_code ? form.payment_method_code.toUpperCase() : ''"
                />
                <p class="text-[10px] text-secondary-text mt-1">
                  Passed to payment aggregator APIs (e.g. Paymaxis) to route transaction.
                </p>
              </div>

              <!-- Remarks / Notes -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1">
                  Remarks / Notes
                </label>
                <input
                  v-model="form.remarks"
                  type="text"
                  placeholder="e.g. Pakistan JazzCash wallet, India IMPS bank transfer (INR)"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition"
                />
                <p class="text-[10px] text-secondary-text mt-1">
                  Internal description or currency notes.
                </p>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Operational Toggles & Default Settings -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-3.5">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                <SlidersHorizontal class="w-3.5 h-3.5 text-primary" />
                <span>2. Method Operations & Defaults</span>
              </span>
              <span class="text-[10px] text-secondary-text">Toggles & Status</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Active Status -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border">
                <div>
                  <p class="text-xs font-semibold text-primary-text">Active Status</p>
                  <p class="text-[10px] text-secondary-text">Enable this payment method</p>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0"
                  :class="form.is_active ? 'bg-primary-green' : 'bg-primary-border'"
                  @click="form.is_active = !form.is_active"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                    :class="form.is_active ? 'translate-x-4.5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Enable Deposit -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border">
                <div>
                  <p class="text-xs font-semibold text-primary-text">Enable Deposit</p>
                  <p class="text-[10px] text-secondary-text">Allow clients to deposit via this method</p>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0"
                  :class="form.enable_deposit ? 'bg-primary-green' : 'bg-primary-border'"
                  @click="form.enable_deposit = !form.enable_deposit"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                    :class="form.enable_deposit ? 'translate-x-4.5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Enable Withdrawal -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border">
                <div>
                  <p class="text-xs font-semibold text-primary-text">Enable Withdrawal</p>
                  <p class="text-[10px] text-secondary-text">Allow clients to withdraw via this method</p>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0"
                  :class="form.enable_withdrawal ? 'bg-primary-blue' : 'bg-primary-border'"
                  @click="form.enable_withdrawal = !form.enable_withdrawal"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                    :class="form.enable_withdrawal ? 'translate-x-4.5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Is Default Deposit -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border">
                <div>
                  <p class="text-xs font-semibold text-primary-text">Default Deposit</p>
                  <p class="text-[10px] text-secondary-text">Pre-selected deposit method</p>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0"
                  :class="form.is_default_deposit ? 'bg-primary' : 'bg-primary-border'"
                  @click="form.is_default_deposit = !form.is_default_deposit"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                    :class="form.is_default_deposit ? 'translate-x-4.5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Is Default Withdrawal -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border sm:col-span-2">
                <div>
                  <p class="text-xs font-semibold text-primary-text">Default Withdrawal</p>
                  <p class="text-[10px] text-secondary-text">Pre-selected withdrawal method</p>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0"
                  :class="form.is_default_withdrawal ? 'bg-primary' : 'bg-primary-border'"
                  @click="form.is_default_withdrawal = !form.is_default_withdrawal"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                    :class="form.is_default_withdrawal ? 'translate-x-4.5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Transaction Limits -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                <Coins class="w-3.5 h-3.5 text-primary" />
                <span>3. Transaction Limits</span>
              </span>
              <span class="text-[10px] text-secondary-text">Set 0 for No Limit</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <!-- Min Deposit -->
              <div>
                <label class="block text-[11px] font-semibold text-secondary-text mb-1">
                  Min Deposit Amount ($)
                </label>
                <input
                  v-model.number="form.minimum_deposit_amount"
                  type="number"
                  min="0"
                  step="any"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.minimum_deposit_amount ? 'border-primary-red' : 'border-primary-border'"
                />
              </div>

              <!-- Max Deposit -->
              <div>
                <label class="block text-[11px] font-semibold text-secondary-text mb-1">
                  Max Deposit Amount ($)
                </label>
                <input
                  v-model.number="form.maximum_deposit_amount"
                  type="number"
                  min="0"
                  step="any"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.maximum_deposit_amount ? 'border-primary-red' : 'border-primary-border'"
                />
              </div>

              <!-- Min Withdrawal -->
              <div>
                <label class="block text-[11px] font-semibold text-secondary-text mb-1">
                  Min Withdrawal Amount ($)
                </label>
                <input
                  v-model.number="form.minimum_withdrawal_amount"
                  type="number"
                  min="0"
                  step="any"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.minimum_withdrawal_amount ? 'border-primary-red' : 'border-primary-border'"
                />
              </div>

              <!-- Max Withdrawal -->
              <div>
                <label class="block text-[11px] font-semibold text-secondary-text mb-1">
                  Max Withdrawal Amount ($)
                </label>
                <input
                  v-model.number="form.maximum_withdrawal_amount"
                  type="number"
                  min="0"
                  step="any"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.maximum_withdrawal_amount ? 'border-primary-red' : 'border-primary-border'"
                />
              </div>

              <!-- Max Withdrawals / Day -->
              <div class="sm:col-span-2 lg:col-span-1">
                <label class="block text-[11px] font-semibold text-secondary-text mb-1">
                  Max Withdrawals / Day
                </label>
                <input
                  v-model.number="form.maximum_withdrawals_per_day"
                  type="number"
                  min="0"
                  placeholder="Unlimited (0 or empty)"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-card-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :class="fieldErrors.maximum_withdrawals_per_day ? 'border-primary-red' : 'border-primary-border'"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 4: Direct Manual Credentials (Optional) -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-3.5">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-primary" />
                <span>4. Direct Account Credentials (Optional)</span>
              </span>
              <span class="text-[10px] text-secondary-text">Only for direct manual collection</span>
            </div>

            <!-- Direct UPI -->
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Direct UPI ID / VPA</label>
                  <input v-model="form.upi_id" type="text" placeholder="e.g. merchant@okhdfcbank" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Bank Name</label>
                  <input v-model="form.bank_name" type="text" placeholder="e.g. HDFC Bank" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Account Holder Name</label>
                  <input v-model="form.account_name" type="text" placeholder="e.g. Panther Capital Pvt Ltd" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Account Number</label>
                  <input v-model="form.account_number" type="text" placeholder="e.g. 50200012345678" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">IFSC Code</label>
                  <input v-model="form.ifsc_code" type="text" placeholder="e.g. HDFC0001234" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono uppercase text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Branch Name</label>
                  <input v-model="form.branch_name" type="text" placeholder="e.g. Mumbai" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">SWIFT Code</label>
                  <input v-model="form.swift_code" type="text" placeholder="e.g. HDFCINBB" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono uppercase text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Crypto Wallet ID</label>
                  <input v-model="form.wallet_id" type="text" placeholder="e.g. COINSBUY_USDT_TRC20" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-secondary-text mb-1">Crypto Wallet Address</label>
                  <input v-model="form.wallet_address" type="text" placeholder="e.g. TXyz...1234" class="w-full px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 5: Dynamic Client Input Fields (`meta_data`) -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                  <FormInput class="w-3.5 h-3.5 text-primary" />
                  <span>5. Dynamic Client Form Fields (`meta_data`)</span>
                </span>
                <p class="text-[10px] text-secondary-text mt-0.5">
                  Fields defined here will be dynamically rendered on the client deposit & withdrawal screens.
                </p>
              </div>
            </div>

            <!-- Tabs: Deposit Fields vs Withdrawal Fields -->
            <div class="flex items-center gap-2 p-1 bg-card-background rounded-xl border border-primary-border text-xs">
              <button
                type="button"
                class="flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                :class="metaActiveTab === 'deposit'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-secondary-text hover:text-primary-text'"
                @click="metaActiveTab = 'deposit'"
              >
                <span>Deposit Fields</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px]" :class="metaActiveTab === 'deposit' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'">
                  {{ form.meta_data.deposit_fields.length }}
                </span>
              </button>

              <button
                type="button"
                class="flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                :class="metaActiveTab === 'withdrawal'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-secondary-text hover:text-primary-text'"
                @click="metaActiveTab = 'withdrawal'"
              >
                <span>Withdrawal Fields</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px]" :class="metaActiveTab === 'withdrawal' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'">
                  {{ form.meta_data.withdrawal_fields.length }}
                </span>
              </button>
            </div>

            <!-- Current Field List Container -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-secondary-text">
                  Configured {{ metaActiveTab === 'deposit' ? 'Deposit' : 'Withdrawal' }} Fields ({{ currentFieldsList.length }})
                </span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                    @click="addStandardAmountField"
                  >
                    + Add "Amount"
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition cursor-pointer"
                    @click="addNewField"
                  >
                    <Plus class="w-3 h-3" />
                    <span>Add Custom Field</span>
                  </button>
                </div>
              </div>

              <!-- Empty State for Fields -->
              <div
                v-if="currentFieldsList.length === 0"
                class="py-6 text-center rounded-xl bg-card-background border border-dashed border-primary-border p-4 space-y-2"
              >
                <p class="text-xs font-medium text-secondary-text">No dynamic fields configured for {{ metaActiveTab }}.</p>
                <p class="text-[10px] text-secondary-text/80 max-w-xs mx-auto">
                  If left empty, client will only submit standard payment flow without extra customized form fields.
                </p>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-background border border-primary-border text-xs font-medium text-primary hover:border-primary transition cursor-pointer mt-1"
                  @click="addNewField"
                >
                  <Plus class="w-3 h-3" />
                  <span>Add First Field</span>
                </button>
              </div>

              <!-- Field Items -->
              <div v-else class="space-y-2.5">
                <div
                  v-for="(field, index) in currentFieldsList"
                  :key="index"
                  class="p-3.5 rounded-xl bg-card-background border border-primary-border space-y-3 relative group"
                >
                  <div class="flex items-center justify-between gap-2 pb-2 border-b border-primary-border/40">
                    <span class="text-xs font-bold text-primary flex items-center gap-1">
                      <span class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">{{ index + 1 }}</span>
                      <span>{{ field.label || 'Untitled Field' }}</span>
                      <span class="text-[10px] font-mono text-secondary-text">({{ field.key || 'key' }})</span>
                    </span>

                    <div class="flex items-center gap-2">
                      <label class="flex items-center gap-1 text-[11px] font-medium text-secondary-text cursor-pointer select-none">
                        <input type="checkbox" v-model="field.required" class="rounded accent-primary" />
                        <span>Required</span>
                      </label>
                      <button
                        type="button"
                        class="w-6 h-6 flex items-center justify-center rounded-lg text-secondary-text hover:text-primary-red hover:bg-primary-red/10 transition cursor-pointer"
                        title="Remove field"
                        @click="removeField(index)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <!-- Field Properties Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    <!-- Key -->
                    <div>
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">Field Key (API Key)</label>
                      <input
                        v-model="field.key"
                        type="text"
                        placeholder="e.g. account_number"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary"
                      />
                    </div>

                    <!-- Label -->
                    <div>
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">Display Label</label>
                      <input
                        v-model="field.label"
                        type="text"
                        placeholder="e.g. Mobile Wallet Number"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary"
                      />
                    </div>

                    <!-- Type -->
                    <div>
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">Input Type</label>
                      <select
                        v-model="field.type"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="text">Text Input</option>
                        <option value="number">Number Input</option>
                        <option value="select">Dropdown Select</option>
                        <option value="email">Email</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>

                    <!-- Placeholder -->
                    <div :class="field.type === 'select' ? 'sm:col-span-1' : 'sm:col-span-2 md:col-span-3'">
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">Placeholder (Optional)</label>
                      <input
                        v-model="field.placeholder"
                        type="text"
                        placeholder="e.g. 03001234567"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary"
                      />
                    </div>

                    <!-- Options for Standard Select (when no options_by) -->
                    <div v-if="field.type === 'select'" class="sm:col-span-2 md:col-span-2">
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">
                        Dropdown Options (Comma-separated)
                      </label>
                      <input
                        :value="getFieldOptionsString(field)"
                        type="text"
                        placeholder="e.g. Bitcoin, Ethereum, Tron, BNB or SAVINGS, CHECKING"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary"
                        @input="updateSelectOptions(field, $event.target.value)"
                      />
                    </div>

                    <!-- Depends On (Optional for dependent selects) -->
                    <div v-if="field.type === 'select'" class="sm:col-span-1">
                      <label class="block text-[10px] font-semibold text-secondary-text mb-1">
                        Depends On (Parent Key)
                      </label>
                      <input
                        v-model="field.depends_on"
                        type="text"
                        placeholder="e.g. network"
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary"
                      />
                    </div>

                    <!-- Options By (for Dependent Selects) -->
                    <div v-if="field.type === 'select' && (field.options_by || field.depends_on)" class="sm:col-span-2 md:col-span-3">
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-[10px] font-semibold text-secondary-text">
                          Dependent Options Mapping (`options_by` JSON)
                        </label>
                        <span class="text-[9px] text-secondary-text font-mono">JSON mapping by parent key</span>
                      </div>
                      <textarea
                        :value="getOptionsByJsonString(field)"
                        rows="4"
                        placeholder='{ "Bitcoin": [{ "label": "BTC", "value": "BTC" }], "Ethereum": [{ "label": "ETH", "value": "ETH" }] }'
                        class="w-full px-2.5 py-1.5 rounded-lg bg-background border border-primary-border text-[11px] font-mono text-primary-text outline-none focus:border-primary leading-relaxed"
                        @input="updateOptionsByJson(field, $event.target.value)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 6: Withdrawal Notification Emails -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-bold uppercase tracking-wider text-primary-text flex items-center gap-1.5">
                <Mail class="w-3.5 h-3.5 text-primary" />
                <span>6. Withdrawal Notification Emails</span>
              </span>
              <span class="text-[10px] text-secondary-text">Optional Alerts</span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  v-model="newEmailInput"
                  type="email"
                  placeholder="Enter admin email address to notify..."
                  class="flex-1 px-3 py-2 rounded-lg bg-card-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary"
                  @keydown.enter.prevent="addEmail"
                />
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg bg-background border border-primary-border text-xs font-semibold text-primary hover:border-primary transition cursor-pointer"
                  @click="addEmail"
                >
                  Add Email
                </button>
              </div>

              <!-- Emails tags -->
              <div v-if="form.withdraw_notification_emails && form.withdraw_notification_emails.length > 0" class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="(email, idx) in form.withdraw_notification_emails"
                  :key="idx"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-mono"
                >
                  <span>{{ email }}</span>
                  <button type="button" class="hover:text-primary-red cursor-pointer" @click="removeEmail(idx)">
                    <X class="w-3 h-3" />
                  </button>
                </span>
              </div>
              <p v-else class="text-[10px] text-secondary-text">
                No notification emails added. Notifications will follow system default settings.
              </p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background flex items-center justify-between shrink-0">
          <div>
            <span v-if="validationErrors.length > 0" class="text-xs text-primary-red font-semibold flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" />
              <span>{{ validationErrors.length }} error(s) found</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition cursor-pointer"
              :disabled="submitting"
              @click="handleClose"
            >
              Cancel
            </button>

            <button
              type="button"
              class="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60 shadow-xs"
              :disabled="submitting"
              @click="submit"
            >
              <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Payment Method') }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Wallet,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Coins,
  Layers,
  SlidersHorizontal,
  ShieldCheck,
  FormInput,
  Mail,
} from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'

const props = defineProps({
  open: { type: Boolean, default: false },
  paymentMethod: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const store = usePaymentMethodsStore()

const isEdit = computed(() => !!props.paymentMethod)
const formBodyRef = ref(null)
const submitting = ref(false)
const validationErrors = ref([])
const fieldErrors = ref({})
const metaActiveTab = ref('deposit') // 'deposit' | 'withdrawal'
const newEmailInput = ref('')

// ── Form Model State ──
const defaultFormData = () => ({
  wallet_label: '',
  gateway: '',
  method_type: '',
  payment_method_code: '',
  remarks: '',
  is_active: true,
  enable_deposit: true,
  enable_withdrawal: true,
  is_default_deposit: false,
  is_default_withdrawal: false,

  minimum_deposit_amount: 0,
  maximum_deposit_amount: 0,
  minimum_withdrawal_amount: 0,
  maximum_withdrawal_amount: 0,
  maximum_withdrawals_per_day: null,

  // Direct credentials
  upi_id: '',
  bank_name: '',
  account_name: '',
  account_number: '',
  ifsc_code: '',
  branch_name: '',
  swift_code: '',
  wallet_id: '',
  wallet_address: '',

  meta_data: {
    deposit_fields: [],
    withdrawal_fields: [],
  },

  withdraw_notification_emails: [],
})

const form = ref(defaultFormData())

// Current active fields list in metadata builder
const currentFieldsList = computed(() => {
  if (metaActiveTab.value === 'deposit') {
    return form.value.meta_data.deposit_fields
  }
  return form.value.meta_data.withdrawal_fields
})

// ── Watch props.open to populate from API or reset form ──
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      validationErrors.value = []
      fieldErrors.value = {}
      metaActiveTab.value = 'deposit'
      newEmailInput.value = ''

      if (props.paymentMethod) {
        // Edit Mode: copy data directly from the API response
        const p = props.paymentMethod
        form.value = {
          wallet_label: p.wallet_label || '',
          gateway: p.gateway || '',
          method_type: p.method_type || '',
          payment_method_code: p.payment_method_code || '',
          remarks: p.remarks || '',
          is_active: p.is_active ?? true,
          enable_deposit: p.enable_deposit ?? true,
          enable_withdrawal: p.enable_withdrawal ?? true,
          is_default_deposit: p.is_default_deposit ?? false,
          is_default_withdrawal: p.is_default_withdrawal ?? false,

          minimum_deposit_amount: p.minimum_deposit_amount ?? 0,
          maximum_deposit_amount: p.maximum_deposit_amount ?? 0,
          minimum_withdrawal_amount: p.minimum_withdrawal_amount ?? 0,
          maximum_withdrawal_amount: p.maximum_withdrawal_amount ?? 0,
          maximum_withdrawals_per_day: p.maximum_withdrawals_per_day ?? null,

          upi_id: p.upi_id || '',
          bank_name: p.bank_name || '',
          account_name: p.account_name || '',
          account_number: p.account_number || '',
          ifsc_code: p.ifsc_code || '',
          branch_name: p.branch_name || '',
          swift_code: p.swift_code || '',
          wallet_id: p.wallet_id || '',
          wallet_address: p.wallet_address || '',

          meta_data: {
            deposit_fields: Array.isArray(p.meta_data?.deposit_fields) ? JSON.parse(JSON.stringify(p.meta_data.deposit_fields)) : [],
            withdrawal_fields: Array.isArray(p.meta_data?.withdrawal_fields) ? JSON.parse(JSON.stringify(p.meta_data.withdrawal_fields)) : [],
          },

          withdraw_notification_emails: Array.isArray(p.withdraw_notification_emails) ? [...p.withdraw_notification_emails] : [],
        }
      } else {
        // Create Mode: start clean without any hardcoded templates
        form.value = defaultFormData()
      }
    }
  },
  { immediate: true }
)

// ── Dynamic Meta Fields Methods ──
const addNewField = () => {
  const newField = {
    key: '',
    label: '',
    type: 'text',
    required: true,
    placeholder: '',
    options: [],
  }
  if (metaActiveTab.value === 'deposit') {
    form.value.meta_data.deposit_fields.push(newField)
  } else {
    form.value.meta_data.withdrawal_fields.push(newField)
  }
}

const addStandardAmountField = () => {
  const amountField = {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    placeholder: 'Enter amount in USD or local currency',
  }
  const list = metaActiveTab.value === 'deposit' ? form.value.meta_data.deposit_fields : form.value.meta_data.withdrawal_fields
  if (!list.some((f) => f.key === 'amount')) {
    list.unshift(amountField)
  }
}

const removeField = (index) => {
  if (metaActiveTab.value === 'deposit') {
    form.value.meta_data.deposit_fields.splice(index, 1)
  } else {
    form.value.meta_data.withdrawal_fields.splice(index, 1)
  }
}

const getFieldOptionsString = (field) => {
  if (!field) return ''
  if (Array.isArray(field.options)) {
    return field.options
      .map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return opt.label || opt.value || ''
        }
        return String(opt)
      })
      .filter(Boolean)
      .join(', ')
  }
  return field.options || ''
}

const updateSelectOptions = (field, strVal) => {
  if (!strVal || !strVal.trim()) {
    field.options = []
    return
  }
  const items = strVal
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const hadObjects = Array.isArray(field.options) && field.options.some((o) => typeof o === 'object' && o !== null)
  if (hadObjects) {
    field.options = items.map((item) => {
      const existing = (field.options || []).find((o) => typeof o === 'object' && o !== null && (o.label === item || o.value === item))
      if (existing) {
        return { label: existing.label || item, value: existing.value || item }
      }
      return { label: item, value: item }
    })
  } else {
    field.options = items
  }
}

const getOptionsByJsonString = (field) => {
  if (!field || !field.options_by) return ''
  if (field._raw_options_by !== undefined) return field._raw_options_by
  try {
    return typeof field.options_by === 'string' ? field.options_by : JSON.stringify(field.options_by, null, 2)
  } catch {
    return ''
  }
}

const updateOptionsByJson = (field, jsonStr) => {
  field._raw_options_by = jsonStr
  if (!jsonStr || !jsonStr.trim()) {
    delete field.options_by
    delete field._raw_options_by
    return
  }
  try {
    field.options_by = JSON.parse(jsonStr)
  } catch {
    // Keep typing allowed
  }
}

// ── Notification Email Methods ──
const addEmail = () => {
  const email = newEmailInput.value.trim()
  if (!email) return
  if (!email.includes('@') || !email.includes('.')) {
    validationErrors.value = ['Please enter a valid email address.']
    return
  }
  if (!form.value.withdraw_notification_emails) {
    form.value.withdraw_notification_emails = []
  }
  if (!form.value.withdraw_notification_emails.includes(email)) {
    form.value.withdraw_notification_emails.push(email)
  }
  newEmailInput.value = ''
}

const removeEmail = (index) => {
  form.value.withdraw_notification_emails.splice(index, 1)
}

// ── Close Handler ──
const handleClose = () => {
  if (submitting.value) return
  emit('close')
}

// ── Validation on Submit ──
const validate = () => {
  const errors = []
  const fields = {}

  if (!form.value.wallet_label || !form.value.wallet_label.trim()) {
    errors.push('Payment Method Label is required.')
    fields.wallet_label = 'Label is required.'
  }

  if (!form.value.gateway || !form.value.gateway.trim()) {
    errors.push('Gateway Provider is required.')
    fields.gateway = 'Gateway is required.'
  }

  if (!form.value.method_type || !form.value.method_type.trim()) {
    errors.push('Method Type is required.')
    fields.method_type = 'Method type is required.'
  }

  // Numeric limit checks
  if (Number(form.value.minimum_deposit_amount) < 0) {
    errors.push('Minimum deposit amount cannot be negative.')
    fields.minimum_deposit_amount = 'Cannot be negative.'
  }
  if (Number(form.value.maximum_deposit_amount) < 0) {
    errors.push('Maximum deposit amount cannot be negative.')
    fields.maximum_deposit_amount = 'Cannot be negative.'
  }
  if (
    Number(form.value.maximum_deposit_amount) > 0 &&
    Number(form.value.maximum_deposit_amount) < Number(form.value.minimum_deposit_amount)
  ) {
    errors.push('Maximum deposit amount cannot be less than minimum deposit amount.')
    fields.maximum_deposit_amount = 'Must be greater than or equal to min deposit.'
  }

  if (Number(form.value.minimum_withdrawal_amount) < 0) {
    errors.push('Minimum withdrawal amount cannot be negative.')
    fields.minimum_withdrawal_amount = 'Cannot be negative.'
  }
  if (Number(form.value.maximum_withdrawal_amount) < 0) {
    errors.push('Maximum withdrawal amount cannot be negative.')
    fields.maximum_withdrawal_amount = 'Cannot be negative.'
  }
  if (
    Number(form.value.maximum_withdrawal_amount) > 0 &&
    Number(form.value.maximum_withdrawal_amount) < Number(form.value.minimum_withdrawal_amount)
  ) {
    errors.push('Maximum withdrawal amount cannot be less than minimum withdrawal amount.')
    fields.maximum_withdrawal_amount = 'Must be greater than or equal to min withdrawal.'
  }

  if (form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== '') {
    if (Number(form.value.maximum_withdrawals_per_day) < 0) {
      errors.push('Maximum withdrawals per day cannot be negative.')
      fields.maximum_withdrawals_per_day = 'Cannot be negative.'
    }
  }

  // Dynamic meta_data validation
  const allDynamicFields = [
    ...(form.value.meta_data.deposit_fields || []),
    ...(form.value.meta_data.withdrawal_fields || []),
  ]
  allDynamicFields.forEach((f, i) => {
    if (!f.key || !f.key.trim()) {
      errors.push(`Dynamic field #${i + 1} is missing a Field Key.`)
    }
    if (!f.label || !f.label.trim()) {
      errors.push(`Dynamic field #${i + 1} (${f.key || 'unnamed'}) is missing a Display Label.`)
    }
    if (f._raw_options_by && f._raw_options_by.trim()) {
      try {
        JSON.parse(f._raw_options_by)
      } catch (e) {
        errors.push(`Dynamic field #${i + 1} (${f.key || 'unnamed'}) has invalid JSON in options_by.`)
      }
    }
  })

  validationErrors.value = errors
  fieldErrors.value = fields

  return errors.length === 0
}

const sanitizeDynamicField = (field) => {
  const f = { ...field }
  delete f._raw_options_by
  return f
}

// ── Submit Handler ──
const submit = async () => {
  if (!validate()) {
    formBodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  submitting.value = true
  validationErrors.value = []

  try {
    const payload = {
      wallet_label: form.value.wallet_label.trim(),
      gateway: form.value.gateway.trim(),
      method_type: form.value.method_type.trim(),
      payment_method_code: form.value.payment_method_code ? form.value.payment_method_code.trim() : null,
      remarks: form.value.remarks ? form.value.remarks.trim() : null,
      is_active: Boolean(form.value.is_active),
      enable_deposit: Boolean(form.value.enable_deposit),
      enable_withdrawal: Boolean(form.value.enable_withdrawal),
      is_default_deposit: Boolean(form.value.is_default_deposit),
      is_default_withdrawal: Boolean(form.value.is_default_withdrawal),

      minimum_deposit_amount: Number(form.value.minimum_deposit_amount) || 0,
      maximum_deposit_amount: Number(form.value.maximum_deposit_amount) || 0,
      minimum_withdrawal_amount: Number(form.value.minimum_withdrawal_amount) || 0,
      maximum_withdrawal_amount: Number(form.value.maximum_withdrawal_amount) || 0,
      maximum_withdrawals_per_day:
        form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== ''
          ? Number(form.value.maximum_withdrawals_per_day)
          : null,

      meta_data: {
        deposit_fields: (form.value.meta_data.deposit_fields || []).map(sanitizeDynamicField),
        withdrawal_fields: (form.value.meta_data.withdrawal_fields || []).map(sanitizeDynamicField),
      },

      withdraw_notification_emails: form.value.withdraw_notification_emails || [],
    }

    // Include optional credentials only if provided
    if (form.value.upi_id) payload.upi_id = form.value.upi_id.trim()
    if (form.value.bank_name) payload.bank_name = form.value.bank_name.trim()
    if (form.value.account_name) payload.account_name = form.value.account_name.trim()
    if (form.value.account_number) payload.account_number = form.value.account_number.trim()
    if (form.value.ifsc_code) payload.ifsc_code = form.value.ifsc_code.trim()
    if (form.value.branch_name) payload.branch_name = form.value.branch_name.trim()
    if (form.value.swift_code) payload.swift_code = form.value.swift_code.trim()
    if (form.value.wallet_id) payload.wallet_id = form.value.wallet_id.trim()
    if (form.value.wallet_address) payload.wallet_address = form.value.wallet_address.trim()

    if (isEdit.value) {
      await store.updatePaymentMethod(props.paymentMethod.id, payload)
    } else {
      await store.createPaymentMethod(payload)
    }

    emit('close')
  } catch (err) {
    const msg = err?.message || 'An error occurred while saving payment method.'
    validationErrors.value = [msg]
    formBodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
