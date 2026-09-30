<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "center",
    validator: (value) =>
      ["start", "center", "end", "right", "left", "bottom", "top"].includes(
        value,
      ),
  },
  placement: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  textSize: {
    type: String,
    default: "12px",
  },
  maxWidth: {
    type: String,
    default: "240px",
  },
});

const computedFontSizeStyle = computed(() => {
  if (props.textSize && !props.textSize.startsWith("text-")) {
    return { fontSize: props.textSize };
  }
  return {};
});

const computedTextSizeClass = computed(() => {
  if (props.textSize && props.textSize.startsWith("text-")) {
    return props.textSize;
  }
  return "";
});

const computedMaxWidthStyle = computed(() => {
  if (!props.maxWidth) return {};
  if (props.maxWidth === "none") return { maxWidth: "none" };
  if (/^\d+(\.\d+)?(px|rem|em|pt|%)$/.test(props.maxWidth)) {
    return { maxWidth: props.maxWidth };
  }
  return {};
});

const computedMaxWidthClass = computed(() => {
  if (props.maxWidth && props.maxWidth.startsWith("max-w-")) {
    return props.maxWidth;
  }
  return "";
});

const showTooltip = ref(false);
const wrapperRef = ref(null);
const actualPosition = ref(props.position);

const getTooltipStyle = () => {
  if (!wrapperRef.value) return {};
  const rect = wrapperRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  let pos = props.position;
  if (props.placement) {
    pos = props.placement;
  }
  if (pos === "top") pos = "center";

  // Flip if out of viewport bounds:
  if (["center", "start", "end", "top"].includes(pos) && rect.top < 40) {
    pos = "bottom";
  } else if (pos === "bottom" && viewportHeight - rect.bottom < 40) {
    pos = "center";
  } else if (pos === "right" && viewportWidth - rect.right < 200) {
    pos = "left";
  } else if (pos === "left" && rect.left < 200) {
    pos = "right";
  }

  actualPosition.value = pos;

  if (pos === "right") {
    return {
      position: "fixed",
      left: `${rect.right + 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translateY(-50%)",
      zIndex: "99999",
      pointerEvents: "none",
    };
  }

  if (pos === "left") {
    return {
      position: "fixed",
      left: `${Math.max(12, rect.left - 8)}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translate(-100%, -50%)",
      zIndex: "99999",
      pointerEvents: "none",
    };
  }

  if (pos === "bottom") {
    return {
      position: "fixed",
      left: `${Math.max(12, Math.min(viewportWidth - 12, rect.left + rect.width / 2))}px`,
      top: `${rect.bottom + 8}px`,
      transform: "translateX(-50%)",
      zIndex: "99999",
      pointerEvents: "none",
    };
  }

  if (pos === "start") {
    return {
      position: "fixed",
      left: `${Math.max(12, rect.left)}px`,
      top: `${rect.top - 8}px`,
      transform: "translateY(-100%)",
      zIndex: "99999",
      pointerEvents: "none",
    };
  }

  if (pos === "end") {
    return {
      position: "fixed",
      left: `${Math.min(viewportWidth - 12, rect.right)}px`,
      top: `${rect.top - 8}px`,
      transform: "translate(-100%, -100%)",
      zIndex: "99999",
      pointerEvents: "none",
    };
  }

  // Default: center (Top centered)
  return {
    position: "fixed",
    left: `${Math.max(12, Math.min(viewportWidth - 12, rect.left + rect.width / 2))}px`,
    top: `${rect.top - 8}px`,
    transform: "translate(-50%, -100%)",
    zIndex: "99999",
    pointerEvents: "none",
  };
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

const handleScroll = () => {
  if (showTooltip.value) {
    showTooltip.value = false;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll, { capture: true });
});
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

    <Teleport to="body">
      <div
        v-if="showTooltip"
        class="tooltip-popup is-visible"
        :class="[`position-${actualPosition}`, computedMaxWidthClass]"
        :style="[tooltipStyle, computedMaxWidthStyle]"
      >
        <div
          class="tooltip-content"
          :class="computedTextSizeClass"
          :style="computedFontSizeStyle"
        >
          <slot name="content">{{ text }}</slot>
        </div>
      </div>
    </Teleport>
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
  position: fixed;
  z-index: 99999;
  width: max-content;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.tooltip-popup.is-visible {
  opacity: 1;
}

.tooltip-content {
  position: relative;
  background: var(--color-card-background);
  color: var(--color-primary-text);
  border: 1px solid var(--color-primary-border);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  white-space: normal;
  word-break: break-word;
  text-align: left;
}

/* Arrow common */
.tooltip-content::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-card-background);
}

/* TOP / CENTER */
.tooltip-popup.position-center .tooltip-content::after,
.tooltip-popup.position-top .tooltip-content::after {
  left: 50%;
  bottom: -5px;
  top: auto;
  right: auto;
  border-right: 1px solid var(--color-primary-border);
  border-bottom: 1px solid var(--color-primary-border);
  border-left: none;
  border-top: none;
  transform: translateX(-50%) rotate(45deg);
}

/* START */
.tooltip-popup.position-start .tooltip-content::after {
  left: 16px;
  bottom: -5px;
  top: auto;
  right: auto;
  border-right: 1px solid var(--color-primary-border);
  border-bottom: 1px solid var(--color-primary-border);
  border-left: none;
  border-top: none;
  transform: rotate(45deg);
}

/* END */
.tooltip-popup.position-end .tooltip-content::after {
  right: 16px;
  left: auto;
  bottom: -5px;
  top: auto;
  border-right: 1px solid var(--color-primary-border);
  border-bottom: 1px solid var(--color-primary-border);
  border-left: none;
  border-top: none;
  transform: rotate(45deg);
}

/* RIGHT */
.tooltip-popup.position-right .tooltip-content::after {
  left: -5px;
  right: auto;
  top: 50%;
  bottom: auto;
  border-bottom: 1px solid var(--color-primary-border);
  border-left: 1px solid var(--color-primary-border);
  border-right: none;
  border-top: none;
  transform: translateY(-50%) rotate(45deg);
}

/* LEFT */
.tooltip-popup.position-left .tooltip-content::after {
  right: -5px;
  left: auto;
  top: 50%;
  bottom: auto;
  border-top: 1px solid var(--color-primary-border);
  border-right: 1px solid var(--color-primary-border);
  border-left: none;
  border-bottom: none;
  transform: translateY(-50%) rotate(45deg);
}

/* BOTTOM */
.tooltip-popup.position-bottom .tooltip-content::after {
  left: 50%;
  top: -5px;
  bottom: auto;
  right: auto;
  border-top: 1px solid var(--color-primary-border);
  border-left: 1px solid var(--color-primary-border);
  border-right: none;
  border-bottom: none;
  transform: translateX(-50%) rotate(45deg);
}

@media (max-width: 768px) {
  .tooltip-content {
    font-size: 11px;
    padding: 5px 8px;
  }
}
</style>