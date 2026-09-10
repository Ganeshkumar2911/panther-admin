<template>
  <div class="space-y-6">
    <!-- Header Banner & Program Switcher -->
    <div
      v-if="program"
      class="relative overflow-hidden bg-card-background border border-primary-border rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 group shadow-2xs"
    >
      <div class="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div class="absolute top-0 right-0 w-64 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div class="relative space-y-2 z-10">
        <!-- Badges & Selector -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Program Select Dropdown if multiple programs -->
          <div v-if="programsList.length > 1" class="w-48">
            <BaseSelect
              :modelValue="program.id"
              :options="programSelectOptions"
              placeholder="Select Program..."
              variant="surface"
              @update:modelValue="handleProgramSwitch"
            />
          </div>
          <span v-else class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
            <Sparkles class="w-3 h-3" />
            <span>{{ program.code }}</span>
          </span>

          <span
            class="text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
            :class="program.status === 'active' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="program.status === 'active' ? 'bg-primary-green animate-ping' : 'bg-amber-500'" />
            <span>{{ program.status }}</span>
          </span>

          <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full border bg-background text-secondary-text border-primary-border uppercase">
            {{ program.account_scope === 'all_eligible_accounts' ? 'All Eligible Accounts' : 'One Account Per User' }}
          </span>

          <span class="text-[10px] font-mono text-secondary-text">Config v{{ program.config_version || 1 }}</span>
        </div>

        <h2 class="text-xl font-bold text-primary-text tracking-tight">
          {{ program.name || 'PantherTrade Loyalty Program' }}
        </h2>
        <p class="text-xs text-secondary-text max-w-xl leading-relaxed">
          {{ program.description || 'Point accumulation engine converting live trading volume into reward stages, tier multipliers, and store product claims.' }}
        </p>
      </div>

      <!-- Header Action Buttons -->
      <div class="relative z-10 flex items-center gap-2.5 ml-auto">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer shadow-2xs"
          @click="isCreateDrawerOpen = true"
        >
          <Plus class="w-3.5 h-3.5 text-primary" />
          <span>New Program</span>
        </button>

        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="handleOpenEdit('all')"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>Edit Program Rules</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Full-screen Media Preview Modal -->
    <Transition name="modal-fade">
      <div
        v-if="isPreviewModalOpen"
        class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        @click="isPreviewModalOpen = false"
      >
        <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-3" @click.stop>
          <button
            type="button"
            class="absolute -top-10 right-0 text-white/70 hover:text-white transition cursor-pointer p-1"
            @click="isPreviewModalOpen = false"
          >
            <X class="w-6 h-6" />
          </button>
          <video
            v-if="isVideoUrl(bannerImages[currentImageIndex])"
            :key="`modal-video-${currentImageIndex}`"
            :src="bannerImages[currentImageIndex]"
            controls
            autoplay
            loop
            playsinline
            class="max-w-full max-h-[80vh] rounded-xl object-contain border border-white/10 shadow-2xl"
          />
          <img
            v-else
            :key="`modal-img-${currentImageIndex}`"
            :src="bannerImages[currentImageIndex]"
            alt="Program Banner"
            class="max-w-full max-h-[80vh] rounded-xl object-contain border border-white/10 shadow-2xl"
          />
          <!-- Modal Carousel Navigation -->
          <div v-if="bannerImages.length > 1" class="flex items-center gap-3 text-white text-xs font-mono">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer"
              @click="prevImage"
            >
              Previous
            </button>
            <span>{{ currentImageIndex + 1 }} / {{ bannerImages.length }}</span>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer"
              @click="nextImage"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Skeleton Loading -->
    <div v-if="store.loading" class="space-y-4">
      <div class="h-28 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="n in 6" :key="n" class="h-20 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!program"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-lg text-center gap-3"
    >
      <div class="w-12 h-12 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Award class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Active Loyalty Program</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          No loyalty program configuration was found on this server.
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="isCreateDrawerOpen = true"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Program</span>
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Clean Program Banner Media Carousel -->
      <div
        v-if="bannerImages.length > 0"
        class="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden border border-primary-border bg-card-background group/carousel shadow-xs select-none"
        @mouseenter="isHoveringCarousel = true"
        @mouseleave="isHoveringCarousel = false"
      >
        <!-- Banner Media Transition (Video or Image) -->
        <Transition name="carousel-fade" mode="out-in">
          <video
            v-if="isVideoUrl(bannerImages[currentImageIndex])"
            :key="`video-${currentImageIndex}`"
            :src="bannerImages[currentImageIndex]"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover cursor-pointer"
            @click="isPreviewModalOpen = true"
          />
          <img
            v-else
            :key="`img-${currentImageIndex}`"
            :src="bannerImages[currentImageIndex]"
            alt="Program Banner"
            class="w-full h-full object-cover cursor-pointer transition-transform duration-700"
            @click="isPreviewModalOpen = true"
            @error="handleImageError"
          />
        </Transition>

        <!-- Subtle Gradient Overlays -->
        <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        <!-- Top Right Actions & Counter -->
        <div class="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white/90 hover:text-white border border-white/10 flex items-center justify-center transition cursor-pointer hover:scale-105 shadow-xs"
            title="Expand Banner"
            @click="isPreviewModalOpen = true"
          >
            <Maximize2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Left / Right Navigation Buttons (Multiple Banners) -->
        <div
          v-if="bannerImages.length > 1"
          class="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center transition hover:bg-black/90 cursor-pointer pointer-events-auto hover:scale-105 shadow-md"
            title="Previous Banner"
            @click.stop="prevImage"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center transition hover:bg-black/90 cursor-pointer pointer-events-auto hover:scale-105 shadow-md"
            title="Next Banner"
            @click.stop="nextImage"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Bottom Pagination Dots (Multiple Banners) -->
        <div
          v-if="bannerImages.length > 1"
          class="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10"
        >
          <button
            v-for="(_, idx) in bannerImages"
            :key="idx"
            type="button"
            class="h-1.5 rounded-full transition-all cursor-pointer"
            :class="idx === currentImageIndex ? 'w-6 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'"
            @click.stop="goToImage(idx)"
          />
        </div>
      </div>

      <!-- 6-Card High Fidelity KPI Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Tiers"
          :value="program.summary?.tiers ?? 0"
          subtext="Progression Stages"
        />
        <MetricCard
          title="Store Items"
          :value="program.summary?.rewards ?? 0"
          subtext="Catalogue Products"
        />
        <MetricCard
          title="Enrollments"
          :value="program.summary?.enrollments ?? 0"
          subtext="Enrolled Accounts"
        />
        <MetricCard
          title="Base Earn Rate"
          :value="`${program.base_points_per_lot ?? '5.00'} pts`"
          subtext="Per Standard Lot"
        />
        <MetricCard
          title="Min Redemption"
          :value="`${program.min_redemption_points ?? '100'} pts`"
          subtext="Minimum Claim"
        />
        <MetricCard
          title="Point Validity"
          :value="`${program.point_validity_days ?? 180} days`"
          subtext="Validity Period"
        />
      </div>

      <!-- Main Specifications & Policy Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Card 1: Core Trade & Tier Policy -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border">
            <h3 class="text-xs font-semibold text-primary-text flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <span>Core Program Rules & Thresholds</span>
            </h3>
            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              @click="handleOpenEdit('core_rules')"
            >
              <Pencil class="w-3 h-3" />
              <span>Edit Rules</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Clock class="w-3 h-3 text-primary" />
                Min Trade Duration
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.min_trade_duration_seconds ?? 120 }}s <span class="text-[11px] font-sans font-normal text-secondary-text">({{ Math.round((program.min_trade_duration_seconds || 120) / 60) }} mins)</span>
              </p>
              <p class="text-[10px] text-secondary-text">Trades closed under minimum duration excluded</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Calendar class="w-3 h-3 text-primary" />
                Tier Rolling Window
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.tier_window_days ?? 90 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Qualification volume evaluation window</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <ShieldAlert class="w-3 h-3 text-amber-500" />
                Downgrade Grace Period
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.grace_period_days ?? 14 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Buffer period before stage downgrade</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Hourglass class="w-3 h-3 text-rose-400" />
                Dormancy Expiry Rule
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.dormant_days ?? 90 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Inactive accounts forfeit accumulated balance</p>
            </div>
          </div>

          <!-- Carry Over Status -->
          <div class="flex items-center justify-between p-3 bg-background/40 border border-primary-border rounded-lg text-xs">
            <div>
              <p class="font-medium text-primary-text">Enrollment Carry-Over</p>
              <p class="text-[10px] text-secondary-text">Carry over enrolled accounts to subsequent program cycles</p>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
              :class="program.carry_over_enrollments ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background text-secondary-text border border-primary-border'"
            >
              {{ program.carry_over_enrollments ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>

        <!-- Card 2: Cycle Timelines & Lifecycle -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border">
            <h3 class="text-xs font-semibold text-primary-text flex items-center gap-2">
              <Calendar class="w-4 h-4 text-primary" />
              <span>Cycle Lifespan & Schedule</span>
            </h3>
            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              @click="handleOpenEdit('lifecycle')"
            >
              <Pencil class="w-3 h-3" />
              <span>Edit Dates</span>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-lg">
              <div>
                <span class="text-[10px] uppercase font-medium text-secondary-text block">Programme Start Date</span>
                <span class="font-medium font-mono text-primary-text text-sm">{{ formatDate(program.start_at) }}</span>
              </div>
              <span class="text-[10px] text-secondary-text">Point tracking begins</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-lg">
              <div>
                <span class="text-[10px] uppercase font-medium text-secondary-text block">Programme End Date</span>
                <span class="font-medium font-mono text-primary-text text-sm">{{ formatDate(program.end_at) }}</span>
              </div>
              <span class="text-[10px] text-secondary-text">Cycle closes</span>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="p-2.5 bg-background/30 border border-primary-border rounded-lg space-y-0.5">
                <span class="text-[10px] uppercase font-medium text-secondary-text">Created At</span>
                <p class="text-primary-text text-[11px] truncate">{{ formatDate(program.created_at) }}</p>
              </div>

              <div class="p-2.5 bg-background/30 border border-primary-border rounded-lg space-y-0.5">
                <span class="text-[10px] uppercase font-medium text-secondary-text">Last Updated</span>
                <p class="text-primary-text text-[11px] truncate">{{ formatDate(program.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Eligibility & Instrument Rules Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Eligibility Rules -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-3 shadow-2xs text-xs">
          <div class="flex items-center justify-between pb-2.5 border-b border-primary-border">
            <h3 class="font-semibold text-primary-text flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-primary-green" />
              <span>Account Eligibility Rules</span>
            </h3>
            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              @click="handleOpenEdit('eligibility')"
            >
              <Pencil class="w-3 h-3" />
              <span>Edit Eligibility</span>
            </button>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Require KYC Verification:</span>
              <span class="font-mono font-bold" :class="eligibilityRules?.require_kyc ? 'text-primary-green' : 'text-secondary-text'">
                {{ eligibilityRules?.require_kyc ? 'YES' : 'NO' }}
              </span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Require Live Account:</span>
              <span class="font-mono font-bold" :class="eligibilityRules?.require_live !== false ? 'text-primary-green' : 'text-secondary-text'">
                {{ eligibilityRules?.require_live !== false ? 'YES' : 'NO' }}
              </span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Allowed Trading Types:</span>
              <span class="font-mono text-primary-text">{{ (eligibilityRules?.trading_types || ['real']).join(', ') }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Excluded Account Categories:</span>
              <span class="font-mono text-rose-400">{{ (eligibilityRules?.exclude_account_categories || ['cent', 'pamm']).join(', ') }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Exclude Copy Trading Accounts:</span>
              <span class="font-mono font-bold" :class="eligibilityRules?.exclude_copy_accounts ? 'text-primary-green' : 'text-secondary-text'">
                {{ eligibilityRules?.exclude_copy_accounts ? 'YES' : 'NO' }}
              </span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Earn on Copy Fills:</span>
              <span class="font-mono font-bold" :class="eligibilityRules?.earn_on_copy_fills !== false ? 'text-primary-green' : 'text-secondary-text'">
                {{ eligibilityRules?.earn_on_copy_fills !== false ? 'YES' : 'NO' }}
              </span>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-background/50 border border-primary-border rounded-lg">
              <span class="text-secondary-text">Allowed Group Codes:</span>
              <span class="font-mono text-primary-text">
                {{ Array.isArray(eligibilityRules?.allowed_group_codes) && eligibilityRules.allowed_group_codes.length > 0 ? eligibilityRules.allowed_group_codes.join(', ') : 'All Group Codes' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Instrument Rules -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-3.5 shadow-2xs text-xs">
          <div class="flex items-center justify-between pb-2.5 border-b border-primary-border gap-2 flex-wrap">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h3 class="font-semibold text-primary-text flex items-center gap-2">
                <FileCode class="w-4 h-4 text-primary" />
                <span>Instrument Rules & Suffixes</span>
              </h3>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border inline-flex items-center gap-1.5"
                :class="program.instrument_rules?.normalize_suffixes
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-background text-secondary-text border-primary-border'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="program.instrument_rules?.normalize_suffixes ? 'bg-primary-green' : 'bg-secondary-text'" />
                <span>{{ program.instrument_rules?.normalize_suffixes ? 'Suffix Normalization Active' : 'Suffix Normalization Off' }}</span>
              </span>
            </div>

            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              @click="handleOpenEdit('instruments')"
            >
              <Pencil class="w-3 h-3" />
              <span>Edit Instruments</span>
            </button>
          </div>

          <!-- Rules List If Exists -->
          <div v-if="program.instrument_rules?.rules && program.instrument_rules.rules.length > 0" class="space-y-2.5">
            <div
              v-for="(rule, idx) in program.instrument_rules.rules"
              :key="idx"
              class="p-3 bg-background/50 border border-primary-border hover:border-primary/40 rounded-xl transition-all space-y-2"
            >
              <div class="flex items-start justify-between gap-2">
                <!-- Symbols Chips -->
                <div class="flex flex-wrap items-center gap-1.5 flex-1">
                  <span
                    v-for="(sym, sIdx) in (rule.symbols || ['All Symbols'])"
                    :key="sIdx"
                    class="px-2 py-0.5 rounded-md bg-card-background border border-primary-border text-primary-text font-mono font-bold text-[11px] shadow-2xs"
                  >
                    {{ sym }}
                  </span>
                </div>

                <!-- Points Rate Tag -->
                <div class="text-right shrink-0">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-green/10 text-primary-green font-mono font-bold text-xs border border-primary-green/20">
                    {{ rule.base_points_per_lot }} pts/lot
                  </span>
                </div>
              </div>

              <!-- Meta Footer for Rule -->
              <div class="flex items-center justify-between text-[11px] text-secondary-text pt-1 border-t border-primary-border/40">
                <span class="inline-flex items-center gap-1">
                  <span>Match Mode:</span>
                  <span class="font-mono text-primary-text uppercase font-semibold text-[10px] px-1.5 py-0.2 bg-background rounded border border-primary-border">
                    {{ rule.match || 'exact' }}
                  </span>
                </span>
                <span
                  class="font-medium text-[10px] uppercase font-mono"
                  :class="rule.eligible !== false ? 'text-primary-green' : 'text-rose-400'"
                >
                  {{ rule.eligible !== false ? '● Eligible' : '● Excluded' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Polished Informational Default Card -->
          <div
            v-else
            class="p-4 rounded-xl bg-background/40 border border-primary-border space-y-3"
          >
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <SlidersHorizontal class="w-4 h-4" />
              </div>
              <div class="space-y-0.5">
                <h4 class="text-xs font-semibold text-primary-text">Standard Base Multiplier Inherited</h4>
                <p class="text-[11px] text-secondary-text leading-relaxed">
                  All forex, metals, and index trades earn the standard base rate of
                  <span class="font-mono font-bold text-primary-green">{{ program.base_points_per_lot ?? '5.00' }} pts/lot</span>
                  without custom symbol overrides.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <div class="p-2 rounded-lg bg-card-background/60 border border-primary-border/60 flex items-center justify-between">
                <span class="text-[10px] text-secondary-text">Suffix Normalization:</span>
                <span class="font-mono text-[10px] font-bold" :class="program.instrument_rules?.normalize_suffixes ? 'text-primary-green' : 'text-secondary-text'">
                  {{ program.instrument_rules?.normalize_suffixes ? 'Active' : 'Disabled' }}
                </span>
              </div>
              <div class="p-2 rounded-lg bg-card-background/60 border border-primary-border/60 flex items-center justify-between">
                <span class="text-[10px] text-secondary-text">Custom Overrides:</span>
                <span class="font-mono text-[10px] font-bold text-secondary-text">0 Rules</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Program Drawer -->
    <EditProgramDrawer
      :open="isEditDrawerOpen"
      :program="program"
      :initialSection="targetSection"
      @close="isEditDrawerOpen = false"
      @saved="handleRefresh"
    />

    <!-- Create Program Drawer -->
    <CreateProgramDrawer
      :open="isCreateDrawerOpen"
      @close="isCreateDrawerOpen = false"
      @created="handleProgramCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  Award,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Clock,
  ShieldAlert,
  Hourglass,
  SlidersHorizontal,
  Sparkles,
  Plus,
  CheckCircle2,
  FileCode,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  Pencil,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import MetricCard from "@/components/common/MetricCard.vue";
import EditProgramDrawer from "../components/EditProgramDrawer.vue";
import CreateProgramDrawer from "../components/CreateProgramDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEditDrawerOpen = ref(false);
const isCreateDrawerOpen = ref(false);
const targetSection = ref("all");

const handleOpenEdit = (section = "all") => {
  targetSection.value = section;
  isEditDrawerOpen.value = true;
};

const program = computed(() => store.program);
const eligibilityRules = computed(() => program.value?.eligibility_rules || program.value?.eligibility || {});
const programsList = computed(() => store.programsList || []);

// Banner Images Carousel Logic
const currentImageIndex = ref(0);
const isPreviewModalOpen = ref(false);
const isHoveringCarousel = ref(false);
let autoplayTimer = null;

const bannerImages = computed(() => {
  if (!program.value) return [];
  const urls = [];
  if (Array.isArray(program.value.image_urls) && program.value.image_urls.length > 0) {
    program.value.image_urls.forEach((u) => {
      if (typeof u === "string" && u.trim().length > 0 && !urls.includes(u.trim())) {
        urls.push(u.trim());
      }
    });
  }
  if (urls.length === 0 && program.value.image_url && typeof program.value.image_url === "string" && program.value.image_url.trim().length > 0) {
    urls.push(program.value.image_url.trim());
  }
  return urls;
});

const nextImage = () => {
  if (bannerImages.value.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % bannerImages.value.length;
};

const prevImage = () => {
  if (bannerImages.value.length <= 1) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + bannerImages.value.length) % bannerImages.value.length;
};

const goToImage = (index) => {
  currentImageIndex.value = index;
};

const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.includes("/video/") ||
    cleanUrl.includes("format=mp4")
  );
};

const handleImageError = (e) => {
  if (e?.target) {
    e.target.style.opacity = "0.5";
  }
};

const startAutoplay = () => {
  stopAutoplay();
  if (bannerImages.value.length > 1) {
    autoplayTimer = setInterval(() => {
      if (!isHoveringCarousel.value && !isPreviewModalOpen.value) {
        nextImage();
      }
    }, 4500);
  }
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

watch(
  bannerImages,
  (imgs) => {
    if (currentImageIndex.value >= imgs.length) {
      currentImageIndex.value = 0;
    }
    startAutoplay();
  },
  { immediate: true }
);

const programSelectOptions = computed(() =>
  programsList.value.map((p) => ({
    label: `${p.name || p.code} (${p.status})`,
    value: p.id,
  }))
);

const handleProgramSwitch = (programId) => {
  if (programId) {
    store.fetchProgram(programId, true);
  }
};

const handleProgramCreated = () => {
  // store.createProgram already refreshes programsList and sets the active program
};

const handleRefresh = () => {
  if (program.value?.id) {
    store.fetchProgram(program.value.id, true);
  }
};

onMounted(() => {
  if (!store.isFetched.programsList) {
    store.fetchProgramsList();
  }
  if (!store.isFetched.program) {
    store.fetchProgram();
  }
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.35s ease;
}
.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
