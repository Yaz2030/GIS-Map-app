<template>
  <div class="floating-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("layers.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <section class="layers-section">
        <h3>{{ t("layers.base") }}</h3>
        <button
          v-for="option in baseLayers"
          :key="option.key"
          type="button"
          class="layer-option"
          :class="{ active: mapPreferencesState.baseLayer === option.key }"
          @click="setBaseLayer(option.key)"
        >
          <span class="layer-option__swatch" :style="{ background: option.color }"></span>
          <span>{{ t(option.labelKey) }}</span>
          <AppIcon v-if="mapPreferencesState.baseLayer === option.key" name="check-circle" :size="16" />
        </button>
      </section>

      <section class="layers-section">
        <h3>{{ t("layers.overlays") }}</h3>
        <label v-for="overlay in overlayList" :key="overlay.key" class="overlay-row">
          <input
            type="checkbox"
            :checked="overlays[overlay.key]"
            @change="$emit('toggle-overlay', overlay.key)"
          />
          <span>{{ t(overlay.labelKey) }}</span>
        </label>
      </section>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { mapPreferencesState, setBaseLayer } from "../store/mapPreferences";

export default {
  name: "LayersPanel",

  components: { AppIcon },

  props: {
    overlays: {
      type: Object,
      default: () => ({ saved: true, currentLocation: true, route: true }),
    },
  },

  emits: ["toggle-overlay", "close"],

  data() {
    return {
      mapPreferencesState,
      baseLayers: [
        { key: "osm", labelKey: "layers.osm", color: "#8bc34a" },
        { key: "dark", labelKey: "layers.dark", color: "#263238" },
        { key: "satellite", labelKey: "layers.satellite", color: "#3949ab" },
      ],
      overlayList: [
        { key: "saved", labelKey: "layers.overlaySaved" },
        { key: "currentLocation", labelKey: "layers.overlayLocation" },
        { key: "route", labelKey: "layers.overlayRoute" },
      ],
    };
  },

  methods: { t, setBaseLayer },
};
</script>

<style scoped>
.layers-section {
  margin-bottom: 20px;
}

.layers-section:last-child {
  margin-bottom: 0;
}

.layers-section h3 {
  font-size: 13.5px;
  margin: 0 0 8px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.layer-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 13.5px;
  margin-bottom: 6px;
}

.layer-option.active {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.layer-option span:nth-child(2) {
  flex: 1;
  text-align: start;
}

.layer-option__swatch {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.overlay-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 2px;
  font-size: 13.5px;
  cursor: pointer;
}

.overlay-row input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}
</style>
