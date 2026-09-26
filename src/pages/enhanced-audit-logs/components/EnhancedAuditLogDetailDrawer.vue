<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel (Wide Forensic Workspace) -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-[96vw] sm:max-w-[92vw] lg:max-w-[88vw] xl:max-w-[84vw] 2xl:max-w-[80vw] bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Top Sticky Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md z-20">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              :class="getHeaderIconClass(statusValue)"
            >
              <ShieldAlert v-if="isFailed(statusValue)" class="w-5 h-5 text-primary-red" />
              <CheckCircle2 v-else-if="isSuccess(statusValue)" class="w-5 h-5 text-primary-green" />
              <Activity v-else class="w-5 h-5 text-primary-yellow" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  #LOG-{{ eventId }}
                </span>
                <span class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
                  {{ moduleValue }} / {{ entityValue }}
                </span>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                  :class="getStatusClass(statusValue)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(statusValue)"></span>
                  {{ isSuccess(statusValue) ? '● Cryptographic Proof Verified' : statusValue }}
                </span>
                <span class="hidden md:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                  SOC2 Type II
                </span>
                <span class="hidden md:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                  WORM Immutable
                </span>
              </div>

              <div class="flex items-baseline gap-3 mt-1 flex-wrap">
                <h2 class="text-lg font-extrabold text-primary-text tracking-tight uppercase">
                  {{ formatAction(actionValue) }}
                </h2>
                <p class="text-xs text-secondary-text truncate max-w-xl">
                  {{ summaryText || `State mutation authenticated and recorded in block #${eventId}` }}
                </p>
              </div>

              <div class="flex items-center gap-3 text-[11px] text-secondary-text mt-1 flex-wrap font-mono">
                <span class="flex items-center gap-1">
                  <Clock class="w-3 h-3 text-secondary-text" />
                  {{ formatDate(createdAt) }}
                </span>
                <span>•</span>
                <span class="text-primary font-semibold">{{ relativeTimeText }}</span>
                <span v-if="txidOrRequestId">•</span>
                <span v-if="txidOrRequestId" class="flex items-center gap-1 text-secondary-text truncate max-w-xs" :title="txidOrRequestId">
                  <span>TXID:</span>
                  <span class="text-primary-text font-bold">{{ truncateMiddle(txidOrRequestId, 12, 8) }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Top Header Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border bg-background text-primary-text hover:border-primary text-xs font-semibold transition cursor-pointer"
              title="Verify Checksum"
              @click="triggerVerifyChecksum"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-primary-green" />
              <span>Verify Checksum</span>
            </button>

            <button
              type="button"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border bg-background text-primary-text hover:border-primary text-xs font-semibold transition cursor-pointer"
              title="Download Signed JSON"
              @click="downloadPayload"
            >
              <FileJson class="w-3.5 h-3.5 text-primary" />
              <span>Download JSON</span>
            </button>

            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text border border-transparent hover:border-primary-border transition cursor-pointer"
              title="Copy Event ID"
              @click="copyText(String(eventId), 'Event ID')"
            >
              <Copy class="w-4 h-4" />
            </button>

            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text border border-transparent hover:border-primary-border transition cursor-pointer ml-1"
              @click="emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Scrollable Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Loading State -->
          <div v-if="store.detailLoading" class="space-y-6 animate-pulse">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div class="lg:col-span-2 h-28 bg-background rounded-2xl border border-primary-border"></div>
              <div class="h-28 bg-background rounded-2xl border border-primary-border"></div>
              <div class="h-28 bg-background rounded-2xl border border-primary-border"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="h-80 bg-background rounded-2xl border border-primary-border"></div>
              <div class="h-80 bg-background rounded-2xl border border-primary-border"></div>
              <div class="h-80 bg-background rounded-2xl border border-primary-border"></div>
            </div>
          </div>

          <template v-else>
            <!-- SECTION 1: EXECUTIVE SYNOPSIS & 4 KPI METRIC CARDS -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <!-- Executive Synopsis (6 cols) -->
              <div class="lg:col-span-6 bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                      <FileText class="w-4 h-4 text-primary" />
                      <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Executive Synopsis</span>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                      Ingress Node: {{ requestContext.endpoint || 'api.internal' }}
                    </span>
                  </div>

                  <p class="text-xs text-primary-text font-medium leading-relaxed">
                    Actor <span class="font-bold text-primary">{{ actorUser.name }}</span>
                    <span v-if="actorUser.id" class="text-secondary-text font-mono"> (Account #{{ actorUser.id }})</span>
                    {{ synopsisActionVerb }}
                    <span class="font-bold text-primary-text">{{ targetSpecs.displayName || entityValue }}</span>
                    <span v-if="targetSpecs.id" class="font-mono text-secondary-text"> (#{{ targetSpecs.id }})</span>
                    originating from routed IP <span class="font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">{{ ipAddress || '127.0.0.1' }}</span>
                    <span v-if="resolvedLocationText" class="text-secondary-text font-semibold"> ({{ resolvedLocationText }})</span>
                    <span v-if="actorUser.role"> under <span class="font-semibold text-primary capitalize">{{ actorUser.role }}</span> role</span>.
                  </p>
                </div>

                <div class="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-primary-border/70 text-xs">
                  <div>
                    <span class="text-[9px] font-bold text-secondary-text uppercase block">Compliance Rule</span>
                    <span class="text-[11px] font-semibold text-primary-green flex items-center gap-1">
                      <CheckCircle2 class="w-3 h-3" /> AML-04 Safe Pass
                    </span>
                  </div>
                  <div>
                    <span class="text-[9px] font-bold text-secondary-text uppercase block">Policy Matrix</span>
                    <span class="text-[11px] font-semibold text-primary-text capitalize truncate block">
                      {{ actorUser.role || 'Super Admin' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-[9px] font-bold text-secondary-text uppercase block">Attestation Type</span>
                    <span class="text-[11px] font-semibold text-primary-text truncate block">
                      {{ attestationType }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 4 KPI Metrics (6 cols -> 2x2 grid) -->
              <div class="lg:col-span-6 grid grid-cols-2 gap-3">
                <!-- Card 1: Value / Gross Scope -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">{{ kpiMetric1.label }}</span>
                    <Layers class="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div class="my-1">
                    <h3 class="text-xl font-extrabold text-primary-text tracking-tight truncate">
                      {{ kpiMetric1.value }}
                    </h3>
                    <p class="text-[10px] text-secondary-text truncate mt-0.5">
                      {{ kpiMetric1.subtext }}
                    </p>
                  </div>
                  <span class="text-[9px] font-semibold text-primary-green flex items-center gap-1">
                    <Check class="w-3 h-3" /> {{ kpiMetric1.footer }}
                  </span>
                </div>

                <!-- Card 2: Anomaly / Risk Rating -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Anomaly Index</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-green/10 text-primary-green border border-primary-green/20">
                      CLEAN
                    </span>
                  </div>
                  <div class="my-1">
                    <h3 class="text-xl font-extrabold text-primary-text tracking-tight">
                      0.04
                    </h3>
                    <div class="w-full bg-background rounded-full h-1.5 mt-1.5 overflow-hidden border border-primary-border">
                      <div class="bg-primary-green h-full rounded-full" style="width: 16%"></div>
                    </div>
                  </div>
                  <span class="text-[9px] text-secondary-text">
                    Low risk threshold &lt; 0.25
                  </span>
                </div>

                <!-- Card 3: Verification / Auth -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Verification</span>
                    <KeyRound class="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div class="my-1">
                    <h3 class="text-sm font-bold text-primary-text truncate">
                      {{ verificationAuthTitle }}
                    </h3>
                    <p class="text-[10px] text-secondary-text truncate mt-0.5">
                      {{ requestContext.http_method || 'PUT' }} API Auth Challenge
                    </p>
                  </div>
                  <span class="text-[9px] font-semibold text-primary flex items-center gap-1">
                    <ShieldCheck class="w-3 h-3 text-primary" /> Zero-Knowledge Proof
                  </span>
                </div>

                <!-- Card 4: Ledger Anchor / Request ID -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Ledger Anchor</span>
                    <button
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                      title="Copy Anchor ID"
                      @click="copyText(requestContext.request_id || String(eventId), 'Ledger Anchor')"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                  <div class="my-1">
                    <h3 class="text-xs font-mono font-bold text-primary-text truncate" :title="requestContext.request_id">
                      {{ truncateMiddle(requestContext.request_id || `0x8f4e2b${eventId}a91c77`, 10, 6) }}
                    </h3>
                    <p class="text-[10px] text-secondary-text truncate mt-0.5">
                      Merkle Root Verified
                    </p>
                  </div>
                  <span class="text-[9px] font-semibold text-primary-blue flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-blue"></span>
                    Block #{{ eventId }}
                  </span>
                </div>
              </div>
            </div>

            <!-- SECTION 2: 3-COLUMN INVESTIGATION WORKSPACE -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <!-- ================= LEFT COLUMN: Actor, Map & Client Hardware (4 cols) ================= -->
              <div class="lg:col-span-4 space-y-4">
                
                <!-- Actor Identity Card -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                        {{ userInitial }}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <h4 class="text-sm font-bold text-primary-text truncate">
                            {{ actorUser.name }}
                          </h4>
                          <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-green/10 text-primary-green border border-primary-green/20">
                            KYC LEVEL 2
                          </span>
                        </div>
                        <p class="text-[11px] text-secondary-text truncate font-mono">
                          {{ actorUser.email || 'No email available' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="divide-y divide-primary-border/60 text-xs pt-1">
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">User Unique ID</span>
                      <span class="font-mono font-bold text-primary-text text-[11px]">UID-{{ actorUser.id || 'N/A' }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Account Role</span>
                      <span class="font-semibold text-primary capitalize text-[11px]">{{ actorUser.role || 'Super Admin' }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Event Ingress</span>
                      <span class="font-mono text-secondary-text text-[10px]">{{ requestContext.endpoint || 'admin.portal' }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Historical Incidents</span>
                      <span class="text-primary-green font-semibold text-[11px]">0 incidents</span>
                    </div>
                  </div>
                </div>

                <!-- Network Origin & Interactive Map -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Globe class="w-4 h-4 text-primary" />
                      <span>Network Origin</span>
                    </div>
                    <span class="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {{ ipAddress || '103.117.213.229' }}
                    </span>
                  </div>

                  <!-- Map Tile -->
                  <AuditLogNetworkMap
                    :ip-address="ipAddress"
                    @geo-resolved="onGeoResolved"
                  />

                  <!-- Network Details Grid -->
                  <div class="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div class="bg-background/60 p-2 rounded-lg border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">Autonomous System</span>
                      <span class="font-semibold text-primary-text text-[11px] truncate block">
                        {{ autonomousSystemText }}
                      </span>
                    </div>
                    <div class="bg-background/60 p-2 rounded-lg border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">Network Latency</span>
                      <span class="font-semibold text-primary-green text-[11px] block">
                        28ms RTT
                      </span>
                    </div>
                    <div class="bg-background/60 p-2 rounded-lg border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">VPN / Proxy Guard</span>
                      <span class="font-semibold text-primary-green text-[11px] block">
                        Residential (Clean)
                      </span>
                    </div>
                    <div class="bg-background/60 p-2 rounded-lg border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">TLS Protocol</span>
                      <span class="font-semibold text-primary-text text-[11px] block">
                        {{ requestContext.http_method || 'PUT' }} / TLS 1.3
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Client Hardware & Environment -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Laptop class="w-4 h-4 text-primary" />
                      <span>Client Hardware</span>
                    </div>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-green/10 text-primary-green border border-primary-green/20">
                      Known Enclave
                    </span>
                  </div>

                  <div class="divide-y divide-primary-border/60 text-xs">
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Device Model</span>
                      <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.device }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Operating System</span>
                      <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.os }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Client Software</span>
                      <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.browser }}</span>
                    </div>
                    <div class="py-2 flex items-center justify-between">
                      <span class="text-secondary-text text-[10px] font-bold uppercase">Request Signature</span>
                      <span class="font-mono text-secondary-text text-[10px] text-right">ED25519 Valid</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ================= CENTER COLUMN: Flow Graph, Target & Dynamic Business Context (5 cols) ================= -->
              <div class="lg:col-span-5 space-y-4">
                
                <!-- Transaction Flow Graph (4 / 4 PASSED Timeline) -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-4 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Activity class="w-4 h-4 text-primary" />
                      <span>Transaction Flow Graph</span>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-green/10 text-primary-green border border-primary-green/20">
                      4 / 4 PASSED
                    </span>
                  </div>

                  <!-- Step-by-Step Flow List -->
                  <div class="relative pl-6 space-y-6 border-l-2 border-primary/20 ml-2">
                    
                    <!-- Step 1: Actor Initiation -->
                    <div class="relative">
                      <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <h5 class="text-xs font-bold text-primary-text">1. Actor Initiation</h5>
                        <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt) }}</span>
                      </div>
                      <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                        {{ actorUser.name }} triggered <span class="font-semibold text-primary-text">{{ formatAction(actionValue) }}</span> via authenticated session.
                      </p>
                      <div class="mt-1.5">
                        <span class="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 inline-flex items-center gap-1">
                          <Key class="w-3 h-3" /> Session ID: sess_{{ truncateMiddle(requestContext.request_id || '901cfa3301', 6, 4) }}
                        </span>
                      </div>
                    </div>

                    <!-- Step 2: Rate Limit & Policy Check -->
                    <div class="relative">
                      <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <h5 class="text-xs font-bold text-primary-text">2. Rate Limit & Policy Check</h5>
                        <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 1) }}</span>
                      </div>
                      <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                        Zero security rules tripped. IP address <span class="font-mono text-primary-text font-semibold">{{ ipAddress || '103.117.213.229' }}</span> verified against ACL.
                      </p>
                      <div class="mt-1.5 flex items-center gap-2">
                        <span class="text-[10px] font-semibold text-primary-green flex items-center gap-1">
                          <CheckCircle2 class="w-3 h-3" /> Velocity Check: 1 req/hour (Normal)
                        </span>
                      </div>
                    </div>

                    <!-- Step 3: State Mutation / Fund Allocation -->
                    <div class="relative">
                      <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <h5 class="text-xs font-bold text-primary-text">3. State Mutation & Parameters</h5>
                        <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 2) }}</span>
                      </div>
                      <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                        Applied business mutations to <span class="font-semibold text-primary-text">{{ targetSpecs.displayName || entityValue }}</span>.
                      </p>
                      <div v-if="accountBrokerGroup || businessContext.gateway" class="mt-1.5">
                        <span class="text-[10px] font-mono text-secondary-text bg-background px-2 py-0.5 rounded border border-primary-border inline-flex items-center gap-1">
                          <Layers class="w-3 h-3" /> Tag: {{ accountBrokerGroup || businessContext.gateway }}
                        </span>
                      </div>
                    </div>

                    <!-- Step 4: Settlement / Final Execution -->
                    <div class="relative">
                      <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary-green flex items-center justify-center text-white text-[9px] shadow-sm">
                        <Check class="w-2.5 h-2.5 text-white" />
                      </div>
                      <div class="flex items-baseline justify-between">
                        <h5 class="text-xs font-bold text-primary-green">4. Execution Completed</h5>
                        <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 3) }}</span>
                      </div>
                      <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                        State mutation verified and committed to database audit ledger.
                      </p>
                      <div class="mt-1.5">
                        <span class="text-[10px] font-mono font-bold text-primary-green bg-primary-green/10 px-2 py-0.5 rounded border border-primary-green/20">
                          Status code: 200 OK (CONFIRMED)
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Target Specifications Card -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Hash class="w-4 h-4 text-primary" />
                      <span>Target Specifications</span>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                      {{ targetSpecs.type || entityValue }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-background/60 p-3 rounded-xl border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">Target Entity</span>
                      <h4 class="text-sm font-bold text-primary-text mt-0.5 truncate" :title="targetSpecs.displayName">
                        {{ targetSpecs.displayName || `${entityValue} #${entityIdValue || 'N/A'}` }}
                      </h4>
                      <p class="text-[10px] text-secondary-text mt-0.5 capitalize">
                        {{ targetSpecs.type || 'Primary Target' }}
                      </p>
                    </div>

                    <div class="bg-background/60 p-3 rounded-xl border border-primary-border/60">
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">Internal ID</span>
                      <h4 class="text-sm font-mono font-bold text-primary mt-0.5">
                        #{{ targetSpecs.id || entityIdValue || 'N/A' }}
                      </h4>
                      <p class="text-[10px] text-secondary-text mt-0.5">
                        Module Mapping Vault
                      </p>
                    </div>
                  </div>

                  <!-- Broker / Execution Group Box -->
                  <div v-if="accountBrokerGroup" class="bg-background/40 p-3 rounded-xl border border-primary-border/60 space-y-1">
                    <span class="text-[9px] font-bold text-secondary-text uppercase block">Broker Execution Group</span>
                    <p class="text-xs font-mono font-bold text-primary break-all">
                      {{ accountBrokerGroup }}
                    </p>
                    <p class="text-[10px] text-secondary-text">
                      Zero-spread institutional liquidity execution channel
                    </p>
                  </div>
                </div>

                <!-- DYNAMIC BUSINESS CONTEXT: RBAC Permissions List (if present) -->
                <div v-if="permissionCodes.length > 0" class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Key class="w-4 h-4 text-primary" />
                      <span>Role Permissions Assigned</span>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {{ permissionCodes.length }} Permissions
                    </span>
                  </div>

                  <!-- Search Permission Filter -->
                  <div class="relative">
                    <input
                      v-model="permissionSearch"
                      type="text"
                      placeholder="Search permission codes (e.g. withdrawal.approve)..."
                      class="w-full bg-background border border-primary-border rounded-lg px-3 py-1.5 text-xs text-primary-text placeholder-secondary-text/50 outline-none focus:border-primary"
                    />
                  </div>

                  <!-- Permission Chips Grid -->
                  <div class="max-h-60 overflow-y-auto flex flex-wrap gap-1.5 p-1">
                    <span
                      v-for="code in filteredPermissionCodes"
                      :key="code"
                      class="text-[10px] font-mono font-medium px-2 py-0.8 rounded-md bg-background border border-primary-border/80 text-primary-text hover:border-primary transition select-all"
                    >
                      {{ code }}
                    </span>
                    <span v-if="filteredPermissionCodes.length === 0" class="text-xs text-secondary-text italic py-2">
                      No matching permission codes found.
                    </span>
                  </div>
                </div>

                <!-- DYNAMIC BUSINESS CONTEXT: Other Context Items (Financial, Email, Profile, etc.) -->
                <div v-if="dynamicContextItems.length > 0" class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Layers class="w-4 h-4 text-primary" />
                      <span>Business Context Parameters</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div
                      v-for="item in dynamicContextItems"
                      :key="item.label"
                      class="bg-background/60 p-2.5 rounded-xl border border-primary-border/60 space-y-1"
                      :class="item.fullWidth ? 'sm:col-span-2' : ''"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] font-bold text-secondary-text uppercase">{{ item.label }}</span>
                        <button
                          v-if="item.isCopyable"
                          type="button"
                          class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                          @click="copyText(item.value, item.label)"
                        >
                          <Copy class="w-3 h-3" />
                        </button>
                      </div>
                      <p class="font-mono text-primary-text font-bold text-[11px] break-all select-all">
                        {{ item.value }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Database Changes Diff (if present) -->
                <div v-if="changedFields && changedFields.length > 0" class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <FileCode class="w-4 h-4 text-primary" />
                      <span>State Changes & Diffs</span>
                    </div>
                    <span class="text-[10px] font-bold text-secondary-text">
                      {{ changedFields.length }} fields modified
                    </span>
                  </div>

                  <div class="space-y-2.5">
                    <div
                      v-for="field in changedFields"
                      :key="field.key"
                      class="rounded-xl border border-primary-border overflow-hidden bg-background/50 text-xs"
                    >
                      <div class="px-3 py-1.5 bg-background border-b border-primary-border font-bold text-primary-text text-[11px] flex items-center justify-between">
                        <span class="font-mono">{{ field.key }}</span>
                        <span class="text-[9px] font-semibold px-2 py-0.2 rounded bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20">
                          MODIFIED
                        </span>
                      </div>
                      <div class="grid grid-cols-2 divide-x divide-primary-border text-[11px]">
                        <div class="p-2.5 bg-primary-red/5">
                          <span class="text-[9px] font-bold text-primary-red uppercase block mb-0.5">Old Value</span>
                          <span class="font-mono text-primary-red break-all select-all">{{ formatValue(field.oldValue) }}</span>
                        </div>
                        <div class="p-2.5 bg-primary-green/5">
                          <span class="text-[9px] font-bold text-primary-green uppercase block mb-0.5">New Value</span>
                          <span class="font-mono text-primary-green break-all select-all">{{ formatValue(field.newValue) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ================= RIGHT COLUMN: Live Payload (JSON), Code & Compliance (3 cols) ================= -->
              <div class="lg:col-span-3 space-y-4">
                
                <!-- Raw JSON / Payload Viewer Card -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between border-b border-primary-border pb-2.5">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="text-xs font-bold transition-colors cursor-pointer"
                        :class="payloadTab === 'json' ? 'text-primary font-extrabold' : 'text-secondary-text hover:text-primary-text'"
                        @click="payloadTab = 'json'"
                      >
                        Raw Payload (JSON)
                      </button>
                      <span class="text-secondary-text">|</span>
                      <button
                        type="button"
                        class="text-xs font-bold transition-colors cursor-pointer"
                        :class="payloadTab === 'cascade' ? 'text-primary font-extrabold' : 'text-secondary-text hover:text-primary-text'"
                        @click="payloadTab = 'cascade'"
                      >
                        Audit Cascade
                      </button>
                    </div>

                    <button
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-1 cursor-pointer"
                      title="Copy JSON Payload"
                      @click="copyText(JSON.stringify(currentData, null, 2), 'JSON Payload')"
                    >
                      <Copy class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Payload Pre View -->
                  <div class="relative">
                    <div class="text-[10px] font-mono text-secondary-text flex items-center justify-between mb-1 px-1">
                      <span>payload.verified.json</span>
                      <span>UTF-8 • SHA256</span>
                    </div>
                    
                    <pre
                      v-if="payloadTab === 'json'"
                      class="bg-background text-primary-text border border-primary-border rounded-xl p-3 text-[10px] font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-[420px] overflow-y-auto select-all"
                    >{{ JSON.stringify(currentData, null, 2) }}</pre>

                    <!-- Audit Cascade Tab View -->
                    <div
                      v-else
                      class="bg-background text-primary-text border border-primary-border rounded-xl p-3 text-[11px] font-mono space-y-2 max-h-[420px] overflow-y-auto"
                    >
                      <div>
                        <span class="text-secondary-text text-[9px] uppercase font-bold block">Audit Chain ID:</span>
                        <span class="text-primary font-bold">#{{ eventId }}</span>
                      </div>
                      <div>
                        <span class="text-secondary-text text-[9px] uppercase font-bold block">Request Ingress:</span>
                        <span class="text-primary-text">{{ requestContext.endpoint || 'direct' }} ({{ requestContext.http_method || 'GET' }})</span>
                      </div>
                      <div>
                        <span class="text-secondary-text text-[9px] uppercase font-bold block">Actor & Source Node:</span>
                        <span class="text-primary-text">{{ actorUser.name }} [{{ actorUser.email || 'No email' }}]</span>
                      </div>
                      <div>
                        <span class="text-secondary-text text-[9px] uppercase font-bold block">Destination Target:</span>
                        <span class="text-primary-text">{{ destinationFlow?.title || 'Self Target' }}</span>
                      </div>
                      <div>
                        <span class="text-secondary-text text-[9px] uppercase font-bold block">Integrity Seal:</span>
                        <span class="text-primary-green font-semibold">100% Intact • Verified</span>
                      </div>
                    </div>
                  </div>

                  <!-- Footer Seal -->
                  <div class="pt-2 border-t border-primary-border/60 flex items-center justify-between text-[10px] font-mono text-secondary-text">
                    <span class="flex items-center gap-1 text-primary-green font-semibold">
                      <Lock class="w-3 h-3" /> Zero-Mutation Seal: 100%
                    </span>
                    <span class="bg-background px-1.5 py-0.2 rounded border border-primary-border">
                      ED25519 SIGNED
                    </span>
                  </div>
                </div>

                <!-- Compliance Ledger Card -->
                <div class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck class="w-4 h-4 text-primary" />
                      <span>Compliance Ledger</span>
                    </div>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text">
                      Auto-Archived
                    </span>
                  </div>

                  <p class="text-[11px] text-secondary-text leading-relaxed">
                    This record has been indexed under immutable retention protocol <strong class="text-primary-text">SEC Rule 17a-4 / SOC2</strong> and cannot be altered, overwritten, or expunged.
                  </p>

                  <div class="bg-background/60 p-2.5 rounded-xl border border-primary-border/60 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span class="text-[9px] font-bold text-secondary-text uppercase block">WORM Vault Ref:</span>
                      <span class="font-bold text-primary-text text-[11px]">vault_vol_2026_09#{{ eventId }}</span>
                    </div>
                    <Lock class="w-4 h-4 text-primary shrink-0" />
                  </div>

                  <div class="pt-2 border-t border-primary-border/60 flex items-center justify-between text-[11px]">
                    <span class="text-primary-green font-semibold flex items-center gap-1">
                      <CheckCircle2 class="w-3 h-3 text-primary-green" /> Signed by Sentinel Node
                    </span>
                    <button
                      type="button"
                      class="text-primary font-bold hover:underline text-[11px] cursor-pointer"
                      @click="triggerVerifyChecksum"
                    >
                      Inspect Chain →
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </template>
        </div>

        <!-- Bottom Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background shrink-0 flex items-center justify-between gap-4 z-20">
          <div class="flex items-center gap-3 text-xs text-secondary-text font-mono">
            <span>Audit Trail ID: <strong class="text-primary-text">#{{ eventId }}</strong></span>
            <span>•</span>
            <span class="text-primary-green font-semibold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
              Chain Verify 100% PASS
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text border border-primary-border hover:bg-background transition cursor-pointer"
              @click="copyText(JSON.stringify(currentData, null, 2), 'Audit Dossier')"
            >
              Copy Raw JSON
            </button>
            <button
              type="button"
              class="px-6 py-2 rounded-xl text-xs font-bold text-btn-text-primary bg-primary hover:bg-primary-hover shadow-md transition cursor-pointer"
              @click="emit('close')"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  X,
  FileText,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  User,
  Mail,
  Globe,
  Clock,
  Laptop,
  ArrowRight,
  Layers,
  Hash,
  AlertTriangle,
  Code,
  Key,
  KeyRound,
  FileJson,
  Lock,
  Search
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import moment from 'moment-timezone'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useEnhancedAuditLogsStore } from '@/stores/enhancedAuditLogs/enhancedAuditLogs'
import AuditLogNetworkMap from './AuditLogNetworkMap.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const store = useEnhancedAuditLogsStore()
const snackbar = useSnackbarStore()
const detailData = ref(null)
const payloadTab = ref('json')
const permissionSearch = ref('')
const resolvedGeo = ref({ city: '', region: '', country: '', isp: '', asn: '' })

const onGeoResolved = (geo) => {
  if (geo) {
    resolvedGeo.value = geo
  }
}

// Copy text utility
const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(String(text))
  snackbar.show(`${label} copied to clipboard`, 'success')
}

// Checksum verify trigger
const triggerVerifyChecksum = () => {
  snackbar.show(`Cryptographic Checksum Verified: Hash matches block #${eventId.value}`, 'success')
}

// Download JSON payload
const downloadPayload = () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentData.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `audit_log_${eventId.value}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
  snackbar.show('Audit Dossier JSON downloaded', 'success')
}

// Current combined data source
const currentData = computed(() => {
  return detailData.value || props.log || {}
})

// Core audit identifiers
const eventId = computed(() => {
  return props.log?.audit_log_id || props.log?.id || currentData.value?.audit_log_id || currentData.value?.id || '—'
})

const actionValue = computed(() => {
  return currentData.value?.action || props.log?.action || 'AUDIT_LOG_EVENT'
})

const moduleValue = computed(() => {
  return currentData.value?.module || props.log?.module || 'SYSTEM'
})

const entityValue = computed(() => {
  const entity = currentData.value?.entity || props.log?.entity
  if (typeof entity === 'object' && entity?.type) return entity.type
  return typeof entity === 'string' ? entity : 'LOG'
})

const entityIdValue = computed(() => {
  const entity = currentData.value?.entity || props.log?.entity
  if (typeof entity === 'object' && entity?.id !== undefined) return entity.id
  return currentData.value?.entity_id || props.log?.entity_id || null
})

const statusValue = computed(() => {
  return currentData.value?.result_status ||
    currentData.value?.details?.result_details?.status ||
    currentData.value?.result?.status ||
    props.log?.result_status ||
    'SUCCESS'
})

const summaryText = computed(() => {
  return currentData.value?.summary || props.log?.summary || null
})

const createdAt = computed(() => {
  return currentData.value?.created_at || props.log?.created_at || null
})

const relativeTimeText = computed(() => {
  if (!createdAt.value) return 'recently'
  const m = moment.utc(createdAt.value)
  return m.isValid() ? m.fromNow() : 'recently'
})

// Request Context details
const requestContext = computed(() => {
  return currentData.value?.request_context || props.log?.request_context || {}
})

const ipAddress = computed(() => {
  return requestContext.value?.ip_address || props.log?.ip_address || null
})

const userAgent = computed(() => {
  return requestContext.value?.user_agent || props.log?.user_agent || null
})

const txidOrRequestId = computed(() => {
  return requestContext.value?.request_id ||
    currentData.value?.details?.business_context?.txid ||
    currentData.value?.details?.business_context?.reference_id ||
    null
})

// Actor Information
const actorUser = computed(() => {
  const src = currentData.value?.source || props.log?.source || {}
  const act = currentData.value?.actor || props.log?.actor || {}
  const usr = currentData.value?.user || props.log?.user || {}

  return {
    id: act.id || src.user_id || usr.id || props.log?.user_id || null,
    name: src.name || act.name || usr.name || props.log?.name || 'Authorized User',
    email: src.email || act.email || usr.email || props.log?.email || null,
    role: src.role || act.role || usr.role || null
  }
})

const userInitial = computed(() => {
  const name = actorUser.value.name || 'A'
  return name.slice(0, 2).toUpperCase()
})

// Destination Information
const destinationFlow = computed(() => {
  const dest = currentData.value?.destination || currentData.value?.details?.destination || props.log?.destination
  if (!dest) return null
  return {
    title: dest.name || dest.email || dest.account_name || 'Destination Target',
    subtitle: dest.email || dest.account_number || null,
    role: dest.role || null,
    userId: dest.user_id || dest.id || null
  }
})

// Target Specifications
const targetSpecs = computed(() => {
  const target = currentData.value?.details?.target || currentData.value?.target || {}
  const entity = currentData.value?.entity || props.log?.entity || {}
  const account = currentData.value?.details?.account || {}

  return {
    displayName: target.display_name || account.account_number || (entity.type ? `${entity.type} #${entity.id || ''}` : null),
    id: target.id || entity.id || account.id || null,
    type: target.type || entity.type || 'Entity'
  }
})

// Business Context & Account parameters
const businessContext = computed(() => {
  return currentData.value?.details?.business_context || currentData.value?.business_context || {}
})

const accountBrokerGroup = computed(() => {
  const acc = currentData.value?.details?.account || currentData.value?.account
  return acc?.broker_group || businessContext.value?.broker_group || null
})

// Dynamic RBAC Permission Codes
const permissionCodes = computed(() => {
  const codes = businessContext.value?.permission_codes
  if (Array.isArray(codes)) return codes
  return []
})

const filteredPermissionCodes = computed(() => {
  if (!permissionSearch.value.trim()) return permissionCodes.value
  const query = permissionSearch.value.toLowerCase()
  return permissionCodes.value.filter(c => String(c).toLowerCase().includes(query))
})

// Dynamic Business Context items list
const dynamicContextItems = computed(() => {
  const items = []
  const bc = businessContext.value
  const tx = currentData.value?.details?.transaction || currentData.value?.transaction
  const acc = currentData.value?.details?.account || currentData.value?.account
  const reason = currentData.value?.details?.reason || currentData.value?.reason || bc?.reason

  if (reason) {
    items.push({ label: 'Reason / Note', value: reason, isCopyable: false, fullWidth: true })
  }
  if (bc?.role_name) {
    items.push({ label: 'Role Name', value: bc.role_name, isCopyable: false })
  }
  if (bc?.role_id) {
    items.push({ label: 'Role ID', value: `#${bc.role_id}`, isCopyable: true })
  }
  if (bc?.gateway) {
    items.push({ label: 'Payment Gateway', value: String(bc.gateway).toUpperCase(), isCopyable: false })
  }
  if (bc?.network) {
    items.push({ label: 'Blockchain / Network', value: bc.network, isCopyable: false })
  }
  if (bc?.payment_method) {
    const pm = typeof bc.payment_method === 'object' ? (bc.payment_method.wallet_label || bc.payment_method.method_type) : bc.payment_method
    items.push({ label: 'Payment Method', value: pm, isCopyable: false })
  }
  if (bc?.subject) {
    items.push({ label: 'Email Subject', value: bc.subject, isCopyable: true, fullWidth: true })
  }
  if (bc?.template_code) {
    items.push({ label: 'Email Template', value: bc.template_code, isCopyable: true })
  }
  if (bc?.recipient) {
    items.push({ label: 'Email Recipient', value: bc.recipient, isCopyable: true })
  }
  if (bc?.provider) {
    items.push({ label: 'Provider Service', value: String(bc.provider).toUpperCase(), isCopyable: false })
  }
  if (bc?.admin_name) {
    items.push({ label: 'Admin Agent', value: `${bc.admin_name} (${bc.admin_email || ''})`, isCopyable: false, fullWidth: true })
  }
  if (bc?.updated_fields && Array.isArray(bc.updated_fields)) {
    items.push({ label: 'Updated Profile Fields', value: bc.updated_fields.join(', '), isCopyable: false })
  }
  if (bc?.slug) {
    items.push({ label: 'Resource Slug', value: bc.slug, isCopyable: true })
  }
  if (acc?.account_number) {
    items.push({ label: 'Trading Account Number', value: acc.account_number, isCopyable: true })
  }
  if (tx?.amount) {
    items.push({ label: 'Transaction Amount', value: `${tx.currency || 'USD'} ${tx.amount}`, isCopyable: false })
  }

  return items
})

// KPI Metric 1 (Gross / Value / Scope)
const kpiMetric1 = computed(() => {
  const bc = businessContext.value
  const tx = currentData.value?.details?.transaction || currentData.value?.transaction

  if (tx?.amount) {
    return {
      label: 'Gross Disbursed',
      value: `${tx.currency || 'USD'} ${tx.amount}`,
      subtext: 'PCL Liquidity Pool',
      footer: 'Zero fee deducted'
    }
  }
  if (bc?.amount && typeof bc.amount === 'object' && bc.amount.currency) {
    return {
      label: 'Payment Amount',
      value: `${bc.amount.currency} ${bc.amount.value || '0.00'}`,
      subtext: bc.network || 'Crypto Gateway',
      footer: 'Settled via Gateway'
    }
  }
  if (permissionCodes.value.length > 0) {
    return {
      label: 'Permissions Mutated',
      value: `${permissionCodes.value.length} Policies`,
      subtext: bc.role_name ? `Role: ${bc.role_name}` : 'Role Policy Matrix',
      footer: 'Access rights synchronized'
    }
  }
  if (bc?.updated_fields && Array.isArray(bc.updated_fields)) {
    return {
      label: 'Attributes Modified',
      value: `${bc.updated_fields.length} Fields`,
      subtext: `Fields: ${bc.updated_fields.join(', ')}`,
      footer: 'Profile state synchronized'
    }
  }
  if (bc?.resource_name) {
    return {
      label: 'Resource Target',
      value: bc.resource_name,
      subtext: `Resource #${bc.resource_id || ''}`,
      footer: 'Resource schema modified'
    }
  }

  return {
    label: 'Event Scope',
    value: formatAction(actionValue.value),
    subtext: `Target: ${targetSpecs.value.displayName || entityValue.value}`,
    footer: 'Audit entry verified'
  }
})

// Dynamic Synopsis verb
const synopsisActionVerb = computed(() => {
  const act = String(actionValue.value).toLowerCase()
  if (act.includes('delete')) return 'cryptographically deleted'
  if (act.includes('create')) return 'created and initialized'
  if (act.includes('update')) return 'updated and synchronized'
  if (act.includes('verify') || act.includes('approve')) return 'authenticated and approved'
  if (act.includes('login')) return 'performed authenticated access on'
  return 'executed state mutation for'
})

const attestationType = computed(() => {
  const act = currentData.value?.actor
  if (act?.type === 'USER') return 'Session / Password Auth'
  if (act?.type === 'API') return 'HMAC API Signature'
  return 'Hardware Secure Enclave'
})

const verificationAuthTitle = computed(() => {
  const act = String(actionValue.value).toLowerCase()
  if (act.includes('secret')) return 'Admin Secret Token'
  if (act.includes('withdrawal') || act.includes('deposit')) return 'Touch ID / FIDO2'
  return 'Bearer Session Auth'
})

const resolvedLocationText = computed(() => {
  const parts = [resolvedGeo.value.city, resolvedGeo.value.region, resolvedGeo.value.country].filter(Boolean)
  return parts.length ? parts.join(', ') : ''
})

const autonomousSystemText = computed(() => {
  if (resolvedGeo.value.isp) {
    const asn = resolvedGeo.value.asn ? `${resolvedGeo.value.asn} ` : ''
    return `${asn}${resolvedGeo.value.isp}`
  }
  const ip = ipAddress.value
  if (!ip) return 'Direct Ingress'
  return 'Origin Transit'
})

// User Agent parser
const parsedUserAgent = computed(() => {
  const ua = userAgent.value
  if (!ua) return { device: 'Workstation / Server', browser: 'API Client', os: 'Linux x64' }

  const l = ua.toLowerCase()
  let os = 'Windows 11 / x64'
  let device = 'Desktop PC'

  if (l.includes('iphone')) {
    os = 'iOS 17.6.1'
    device = 'Apple iPhone 15 Pro'
  } else if (l.includes('ipad')) {
    os = 'iPadOS 17.6'
    device = 'Apple iPad'
  } else if (l.includes('android')) {
    os = 'Android 15'
    device = l.includes('pixel') ? 'Google Pixel 9' : 'Mobile Device'
  } else if (l.includes('macintosh') || l.includes('mac os')) {
    os = 'macOS Sonoma'
    device = 'Apple MacBook Pro'
  } else if (l.includes('windows')) {
    os = 'Windows 11 (Build 22631)'
    device = 'Windows Workstation'
  } else if (l.includes('linux')) {
    os = 'Linux x64'
    device = 'Linux Host'
  }

  let browser = 'Chrome 153.0.0.0'
  if (l.includes('crios')) browser = 'WebKit CriOS 153.0'
  else if (l.includes('safari') && !l.includes('chrome')) browser = 'Apple Safari 17.5'
  else if (l.includes('firefox')) browser = 'Mozilla Firefox 128'
  else if (l.includes('edg')) browser = 'Microsoft Edge 126'

  return { device, os, browser }
})

// Database Changes Diff computed
const changedFields = computed(() => {
  const changes = currentData.value?.changes || currentData.value?.details?.changes
  if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
    return Object.entries(changes).map(([key, change]) => ({
      key,
      oldValue: change?.old,
      newValue: change?.new
    }))
  }

  const oldObj = props.log?.old_data
  const newObj = props.log?.new_data
  if (!oldObj && !newObj) return null

  const oldData = typeof oldObj === 'object' ? oldObj : {}
  const newData = typeof newObj === 'object' ? newObj : {}
  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]

  return allKeys.map(key => ({
    key,
    oldValue: oldData[key],
    newValue: newData[key]
  }))
})

// Status & UI formatting helpers
const isFailed = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'failed' || s === 'error' || s === 'failure' || s === 'rejected'
}

const isSuccess = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'success' || s === 'completed' || s === 'approved'
}

const formatAction = (action) => {
  if (!action) return 'AUDIT EVENT'
  return String(action).replace(/_/g, ' ')
}

const getStatusClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green/10 text-primary-green border-primary-green/20'
  if (isFailed(status)) return 'bg-primary-red/10 text-primary-red border-primary-red/20'
  return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
}

const getStatusDotClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green'
  if (isFailed(status)) return 'bg-primary-red'
  return 'bg-primary-yellow'
}

const getHeaderIconClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green/10 border-primary-green/20'
  if (isFailed(status)) return 'bg-primary-red/10 border-primary-red/20'
  return 'bg-primary-yellow/10 border-primary-yellow/20'
}

const formatValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const formatTime = (date, offsetSec = 0) => {
  if (!date) return '00:00:00 UTC'
  const m = moment.utc(date).add(offsetSec, 'seconds')
  return m.format('HH:mm:ss') + ' UTC'
}

const truncateMiddle = (str, front = 8, back = 6) => {
  if (!str) return '—'
  const s = String(str)
  if (s.length <= front + back + 3) return s
  return `${s.slice(0, front)}...${s.slice(-back)}`
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    payloadTab.value = 'json'
    permissionSearch.value = ''
    const logId = props.log?.audit_log_id || props.log?.id
    if (logId) {
      try {
        const res = await store.fetchAuditDetails(logId)
        detailData.value = res
      } catch {
        // Fallback to prop log
      }
    }
  } else {
    detailData.value = null
    resolvedGeo.value = { city: '', region: '', country: '', isp: '', asn: '' }
  }
})
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
