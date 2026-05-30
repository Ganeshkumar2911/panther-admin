<script setup>
import { ref } from "vue";

defineProps({
  text: {
    type: String,
    required: true,
  },
});

const showTooltip = ref(false);
const tooltipStyle = ref({});

const handleMouseEnter = (event) => {
  showTooltip.value = true;
  const rect = event.currentTarget.getBoundingClientRect();
  tooltipStyle.value = {
    bottom: `calc(100% + 8px)`,
    left: `50%`,
    transform: `translateX(-50%)`,
  };
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<template>
  <div
    class="tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />
    <div
      v-if="showTooltip"
      class="tooltip-popup"
      :style="tooltipStyle"
    >
      <div class="tooltip-content">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-popup {
  position: absolute;
  z-index: 50;
  white-space: nowrap;
  animation: slideUp 0.2s ease-out;
}

.tooltip-content {
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .tooltip-popup {
    position: fixed;
  }

  .tooltip-content {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>
