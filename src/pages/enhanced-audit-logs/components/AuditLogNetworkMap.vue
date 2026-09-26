<template>
  <div class="relative w-full h-48 rounded-lg overflow-hidden border border-primary-border bg-background shadow-inner select-none">
    <!-- Leaflet Map Container -->
    <div ref="mapContainer" class="w-full h-full z-0"></div>

    <!-- Loading State Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-20 transition-opacity"
    >
      <div class="flex items-center gap-2 bg-card-background/90 px-3 py-1.5 rounded-lg border border-primary-border shadow-sm text-[11px] text-primary-text font-semibold">
        <div class="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <span>Pinning Geo Origin...</span>
      </div>
    </div>

    <!-- IP Badge Top Right -->
    <div
      class="absolute top-2 right-2 z-20 bg-card-background/95 backdrop-blur-md px-2.5 py-0.8 rounded-md border border-primary-border shadow-sm text-[10px] font-mono font-bold text-primary flex items-center gap-1.5"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse"></span>
      <span>{{ ipAddress || '127.0.0.1' }}</span>
    </div>

    <!-- Location & Coordinates Overlay Badge (Reference UI Style) -->
    <div
      class="absolute bottom-2 left-2 z-20 bg-card-background/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-primary-border shadow-md flex items-center gap-2 max-w-[85%]"
    >
      <div class="w-2 h-2 rounded-full bg-primary-green shrink-0"></div>
      <div class="min-w-0">
        <p class="text-[11px] font-bold text-primary-text truncate leading-tight">
          {{ locationText }}
        </p>
        <p class="text-[9px] font-mono text-secondary-text truncate mt-0.5">
          {{ coordinatesText }}
          <span v-if="geoData.isp" class="text-primary font-semibold ml-1">• {{ geoData.isp }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  ipAddress: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['geo-resolved'])

const mapContainer = ref(null)
let L = null
let mapInstance = null
let markerInstance = null
const isLoading = ref(false)
const isMapReady = ref(false)

// Global in-memory cache for IP lookups
const ipGeoCache = new Map()

const geoData = ref({
  city: 'Locating Origin',
  region: '',
  country: '',
  lat: 20.0,
  lon: 0.0,
  isp: '',
  asn: ''
})

const locationText = computed(() => {
  if (!props.ipAddress) return 'Location Unknown'
  const parts = [geoData.value.city, geoData.value.region, geoData.value.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Network Origin'
})

const coordinatesText = computed(() => {
  const lat = geoData.value.lat !== undefined ? Number(geoData.value.lat).toFixed(4) : '0.0000'
  const lon = geoData.value.lon !== undefined ? Number(geoData.value.lon).toFixed(4) : '0.0000'
  const latNum = Number(geoData.value.lat) || 0
  const lonNum = Number(geoData.value.lon) || 0
  const latDir = latNum >= 0 ? 'N' : 'S'
  const lonDir = lonNum >= 0 ? 'E' : 'W'
  return `${Math.abs(lat)}° ${latDir}, ${Math.abs(lon)}° ${lonDir}`
})

// Safe Leaflet Loader with CDN fallback
const ensureLeafletLoaded = async () => {
  if (L) return L
  if (typeof window !== 'undefined' && window.L) {
    L = window.L
    return L
  }

  // 1. Try local npm module
  try {
    const mod = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    L = mod.default || mod
    window.L = L
    return L
  } catch (err) {
    console.warn('Local leaflet bundle load fallback to dynamic CDN loader:', err)
  }

  // 2. Dynamic CDN loader fallback
  return new Promise((resolve, reject) => {
    if (document.getElementById('leaflet-css') === null) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (window.L) {
      L = window.L
      return resolve(L)
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      L = window.L
      resolve(L)
    }
    script.onerror = (e) => {
      console.error('Failed to load Leaflet from CDN:', e)
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// Custom Leaflet Pulsing Radar Marker Icon (Perfect Anchor at center [16, 16])
const createRadarIcon = () => {
  if (!L) return null
  return L.divIcon({
    className: 'custom-radar-container',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 pointer-events-none">
        <div class="absolute w-8 h-8 rounded-full bg-primary/25 animate-ping"></div>
        <div class="absolute w-5 h-5 rounded-full bg-primary/40"></div>
        <div class="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-lg"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16] // Locks marker center precisely to lat/lon during zoom
  })
}

// Initialize Leaflet Map
const initMap = async () => {
  if (!mapContainer.value || mapInstance) return

  const leaflet = await ensureLeafletLoaded()
  if (!leaflet || !mapContainer.value) return

  const initialLat = geoData.value.lat || 20.0
  const initialLon = geoData.value.lon || 0.0

  try {
    mapInstance = leaflet.map(mapContainer.value, {
      center: [initialLat, initialLon],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true
    })

    // OpenStreetMap Tile Layer
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(mapInstance)

    // Zoom control top-left
    leaflet.control.zoom({ position: 'topleft' }).addTo(mapInstance)

    // Add marker
    const icon = createRadarIcon()
    markerInstance = leaflet.marker([initialLat, initialLon], {
      icon: icon
    }).addTo(mapInstance)

    isMapReady.value = true
    updateMapPosition()

    // Ensure map container renders properly without size lag
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    }, 250)
  } catch (err) {
    console.error('Error initializing Leaflet map:', err)
  }
}

// Update Map Position smoothly
const updateMapPosition = () => {
  if (!mapInstance || !markerInstance) return
  const lat = geoData.value.lat
  const lon = geoData.value.lon

  mapInstance.setView([lat, lon], 11, { animate: true })
  markerInstance.setLatLng([lat, lon])

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize()
  }, 100)
}

// Fallback for private / unreachable IPs
const getFallbackGeo = (ip) => {
  if (!ip) return { city: 'Network Origin', region: '', country: '', lat: 20.0, lon: 0.0, isp: '', asn: '' }

  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === 'localhost') {
    return { city: 'Localhost', region: 'Private Network', country: '', lat: 20.0, lon: 0.0, isp: 'Local Loopback', asn: '' }
  }

  return { city: 'Network Origin', region: '', country: '', lat: 20.0, lon: 0.0, isp: '', asn: '' }
}

// Live IP Geolocation lookup
const resolveIp = async (ip) => {
  if (!ip) return
  const cleanIp = String(ip).trim().split(',')[0].trim()

  if (ipGeoCache.has(cleanIp)) {
    const cached = ipGeoCache.get(cleanIp)
    geoData.value = { ...cached }
    updateMapPosition()
    emit('geo-resolved', cached)
    return
  }

  const fallback = getFallbackGeo(cleanIp)
  geoData.value = { ...fallback }

  if (cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
    updateMapPosition()
    emit('geo-resolved', fallback)
    return
  }

  isLoading.value = true

  try {
    // 1. Primary: ipwho.is
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)
    const res = await fetch(`https://ipwho.is/${cleanIp}`, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && data.success !== false && data.latitude && data.longitude) {
        const resolved = {
          city: data.city || fallback.city,
          region: data.region || fallback.region,
          country: data.country || fallback.country,
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          isp: data.connection?.isp || data.connection?.org || fallback.isp,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : fallback.asn
        }
        geoData.value = resolved
        ipGeoCache.set(cleanIp, resolved)
        updateMapPosition()
        emit('geo-resolved', resolved)
        isLoading.value = false
        return
      }
    }
  } catch {
    // Secondary fallback
  }

  try {
    // 2. Secondary: freeipapi.com
    const controller2 = new AbortController()
    const timeoutId2 = setTimeout(() => controller2.abort(), 3000)
    const res2 = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, { signal: controller2.signal })
    clearTimeout(timeoutId2)

    if (res2.ok) {
      const data2 = await res2.json()
      if (data2 && data2.latitude && data2.longitude) {
        const resolved = {
          city: data2.cityName || fallback.city,
          region: data2.regionName || fallback.region,
          country: data2.countryName || fallback.country,
          lat: Number(data2.latitude),
          lon: Number(data2.longitude),
          isp: fallback.isp,
          asn: fallback.asn
        }
        geoData.value = resolved
        ipGeoCache.set(cleanIp, resolved)
        updateMapPosition()
        emit('geo-resolved', resolved)
        isLoading.value = false
        return
      }
    }
  } catch {
    // Graceful fallback
  }

  updateMapPosition()
  emit('geo-resolved', fallback)
  isLoading.value = false
}

watch(() => props.ipAddress, (newIp) => {
  if (newIp) {
    resolveIp(newIp)
  }
})

let resizeObserver = null

onMounted(() => {
  initMap()
  if (props.ipAddress) {
    resolveIp(props.ipAddress)
  }

  if (window.ResizeObserver && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    })
    resizeObserver.observe(mapContainer.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
})
</script>

<style>
/* Leaflet map base styling */
.leaflet-container {
  font-family: inherit;
  background: var(--color-background) !important;
  width: 100%;
  height: 100%;
}

.dark .leaflet-tile {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.75);
}

.custom-radar-container {
  background: transparent !important;
  border: none !important;
}
</style>
