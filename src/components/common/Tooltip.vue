<script setup>
import { ref } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "center",
    validator: (value) => ["start", "center", "end"].includes(value),
  },
});

const showTooltip = ref(false);

const tooltipStyle = ref({
  bottom: "calc(100% + 8px)",
  left: "50%",
  transform: "translateX(-50%)",
});

const handleMouseEnter = () => {
  const positionMap = {
    start: {
      left: "0",
      transform: "translateX(0)",
    },
    center: {
      left: "50%",
      transform: "translateX(-50%)",
    },
    end: {
      left: "100%",
      transform: "translateX(-100%)",
    },
  };

  tooltipStyle.value = {
    bottom: "calc(100% + 8px)",
    ...positionMap[props.position],
  };

  showTooltip.value = true;
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
      v-show="showTooltip"
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
  z-index: 9999;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.tooltip-popup[style] {
  opacity: 1;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* Optional arrow */
.tooltip-content::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.9);
  transform: translateX(-50%) rotate(45deg);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tooltip-content {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>