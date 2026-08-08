<template>
  <div class="landing-page">
    <div class="landing-page__backdrop"></div>

    <div class="landing-page__card">
      <h1 class="landing-page__title">{{ t("landing.title") }}</h1>
      <h2 class="landing-page__section-heading">{{ t("landing.sectionHeading") }}</h2>
      <p class="landing-page__description">{{ t("landing.description") }}</p>
      <p class="landing-page__description">{{ t("landing.description2") }}</p>

      <div class="landing-page__tech">
        <span v-for="tech in techStack" :key="tech" class="landing-page__tech-badge">{{ tech }}</span>
      </div>

      <button type="button" class="landing-page__cta" @click="$emit('get-started')">
        {{ t("landing.getStarted") }}
      </button>
    </div>
  </div>
</template>

<script>
import { t } from "../i18n";

// أسماء تقنيات/منتجات لا تُترجم (متطابقة بالعربي والإنجليزي)، فتُعرض مباشرة
// دون المرور بنظام الترجمة الذي يدعم قيمًا نصية فقط لكل مفتاح
const TECH_STACK = ["Vue.js", "Leaflet.js", "Spring Boot", "MongoDB"];

export default {
  name: "LandingPage",

  emits: ["get-started"],

  data() {
    return { techStack: TECH_STACK };
  },

  methods: { t },
};
</script>

<style scoped>
.landing-page {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.landing-page__backdrop {
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
  opacity: 0.85;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.landing-page__card {
  position: relative;
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 44px 36px;
  text-align: center;
}

.landing-page__title {
  margin: 0 0 12px;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  background: var(--accent-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.landing-page__section-heading {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent-primary);
}

.landing-page__description {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.landing-page__description:last-of-type {
  margin-bottom: 26px;
}

.landing-page__tech {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 28px;
}

.landing-page__tech-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--accent-primary);
  background: var(--bg-surface);
  color: var(--accent-primary);
  font-size: 12.5px;
  font-weight: 700;
}

.landing-page__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  padding: 13px 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent-gradient);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.landing-page__cta:hover {
  opacity: 0.92;
}

.landing-page__cta:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

@media (max-width: 720px) {
  .landing-page__card {
    padding: 32px 22px;
  }

  .landing-page__cta {
    width: 100%;
  }
}
</style>
