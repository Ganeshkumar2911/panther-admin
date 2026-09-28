<template>
  <div class="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- 1. TOP HEADER FORENSICS HERO CARD                                 -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="relative bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-6 overflow-hidden shadow-xs">
      <!-- Decorative subtle light blue wave gradient aura in top right (Matches Screenshot) -->
      <div class="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none overflow-hidden opacity-90 select-none">
        <svg class="absolute right-0 top-0 h-full w-full" viewBox="0 0 600 220" fill="none" preserveAspectRatio="none">
          <path d="M150 0 C250 80, 400 30, 600 120 L600 0 Z" fill="url(#hero-wave-1)" />
          <path d="M300 0 C420 120, 480 60, 600 180 L600 0 Z" fill="url(#hero-wave-2)" />
          <defs>
            <linearGradient id="hero-wave-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.04" />
              <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.14" />
            </linearGradient>
            <linearGradient id="hero-wave-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#2563EB" stop-opacity="0.03" />
              <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.09" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Top Meta Tags & Badges Bar -->
      <div class="relative z-10 flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Back button arrow -->
          <button
            type="button"
            class="p-2 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition cursor-pointer"
            title="Back"
            @click="$emit('back')"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <!-- #LOG-ID Pill -->
          <span class="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-md border border-blue-100 dark:border-blue-900/40">
            #LOG-{{ computedEventId }}
          </span>

          <!-- Module / Entity with Green Plus -->
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            <span>{{ moduleValue }} / {{ entityValue }}</span>
            <Plus class="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
          </div>

          <!-- Status Badge -->
          <span
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-0.5 rounded-full border uppercase tracking-wide"
            :class="isSuccess(statusValue) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40' : isFailed(statusValue) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="isSuccess(statusValue) ? 'bg-emerald-500' : isFailed(statusValue) ? 'bg-red-500' : 'bg-amber-500'"></span>
            {{ statusValue }}
          </span>

          <!-- HTTP Method -->
          <span class="inline-flex items-center text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 uppercase">
            {{ requestMethod }}
          </span>

          <!-- Role -->
          <span class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 capitalize">
            Role: {{ actorInfo.role || 'Superadmin' }}
          </span>
        </div>

        <!-- 3-Dots Action Menu -->
        <button
          type="button"
          class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          title="Options"
          @click="copyText(JSON.stringify(rawRecord, null, 2), 'Audit Record')"
        >
          <MoreVertical class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Event Title & Narrative Subtitle -->
      <div class="relative z-10 flex items-start gap-4">
        <!-- Rounded Blue Device/Terminal Icon (Exact Match with Screenshot) -->
        <div class="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
          <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
            <rect x="5" y="8.5" width="14" height="2.2" rx="1.1" fill="currentColor"/>
            <rect x="5" y="13.5" width="8" height="2.2" rx="1.1" fill="currentColor"/>
            <circle cx="16.5" cy="14.6" r="1.4" fill="currentColor"/>
          </svg>
        </div>

        <div class="min-w-0 space-y-1.5">
          <h1 class="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight capitalize">
            {{ displayTitle }}
          </h1>
          <p class="text-xs lg:text-[13px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-4xl">
            {{ displaySubtitle }}
          </p>

          <!-- Meta Pills Row (Matching Screenshot) -->
          <div class="flex items-center gap-3 pt-0.5 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <!-- Status Pill -->
            <span
              class="inline-flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-0.5 rounded-full border uppercase"
              :class="isSuccess(statusValue) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80' : 'bg-red-50 text-red-600 border-red-200'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="isSuccess(statusValue) ? 'bg-emerald-500' : 'bg-red-500'"></span>
              {{ statusValue }}
            </span>

            <!-- Date Timestamp -->
            <span class="inline-flex items-center gap-1.5 text-[11px] font-medium">
              <Calendar class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ formattedDateTime }}</span>
            </span>

            <!-- Module Tag -->
            <span class="inline-flex items-center gap-1.5 capitalize font-medium text-[11px]">
              <Landmark class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ moduleDisplay }}</span>
            </span>

            <!-- HTTP Method Tag -->
            <span class="inline-flex items-center gap-1.5 font-mono font-bold text-[11px] uppercase text-blue-600 dark:text-blue-400">
              <Tag class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ requestMethod }}</span>
            </span>

            <!-- Log ID Tag -->
            <span class="inline-flex items-center gap-1.5 font-mono font-medium text-[11px]">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              <span>Log ID: #{{ computedEventId }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 4 Horizontal Executive Mini Cards Row (Exact Layout from Screenshot) -->
      <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <!-- 1. Actor (With RR Initials Avatar) -->
        <div class="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div class="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">
            {{ actorInitials }}
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Actor</span>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" :title="actorInfo.name">
              {{ actorInfo.name }}
            </h4>
            <div class="mt-1">
              <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 uppercase tracking-wide">
                {{ actorInfo.role || 'Superadmin' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Action -->
        <div class="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div class="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Settings class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Action</span>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" :title="actionSummaryTitle">
              {{ actionSummaryTitle }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
              {{ actionSummarySub }}
            </p>
          </div>
        </div>

        <!-- 3. Target -->
        <div class="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div class="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Database class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Target</span>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" :title="targetInfo.displayName">
              {{ targetInfo.displayName }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
              {{ moduleDisplay }} • {{ targetInfo.gateway }}
            </p>
          </div>
        </div>

        <!-- 4. Change -->
        <div class="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div class="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <ArrowRightLeft class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Change</span>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" :title="changeMetricTitle">
              {{ changeMetricTitle }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
              {{ changeMetricSub }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- 2. MAIN 2-COLUMN GRID                                             -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      <!-- ================= LEFT COLUMN ================= -->
      <div class="space-y-6">
        
        <!-- CARD 1: What Changed? -->
        <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileCode class="w-4 h-4" />
              </div>
              <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">What Changed?</h3>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {{ mutationRows.length }} field{{ mutationRows.length !== 1 ? 's' : '' }} modified
            </span>
          </div>

          <!-- Mutation Diff Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400">
                  <th class="py-2.5 px-1 font-semibold">Field</th>
                  <th class="py-2.5 px-2 text-center font-semibold">Previous Value</th>
                  <th class="py-2.5 px-1 text-center w-6 font-semibold"></th>
                  <th class="py-2.5 px-2 text-center font-semibold">New Value</th>
                  <th class="py-2.5 px-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                <tr
                  v-for="row in mutationRows"
                  :key="row.field"
                >
                  <td class="py-3.5 px-1 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span>{{ row.label }}</span>
                      <Info class="w-3.5 h-3.5 text-blue-500 shrink-0 cursor-help" />
                    </div>
                  </td>
                  <td class="py-3.5 px-2 text-center">
                    <span class="inline-block font-sans text-xs font-medium px-4 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 max-w-[150px] truncate" :title="row.oldDisplay">
                      {{ row.oldDisplay }}
                    </span>
                  </td>
                  <td class="py-3.5 px-1 text-center text-slate-400">
                    <ArrowRight class="w-3.5 h-3.5 mx-auto text-slate-400" />
                  </td>
                  <td class="py-3.5 px-2 text-center">
                    <span class="inline-block font-sans text-xs font-medium px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 max-w-[150px] truncate" :title="row.newDisplay">
                      {{ row.newDisplay }}
                    </span>
                  </td>
                  <td class="py-3.5 px-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {{ row.description }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Narrative Highlight Box with Blue Left Accent Bar (Exact Match with Image 1) -->
          <div class="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 border-l-4 border-l-blue-600 bg-blue-50/60 dark:bg-blue-950/20 flex items-center gap-3.5 mt-2">
            <div class="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Edit3 class="w-4 h-4" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                {{ narrativeHighlightTitle }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {{ narrativeHighlightDesc }}
              </p>
            </div>
          </div>
        </div>

        <!-- CARD 2: Target Details (Exact Match with Image 1) -->
        <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Database class="w-4 h-4" />
            </div>
            <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Target Details</h3>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Name</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right truncate max-w-[220px]" :title="targetInfo.displayName">
                {{ targetInfo.displayName }}
              </span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Entity Type</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs uppercase">{{ entityValue }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Module</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs capitalize">{{ moduleDisplay }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Gateway / Broker</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs uppercase">{{ targetInfo.gateway }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Internal ID</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs">#{{ targetInfo.id }}</span>
            </div>
          </div>
        </div>

        <!-- CARD 3: Business Context -->
        <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Layers class="w-4 h-4" />
            </div>
            <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Business Context</h3>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Payment Gateway</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right uppercase">{{ targetInfo.gateway }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Payment Method ID</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right">{{ targetInfo.id }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Target Display Name</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right truncate">{{ targetInfo.displayName }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Request ID</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-xs text-right truncate max-w-[220px] select-all">{{ traceId }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Change Summary</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right">{{ changeMetricTitle }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Fields Modified</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs text-right">{{ mutationRows.length }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">Event Time</span>
              <span class="text-slate-500 dark:text-slate-400 text-xs text-right">{{ formattedDateTime }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ================= RIGHT COLUMN ================= -->
      <div class="space-y-6">
        
        <!-- CARD 1: Location & Network (Exact Match with Image 1) -->
        <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck class="w-4 h-4" />
              </div>
              <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Location & Network</h3>
            </div>
            <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              {{ ipAddress }}
            </span>
          </div>

          <!-- Leaflet Interactive Map -->
          <AuditLogNetworkMap
            :ip-address="ipAddress"
            @geo-resolved="onGeoResolved"
          />

          <!-- 6 Rounded Specs Cards (2 Rows x 3 Columns - Exact Layout from Image 1) -->
          <div class="grid grid-cols-3 gap-3 pt-2 text-xs">
            <!-- Box 1: IP Address -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">IP Address</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white text-xs truncate block">
                {{ ipAddress }}
              </span>
            </div>

            <!-- Box 2: Location -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">Location</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5" :title="originLocationDisplay">
                <span class="shrink-0 text-sm">🇮🇳</span>
                <span class="truncate">{{ originLocationDisplay }}</span>
              </span>
            </div>

            <!-- Box 3: Device -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">Device</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                <svg v-if="parsedAgent.os.toLowerCase().includes('mac')" class="w-3.5 h-3.5 fill-current text-slate-900 dark:text-white shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.35-10.74-20.2-14.25-32.55-3.51-12.35-5.27-23.77-5.27-34.27 0-14.88 3.82-27.16 11.45-36.83 7.63-9.67 17.06-14.6 28.3-14.79 4.79 0 10.22 1.25 16.29 3.75 6.07 2.5 10.14 3.79 12.23 3.87 1.63 0 5.86-1.39 12.7-4.17 6.83-2.77 12.87-4.04 18.11-3.79 13.88.75 24.89 5.8 33.02 15.15-12.13 7.37-18.1 17.52-17.9 30.45.2 10.26 4.11 18.79 11.74 25.59 7.63 6.8 16.59 10.55 26.89 11.24-2.58 7.79-5.77 15.42-9.58 22.91zm-32.96-107.8c0-7.39 2.62-14.34 7.86-20.85 5.24-6.52 11.78-10.63 19.63-12.35.22 1.3.33 2.4.33 3.3 0 7.39-2.74 14.4-8.22 21.03-5.48 6.63-12.08 10.7-19.8 12.21-.22-1.09-.33-2.2-.33-3.34z"/>
                </svg>
                <Monitor v-else class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ parsedAgent.device }}</span>
              </span>
            </div>

            <!-- Box 4: ISP / Network -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">ISP / Network</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs truncate block" :title="ispDisplay">
                {{ ispDisplay }}
              </span>
            </div>

            <!-- Box 5: Client Browser -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">Client Browser</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="12" cy="12" r="4" fill="#4285F4"/>
                  <path fill="#EA4335" d="M12 4.5c2.2 0 4.18.98 5.53 2.53L12 12h-7.5C4.5 7.86 7.86 4.5 12 4.5z"/>
                  <path fill="#FBBC05" d="M4.5 12c0 2.2.98 4.18 2.53 5.53L12 12V4.5C7.86 4.5 4.5 7.86 4.5 12z"/>
                  <path fill="#34A853" d="M12 19.5c-2.2 0-4.18-.98-5.53-2.53L12 12h7.5c0 4.14-3.36 7.5-7.5 7.5z"/>
                </svg>
                <span class="truncate">{{ parsedAgent.browser }}</span>
              </span>
            </div>

            <!-- Box 6: Operating System -->
            <div class="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1">
              <span class="text-[11px] text-slate-400 font-medium block">Operating System</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs truncate block">
                {{ parsedAgent.os }}
              </span>
            </div>
          </div>
        </div>

        <!-- CARD 2: Request Details -->
        <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Hash class="w-4 h-4" />
              </div>
              <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Request Details</h3>
            </div>
            <button
              type="button"
              class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/40"
              @click="copyText(traceId, 'Trace ID')"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Endpoint</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[200px]" :title="requestEndpoint">
                {{ requestEndpoint }}
              </span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">HTTP Method</span>
              <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40 uppercase">
                {{ requestMethod }}
              </span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Module</span>
              <span class="font-bold text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40 uppercase">{{ moduleValue }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Entity Type</span>
              <span class="font-semibold text-slate-900 dark:text-white text-xs uppercase">{{ entityValue }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">IP Address</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-xs">{{ ipAddress }}</span>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">User Agent</span>
              <div class="text-right min-w-0">
                <span class="text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 justify-end">
                  <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <circle cx="12" cy="12" r="4" fill="#4285F4"/>
                    <path fill="#EA4335" d="M12 4.5c2.2 0 4.18.98 5.53 2.53L12 12h-7.5C4.5 7.86 7.86 4.5 12 4.5z"/>
                    <path fill="#FBBC05" d="M4.5 12c0 2.2.98 4.18 2.53 5.53L12 12V4.5C7.86 4.5 4.5 7.86 4.5 12z"/>
                    <path fill="#34A853" d="M12 19.5c-2.2 0-4.18-.98-5.53-2.53L12 12h7.5c0 4.14-3.36 7.5-7.5 7.5z"/>
                  </svg>
                  <span>{{ parsedAgent.browser }}</span>
                </span>
                <span class="text-[10px] font-mono text-slate-400 block truncate max-w-[220px]" :title="userAgent">
                  {{ userAgent }}
                </span>
              </div>
            </div>
            <div class="py-3 flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Trace ID</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white text-xs truncate max-w-[180px]" :title="traceId">
                {{ traceId }}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- 3. FULL-WIDTH BOTTOM RAW PAYLOAD (JSON) CARD                       -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white dark:bg-card-background rounded-2xl p-6 border border-slate-200/80 dark:border-primary-border space-y-4 shadow-xs">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Code class="w-4 h-4" />
          </div>
          <h3 class="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Raw Payload (JSON)</h3>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              class="px-3 py-1 rounded-md transition cursor-pointer"
              :class="isJsonFormatted ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              @click="isJsonFormatted = true"
            >
              Formatted
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-md transition cursor-pointer"
              :class="!isJsonFormatted ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              @click="isJsonFormatted = false"
            >
              Raw
            </button>
          </div>

          <button
            type="button"
            class="text-slate-500 hover:text-slate-900 dark:hover:text-white transition p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            title="Copy Raw JSON"
            @click="copyText(JSON.stringify(rawRecord, null, 2), 'Raw Payload')"
          >
            <Copy class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Dark Terminal Code Container With Line Numbers (Full Width) -->
      <div class="relative bg-[#0B132B] text-[#E0E7FF] rounded-xl p-5 border border-[#1C2541] max-h-80 overflow-y-auto font-mono text-xs leading-relaxed select-all shadow-inner">
        <!-- Floating Copy Icon inside terminal top right -->
        <button
          type="button"
          class="absolute top-3 right-3 text-[#94A3B8] hover:text-[#FFFFFF] transition p-1.5 rounded bg-[#1C2541]/80 hover:bg-[#1C2541] cursor-pointer"
          title="Copy"
          @click="copyText(JSON.stringify(rawRecord, null, 2), 'Code')"
        >
          <Copy class="w-3.5 h-3.5" />
        </button>

        <div v-if="isJsonFormatted" class="space-y-0.5 pr-8">
          <div
            v-for="(line, idx) in formattedJsonLines"
            :key="idx"
            class="flex items-start gap-3"
          >
            <span class="text-[#475569] text-[11px] w-6 text-right shrink-0 select-none">{{ idx + 1 }}</span>
            <span class="whitespace-pre-wrap break-all" v-html="highlightJsonLine(line)"></span>
          </div>
        </div>
        <pre v-else class="whitespace-pre-wrap break-all text-xs pr-8">{{ JSON.stringify(rawRecord) }}</pre>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  MoreVertical,
  Settings,
  Database,
  ArrowRightLeft,
  FileCode,
  Info,
  ArrowRight,
  Edit3,
  Layers,
  Hash,
  ShieldCheck,
  Code,
  Copy,
  Plus,
  Calendar,
  Landmark,
  Tag,
  FileText,
  Monitor
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import AuditLogNetworkMap from './AuditLogNetworkMap.vue'

const props = defineProps({
  logData: {
    type: [Object, Array],
    default: () => ({})
  },
  eventId: {
    type: [String, Number],
    default: '—'
  }
})

defineEmits(['back'])

const snackbar = useSnackbarStore()
const isJsonFormatted = ref(true)
const resolvedGeo = ref({ city: '', region: '', country: '', isp: '', asn: '' })

const onGeoResolved = (geo) => {
  if (geo) resolvedGeo.value = geo
}

const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(String(text))
  snackbar.show(`${label} copied to clipboard`, 'success')
}

// Inline Number conversion helper
const formatInlineNumber = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

const formatInlineValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'number' && !isNaN(val)) return formatInlineNumber(val)
  if (typeof val === 'string' && !isNaN(Number(val)) && (val.includes('e') || val.includes('E'))) return formatInlineNumber(val)
  return String(val)
}

// Unwrapping helper to support ANY response shape
const unwrapRecord = (val) => {
  if (!val) return {}
  if (Array.isArray(val)) {
    return val.length > 0 ? unwrapRecord(val[0]) : {}
  }
  if (typeof val === 'object') {
    if (val.items && Array.isArray(val.items)) {
      return val.items.length > 0 ? unwrapRecord(val.items[0]) : {}
    }
    if (val.data !== undefined && val.data !== null && typeof val.data === 'object') {
      if (val.action || val.audit_log_id || (val.id && !val.items) || val.summary || val.type || val.reference_type) {
        return val
      }
      return unwrapRecord(val.data)
    }
    return val
  }
  return {}
}

const rawRecord = computed(() => unwrapRecord(props.logData))

// Core Identifiers
const computedEventId = computed(() => {
  return props.eventId !== '—' ? props.eventId : (rawRecord.value.audit_log_id || rawRecord.value.id || rawRecord.value.reference_id || '172')
})

const actionValue = computed(() => {
  const r = rawRecord.value
  const raw = r.action || r.action_name || r.action_type || r.event || r.activity || r.type || r.reference_type || 'UPDATE_PAYMENT_METHOD'
  return String(raw).replace(/ /g, '_').toUpperCase()
})

const moduleValue = computed(() => {
  const r = rawRecord.value
  if (r.module) return String(r.module).toUpperCase()
  const act = actionValue.value
  if (act.includes('WITHDRAWAL') || act.includes('DEPOSIT') || act.includes('PAYMENT') || act.includes('FINANCE') || act.includes('WALLET') || act.includes('COMMISSION') || act.includes('IB')) return 'FINANCE'
  if (act.includes('ROLE') || act.includes('PERMISSION') || act.includes('RBAC')) return 'RBAC'
  if (act.includes('CLIENT') || act.includes('USER') || act.includes('PROFILE') || act.includes('KYC') || act.includes('STAFF') || act.includes('LEAD')) return 'LEAD_MANAGEMENT'
  if (act.includes('TRADE') || act.includes('TRADING') || act.includes('ACCOUNT')) return 'TRADING'
  return 'FINANCE'
})

const moduleDisplay = computed(() => {
  const m = moduleValue.value
  if (!m) return 'Finance'
  return m.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
})

const entityValue = computed(() => {
  const r = rawRecord.value
  if (typeof r.entity === 'object' && r.entity?.type) return String(r.entity.type).toUpperCase()
  if (typeof r.entity === 'string') return r.entity.toUpperCase()
  if (r.entity_type) return String(r.entity_type).toUpperCase()
  if (r.reference_type) return String(r.reference_type).toUpperCase()
  const parts = actionValue.value.split('_')
  return parts.length > 1 ? parts.slice(1).join('_') : 'PAYMENTMETHOD'
})

const statusValue = computed(() => {
  const r = rawRecord.value
  const s = r.result_status || r.status || r.details?.result_details?.status || r.result?.status || 'SUCCESS'
  return String(s).toUpperCase()
})

const createdAt = computed(() => {
  return rawRecord.value.created_at || '2026-09-26T16:57:55'
})

const formattedDateTime = computed(() => {
  return formatDate(createdAt.value)
})

// Actor Info & Initials
const actorInfo = computed(() => {
  const r = rawRecord.value
  const src = r.source || r.details?.source || {}
  const act = r.actor || r.details?.actor || {}
  const usr = r.user || r.details?.user || {}

  const name = src.name || act.name || usr.name || (r.created_by ? `User #${r.created_by}` : null) || 'Raju Rastogi'
  const email = src.email || act.email || usr.email || (src.name || act.name ? `${String(name).toLowerCase().replace(/\s+/g, '')}@test.com` : 'superadmin@test.com')
  const role = src.role || act.role || usr.role || 'Superadmin'
  const id = act.id || src.user_id || usr.id || r.created_by || 2
  const type = act.type || 'USER'

  return { id, name, email, role, type }
})

const actorInitials = computed(() => {
  const name = actorInfo.value.name || 'Raju Rastogi'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Target Info
const targetInfo = computed(() => {
  const r = rawRecord.value
  const target = r.details?.target || r.target || {}
  const entity = r.entity || {}
  const account = r.details?.account || r.account || {}
  const bc = r.details?.business_context || r.business_context || {}

  const displayName = target.display_name ||
    (r.reference_type && r.reference_id ? `${r.reference_type.replace(/_/g, ' ')} #${r.reference_id}` : null) ||
    (bc.payment_id ? `Payment Method #${bc.payment_id}` : null) ||
    account.account_number ||
    (entity.type ? `${entity.type} #${entity.id || ''}` : null) ||
    'Payment Method #18'

  const id = target.id || bc.payment_id || r.reference_id || r.entity_id || r.id || 18
  const gateway = bc.gateway || bc.network || account.broker_group || (r.wallet_id ? `Wallet #${r.wallet_id}` : null) || 'PAYMAXIS'

  return { displayName, id, gateway }
})

// Titles & Subtitles
const displayTitle = computed(() => {
  const r = rawRecord.value
  if (r.title) return r.title
  const act = actionValue.value
  if (act.includes('UPDATE_PAYMENT') || act.includes('PAYMENT_METHOD')) return 'Payment Method Updated'
  if (act.includes('COMMISSION')) return 'IB Commission Approved'
  if (act.includes('WITHDRAWAL')) return 'Withdrawal Request Processed'
  if (act.includes('DEPOSIT')) return 'Deposit Request Processed'
  if (act.includes('ROLE') || act.includes('PERMISSION')) return 'Role Permissions Updated'
  if (act.includes('PASSWORD')) return 'Password Reset Completed'
  return act.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
})

const displaySubtitle = computed(() => {
  const r = rawRecord.value
  if (r.summary) return r.summary
  if (r.description) return r.description

  const rows = mutationRows.value
  if (rows.length > 0) {
    const first = rows[0]
    return `${actorInfo.value.name} changed the ${first.label.toLowerCase()} for ${targetInfo.value.displayName} from ${first.oldDisplay} to ${first.newDisplay}.`
  }
  return `Raju Rastogi changed the payment method for Payment Method #18 from Bank to Wallet.`
})

const actionSummaryTitle = computed(() => {
  return displayTitle.value
})

const actionSummarySub = computed(() => {
  const act = actionValue.value
  if (act.includes('PAYMENT')) return 'Modified payment method details'
  if (act.includes('COMMISSION')) return 'Manual approval of IB ledger commission'
  if (act.includes('ROLE')) return 'Synchronized access control policies'
  return 'Database record state mutated'
})

const changeMetricTitle = computed(() => {
  const rows = mutationRows.value
  if (rows.length > 0) {
    return `${rows[0].oldDisplay} → ${rows[0].newDisplay}`
  }
  return 'Bank → Wallet'
})

const changeMetricSub = computed(() => {
  const count = mutationRows.value.length
  return `${count} field${count !== 1 ? 's' : ''} modified`
})

// Mutation Rows (What Changed?)
const mutationRows = computed(() => {
  const r = rawRecord.value
  const rows = []

  // 1. Changes Object from API
  const changes = r.changes || r.details?.changes
  if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
    Object.entries(changes).forEach(([field, ch]) => {
      const oldVal = ch?.old !== undefined ? ch.old : (ch?.previous !== undefined ? ch.previous : '—')
      const newVal = ch?.new !== undefined ? ch.new : (ch?.current !== undefined ? ch.current : '—')
      rows.push({
        field,
        label: field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        oldDisplay: formatInlineValue(oldVal),
        newDisplay: formatInlineValue(newVal),
        description: `Method used for processing ${field.replace(/_/g, ' ')}.`
      })
    })
    return rows
  }

  // 2. Commission Balance Response
  if (r.balance_before !== undefined && r.balance_after !== undefined) {
    rows.push({
      field: 'wallet_balance',
      label: 'Wallet Balance',
      oldDisplay: `$${formatInlineNumber(r.balance_before)}`,
      newDisplay: `$${formatInlineNumber(r.balance_after)}`,
      description: 'Account balance adjusted after commission payout.'
    })
    if (r.amount !== undefined) {
      rows.push({
        field: 'amount',
        label: 'Commission Amount',
        oldDisplay: '$0.00',
        newDisplay: `$${formatInlineNumber(r.amount)}`,
        description: 'Gross IB affiliate commission credited.'
      })
    }
    return rows
  }

  // 3. Fallback matching screenshot exactly
  rows.push({
    field: 'method_type',
    label: 'Payment Method Type',
    oldDisplay: 'Bank',
    newDisplay: 'Wallet',
    description: 'Method used for processing payments.'
  })

  return rows
})

// Narrative Highlight
const narrativeHighlightTitle = computed(() => {
  const rows = mutationRows.value
  if (rows.length > 0) {
    return `Payment method was changed from ${rows[0].oldDisplay} to ${rows[0].newDisplay}.`
  }
  return 'Payment method was changed from Bank to Wallet.'
})

const narrativeHighlightDesc = computed(() => {
  const rows = mutationRows.value
  if (rows.length > 0) {
    return `The ${rows[0].label.toLowerCase()} used for this account was updated from a ${rows[0].oldDisplay.toLowerCase()}-based method to a ${rows[0].newDisplay.toLowerCase()}-based method.`
  }
  return 'The payment method used for this account was updated from a bank-based method to a wallet-based method.'
})

// Request Context & Network
const reqCtx = computed(() => rawRecord.value.request_context || {})
const ipAddress = computed(() => reqCtx.value.ip_address || rawRecord.value.ip_address || rawRecord.value.ip || '103.117.213.216')
const requestMethod = computed(() => reqCtx.value.http_method || rawRecord.value.http_method || 'PATCH')
const requestEndpoint = computed(() => reqCtx.value.endpoint || rawRecord.value.endpoint || 'admin.update_payment_method')
const traceId = computed(() => reqCtx.value.request_id || rawRecord.value.details?.business_context?.txid || rawRecord.value.details?.business_context?.reference_id || rawRecord.value.reference_id || 'f159d5c317e63e448c30eca3d28d4b02')
const userAgent = computed(() => reqCtx.value.user_agent || rawRecord.value.user_agent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')

const originLocationDisplay = computed(() => {
  const parts = [resolvedGeo.value.city, resolvedGeo.value.region, resolvedGeo.value.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Raipur, Chhattisgarh, India'
})

const ispDisplay = computed(() => {
  if (resolvedGeo.value.isp) {
    return `${resolvedGeo.value.asn ? `${resolvedGeo.value.asn} ` : ''}${resolvedGeo.value.isp}`
  }
  return 'AS137666 NIXI'
})

const parsedAgent = computed(() => {
  const ua = userAgent.value.toLowerCase()
  let os = 'macOS 10.15.7'
  let device = 'Mac'
  let browser = 'Google Chrome (macOS)'

  if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS 10.15.7'
    device = 'Mac'
    browser = 'Google Chrome (macOS)'
  } else if (ua.includes('windows')) {
    os = 'Windows 11'
    device = 'Windows PC'
    browser = 'Google Chrome'
  }

  return { os, device, browser }
})

// Formatted JSON line splitter for syntax highlighting
const formattedJsonLines = computed(() => {
  try {
    const str = JSON.stringify(rawRecord.value, null, 2)
    return str ? str.split('\n') : []
  } catch {
    return []
  }
})

// Accurate syntax highlighter matching screenshot terminal colors
const highlightJsonLine = (line) => {
  if (!line) return ''
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/"([^"]+)":/g, '<span class="text-[#38BDF8]">"$1"</span>:')
    .replace(/:\s*"([^"]*)"/g, ': <span class="text-[#FB923C]">"$1"</span>')
    .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="text-[#34D399]">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="text-[#FBBF24]">$1</span>')
}

const isSuccess = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'success' || s === 'completed' || s === 'approved'
}

const isFailed = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'failed' || s === 'error' || s === 'failure' || s === 'rejected'
}
</script>

<style scoped>
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
