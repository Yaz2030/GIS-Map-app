<template>
  <div class="map-sidebar" role="toolbar" :aria-label="t('sidebar.myLocation')">
    <button
      type="button"
      class="sidebar-btn"
      :class="{ active: locating }"
      :aria-label="t('sidebar.myLocation')"
      @click="$emit('my-location')"
    >
      <span v-if="locating" class="sidebar-spinner"></span>
      <AppIcon v-else name="navigation" :size="20" />
      <span class="tooltip">{{ t("sidebar.myLocation") }}</span>
    </button>

    <button
      type="button"
      class="sidebar-btn"
      :class="{ active: currentMenu === 'search' }"
      :aria-label="t('sidebar.search')"
      :aria-pressed="currentMenu === 'search'"
      @click="$emit('change-menu', 'search')"
    >
      <AppIcon name="search" :size="20" />
      <span class="tooltip">{{ t("sidebar.search") }}</span>
    </button>

    <button
      type="button"
      class="sidebar-btn"
      :class="{ active: currentMenu === 'savedLocations' }"
      :aria-label="t('sidebar.savedLocations')"
      :aria-pressed="currentMenu === 'savedLocations'"
      @click="$emit('change-menu', 'savedLocations')"
    >
      <AppIcon name="bookmark" :size="20" />
      <span class="tooltip">{{ t("sidebar.savedLocations") }}</span>
    </button>

    <button
      type="button"
      class="sidebar-btn"
      :class="{ active: currentMenu === 'layers' }"
      :aria-label="t('sidebar.layers')"
      :aria-pressed="currentMenu === 'layers'"
      @click="$emit('change-menu', 'layers')"
    >
      <AppIcon name="layers" :size="20" />
      <span class="tooltip">{{ t("sidebar.layers") }}</span>
    </button>

    <div class="sidebar-divider"></div>

    <button type="button" class="sidebar-btn" :aria-label="t('sidebar.reset')" @click="$emit('reset')">
      <AppIcon name="refresh" :size="20" />
      <span class="tooltip">{{ t("sidebar.reset") }}</span>
    </button>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";

export default {
  name: "MapSidebar",

  components: { AppIcon },

  props: {
    currentMenu: {
      type: String,
      default: null,
    },
    locating: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["change-menu", "my-location", "reset"],

  methods: { t },
};
</script>

<style scoped>
.map-sidebar {
  position: absolute;
  top: 16px;
  /* Follows reading direction: right side of the map in Arabic (RTL), left side in English (LTR) */
  inset-inline-start: 16px;
  z-index: 1000;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-btn {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.sidebar-btn:hover {
  background: var(--bg-primary);
}

.sidebar-btn.active {
  background: var(--accent-primary);
  color: #fff;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 2px 4px;
}

.sidebar-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: sidebar-spin 0.7s linear infinite;
}

@keyframes sidebar-spin {
  to {
    transform: rotate(360deg);
  }
}

.tooltip {
  position: absolute;
  top: 50%;
  inset-inline-start: calc(100% + 10px);
  transform: translateY(-50%);
  background: var(--text-primary);
  color: var(--bg-surface);
  font-size: 12px;
  padding: 5px 9px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 1100;
}

.sidebar-btn:hover .tooltip,
.sidebar-btn:focus-visible .tooltip {
  opacity: 1;
}
</style>
