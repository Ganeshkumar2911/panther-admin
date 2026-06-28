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
    validator: (value) => ["start", "center", "end", "right", "left", "bottom"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
});

const showTooltip = ref(false);
const wrapperRef = ref(null);

const getTooltipStyle = () => {
  if (props.position === "right" && wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect();
    return {
      position: "fixed",
      left: `${rect.right + 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translateY(-50%)",
      bottom: "auto",
      right: "auto",
      zIndex: "9999",
    };
  }
  if (props.position === "left" && wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect();
    return {
      position: "fixed",
      left: `${rect.left - 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translate(-100%, -50%)",
      bottom: "auto",
      right: "auto",
      zIndex: "9999",
    };
  }

  const positionMap = {
    start: {
      left: "0",
      transform: "translateX(0)",
      bottom: "calc(100% + 8px)",
      top: "auto",
    },
    center: {
      left: "50%",
      transform: "translateX(-50%)",
      bottom: "calc(100% + 8px)",
      top: "auto",
    },
    end: {
      left: "100%",
      transform: "translateX(-100%)",
      bottom: "calc(100% + 8px)",
      top: "auto",
    },
    bottom: {
      left: "50%",
      transform: "translateX(-50%)",
      top: "calc(100% + 8px)",
      bottom: "auto",
    },
  };
  return positionMap[props.position] || positionMap.center;
};

const tooltipStyle = ref({});

const handleMouseEnter = () => {
  if (props.disabled) return;
  tooltipStyle.value = getTooltipStyle();
  showTooltip.value = true;
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<template>
  <div
    ref="wrapperRef"
    class="tooltip-wrapper"
    :class="{ 'block': block }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />

    <div
      v-show="showTooltip"
      class="tooltip-popup"
      :class="[`position-${position}`]"
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

.tooltip-wrapper.block {
  display: block;
  width: 100%;
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
  position: relative;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* Default arrow (center) */
.tooltip-content::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.9);
  left: 50%;
  bottom: -4px;
  transform: translateX(-50%) rotate(45deg);
}

/* START */
.tooltip-popup.position-start .tooltip-content::after {
  left: 16px;
  bottom: -4px;
  transform: rotate(45deg);
}

/* CENTER */
.tooltip-popup.position-center .tooltip-content::after {
  left: 50%;
  bottom: -4px;
  transform: translateX(-50%) rotate(45deg);
}

/* END */
.tooltip-popup.position-end .tooltip-content::after {
  left: auto;
  right: 16px;
  bottom: -4px;
  transform: rotate(45deg);
}

/* RIGHT */
.tooltip-popup.position-right .tooltip-content::after {
  left: -4px;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%) rotate(45deg);
}

/* LEFT */
.tooltip-popup.position-left .tooltip-content::after {
  left: auto;
  right: -4px;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%) rotate(45deg);
}

/* BOTTOM */
.tooltip-popup.position-bottom .tooltip-content::after {
  left: 50%;
  top: -4px;
  bottom: auto;
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