<template>
  <div class="floating-panel settings-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("settings.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <section class="settings-section">
        <h3>{{ t("settings.appearance") }}</h3>
        <div class="segmented appearance-segmented">
          <button
            type="button"
            class="segmented__btn appearance-option appearance-option--light"
            :class="{ active: settingsState.theme === 'light' }"
            @click="setTheme('light')"
          >
            <AppIcon name="sun" :size="16" />
            {{ t("settings.light") }}
          </button>
          <button
            type="button"
            class="segmented__btn appearance-option appearance-option--dark"
            :class="{ active: settingsState.theme === 'dark' }"
            @click="setTheme('dark')"
          >
            <AppIcon name="moon" :size="16" />
            {{ t("settings.dark") }}
          </button>
        </div>
      </section>

      <section class="settings-section">
        <h3>{{ t("settings.language") }}</h3>
        <div class="segmented">
          <button
            type="button"
            class="segmented__btn"
            :class="{ active: settingsState.language === 'ar' }"
            @click="setLang('ar')"
          >
            العربية
          </button>
          <button
            type="button"
            class="segmented__btn"
            :class="{ active: settingsState.language === 'en' }"
            @click="setLang('en')"
          >
            English
          </button>
        </div>
      </section>

      <section class="settings-section">
        <div class="settings-row">
          <div>
            <h3>{{ t("settings.autoLocation") }}</h3>
            <p class="settings-hint">{{ t("settings.autoLocationHint") }}</p>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settingsState.autoLocation"
              @change="toggleAutoLocation($event.target.checked)"
            />
            <span class="switch__track"><span class="switch__thumb"></span></span>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h3>{{ t("settings.about") }}</h3>
        <p class="about-name">{{ t("app.name") }}</p>
        <p class="settings-hint">{{ t("settings.aboutText") }}</p>
        <p class="settings-hint">{{ t("settings.aboutTech") }}</p>
        <p class="settings-hint">{{ t("settings.aboutVersion") }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { settingsState, setTheme, setLanguage, setAutoLocation } from "../store/settings";

export default {
  name: "SettingsPanel",

  components: { AppIcon },

  emits: ["close"],

  data() {
    return { settingsState };
  },

  methods: {
    t,
    setTheme,

    setLang(lang) {
      setLanguage(lang);
    },

    toggleAutoLocation(value) {
      setAutoLocation(value);
    },
  },
};
</script>

<style scoped>
.settings-section {
  margin-bottom: 20px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  font-size: 13.5px;
  margin: 0 0 8px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.settings-hint {
  font-size: 12.5px;
  color: var(--color-text-muted);
  margin: 2px 0;
  line-height: 1.5;
}

.about-name {
  font-size: 14.5px;
  font-weight: 700;
  margin: 0 0 4px;
}

.segmented {
  display: flex;
  gap: 6px;
  background: var(--color-background);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.segmented__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
}

.segmented__btn.active {
  background: var(--color-primary);
  color: #fff;
}

/* Appearance (light/dark) options intentionally ignore the generic primary
   active style above: each button must always look like the theme it
   represents, regardless of which theme is currently applied to the app. */
.appearance-option {
  border: 1px solid transparent;
}

.appearance-option:not(.active):hover {
  background: rgba(127, 137, 150, 0.18);
}

.appearance-option:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.segmented__btn.appearance-option--light.active {
  background: #ffffff;
  color: #1b2430;
  border-color: #c7cdd6;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
}

.segmented__btn.appearance-option--dark.active {
  background: #182231;
  color: #f5f7fa;
  border-color: #3a475c;
}

.settings-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch__track {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 999px;
  transition: background-color 0.15s ease;
}

.switch__thumb {
  position: absolute;
  top: 3px;
  inset-inline-start: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: inset-inline-start 0.15s ease;
}

.switch input:checked + .switch__track {
  background: var(--color-primary);
}

.switch input:checked + .switch__track .switch__thumb {
  inset-inline-start: 21px;
}
</style>
