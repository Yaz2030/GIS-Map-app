<template>
  <Transition name="panel-pop">
    <div v-if="visible" class="route-summary">
      <div class="route-summary__header">
        <h3>{{ t("route.title") }}</h3>
        <button type="button" class="icon-btn" :aria-label="t('route.clear')" @click="$emit('clear')">
          <AppIcon name="close" :size="16" />
        </button>
      </div>

      <div v-if="loading" class="panel-state">{{ t("route.calculating") }}</div>
      <div v-else-if="error" class="panel-state error">{{ error }}</div>

      <template v-else-if="route">
        <div class="route-summary__stats">
          <div class="route-stat">
            <AppIcon name="route" :size="16" />
            <span>{{ distanceKm }} {{ t("route.km") }}</span>
          </div>
          <div class="route-stat">
            <AppIcon name="locate" :size="16" />
            <span>{{ durationMin }} {{ t("route.minutes") }}</span>
          </div>
        </div>

        <div v-if="!expanded && directions.length" class="route-preview">
          <div class="route-preview__next">
            <span class="route-preview__label">{{ t("route.next") }}</span>
            <span class="route-preview__instruction">{{ directions[0].text }}</span>
            <span v-if="directions[0].distance" class="route-preview__after">
              {{ t("route.after") }} {{ directions[0].distance }}
            </span>
          </div>

          <div v-if="directions[1]" class="route-preview__then">
            <span class="route-preview__label">{{ t("route.then") }}</span>
            <span class="route-preview__then-text">{{ thenText }}</span>
          </div>
        </div>

        <button
          v-if="directions.length"
          type="button"
          class="btn btn-secondary btn-block route-toggle"
          @click="expanded = !expanded"
        >
          {{ expanded ? t("route.showLess") : t("route.showAll") }}
        </button>

        <ul v-if="expanded && directions.length" class="route-directions">
          <li v-for="(step, index) in directions" :key="index" class="route-direction">
            <span class="route-direction__icon"><AppIcon :name="step.icon" :size="16" /></span>
            <span class="route-direction__body">
              <span class="route-direction__text">{{ step.text }}</span>
              <span v-if="step.roadName" class="route-direction__road">{{ step.roadName }}</span>
              <span v-if="step.distance" class="route-direction__distance">{{ step.distance }}</span>
            </span>
          </li>
        </ul>
      </template>

      <button v-if="route || error" type="button" class="btn btn-secondary btn-block route-clear-btn" @click="$emit('clear')">
        {{ t("route.clear") }}
      </button>

      <p class="route-attribution">{{ t("route.attribution") }}</p>
    </div>
  </Transition>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t, currentLanguage } from "../i18n";
import { describeStep, getStepIcon } from "../utils/routeInstructions";

export default {
  name: "RouteSummary",

  components: { AppIcon },

  props: {
    route: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },

  emits: ["clear"],

  data() {
    return {
      expanded: false,
    };
  },

  watch: {
    // كل مسار جديد يبدأ مطويًا (compact) دائمًا، حتى لو كان المستخدم قد وسّع
    // مسارًا سابقًا
    route(newVal, oldVal) {
      if (newVal !== oldVal) this.expanded = false;
    },
  },

  computed: {
    visible() {
      return this.loading || !!this.route || !!this.error;
    },

    distanceKm() {
      return this.route ? (this.route.distanceMeters / 1000).toFixed(1) : 0;
    },

    durationMin() {
      return this.route ? Math.round(this.route.durationSeconds / 60) : 0;
    },

    directions() {
      if (!this.route || !this.route.steps) return [];
      const language = currentLanguage();
      return this.route.steps.map((step) => ({
        text: describeStep(step, language),
        icon: getStepIcon(step),
        roadName: step.name && step.type !== "continue" && step.type !== "new name" ? step.name : "",
        distance: this.formatStepDistance(step.distanceMeters),
      }));
    },

    thenText() {
      const step = this.directions[1];
      if (!step) return "";
      return step.distance ? `${step.text} — ${step.distance}` : step.text;
    },
  },

  methods: {
    t,

    formatStepDistance(meters) {
      if (!meters) return "";
      if (meters >= 1000) return `${(meters / 1000).toFixed(1)} ${t("route.km")}`;
      return `${Math.round(meters)} ${t("route.meters")}`;
    },
  },
};
</script>

<style scoped>
.route-summary {
  position: absolute;
  top: 16px;
  /* الجهة المقابلة للشريط الجانبي واللوحات العائمة (inset-inline-start) حتى لا
     يتداخل معها؛ يمين في LTR، يسار في RTL */
  inset-inline-end: 16px;
  width: min(340px, calc(100vw - 24px));
  max-height: calc(100% - 32px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 14px 16px;
  z-index: 1300;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.route-summary__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.route-summary__header h3 {
  margin: 0;
  font-size: 14.5px;
}

.route-summary__stats {
  flex-shrink: 0;
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
}

.route-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.route-preview {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  padding-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-preview__next,
.route-preview__then {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.route-preview__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
}

.route-preview__instruction {
  font-size: 15px;
  font-weight: 700;
}

.route-preview__after {
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.route-preview__then-text {
  font-size: 13px;
  color: var(--color-text);
}

.route-toggle {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.route-directions {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  list-style: none;
  margin: 0 0 12px;
  padding: 10px 0 0;
  border-top: 1px solid var(--color-border);
}

.route-direction {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 7px 2px;
}

.route-direction + .route-direction {
  border-top: 1px dashed var(--color-border);
}

.route-direction__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-background);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-direction__body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.route-direction__text {
  font-size: 13.5px;
  color: var(--color-text);
}

.route-direction__road {
  font-size: 12px;
  color: var(--color-text-muted);
}

.route-direction__distance {
  font-size: 11.5px;
  color: var(--color-text-muted);
}

.route-clear-btn {
  flex-shrink: 0;
}

.route-attribution {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--color-text-muted);
  margin: 8px 0 0;
  text-align: center;
}
</style>
