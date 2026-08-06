<template>
  <div class="floating-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("search.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <div class="search-input-row">
        <input
          v-model="query"
          type="text"
          class="filter-input"
          :placeholder="t('search.placeholder')"
          @keyup.enter="performSearch"
        />
        <button type="button" class="btn btn-primary" :aria-label="t('search.button')" @click="performSearch">
          <AppIcon name="search" :size="16" />
        </button>
      </div>

      <div v-if="loading" class="panel-state">{{ t("search.loading") }}</div>
      <div v-else-if="error" class="panel-state error">{{ error }}</div>
      <div v-else-if="!hasSearched" class="panel-state">{{ t("search.initial") }}</div>
      <div v-else-if="!results.length" class="panel-empty-state">{{ t("search.empty") }}</div>

      <button
        v-for="(result, index) in results"
        v-else
        :key="index"
        type="button"
        class="list-item"
        @click="$emit('select-result', result)"
      >
        <span class="list-item__icon">
          <AppIcon :name="getCategoryIcon(result.category)" :size="18" />
        </span>
        <span class="list-item__text">
          <span class="list-item__name">{{ result.name || result.displayName }}</span>
          <span v-if="result.address" class="list-item__address">{{ result.address }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t, currentLanguage } from "../i18n";
import { searchPlaces, normalizePlace } from "../services/nominatimService";
import { getCategoryIcon } from "../utils/placeCategory";

export default {
  name: "SearchPanel",

  components: { AppIcon },

  emits: ["select-result", "close"],

  data() {
    return {
      query: "",
      results: [],
      loading: false,
      error: null,
      hasSearched: false,
      debounceTimer: null,
    };
  },

  watch: {
    query(value) {
      clearTimeout(this.debounceTimer);
      const trimmed = value.trim();

      if (!trimmed) {
        this.results = [];
        this.hasSearched = false;
        this.error = null;
        return;
      }

      if (trimmed.length < 2) return;

      this.debounceTimer = setTimeout(() => this.performSearch(), 500);
    },
  },

  beforeUnmount() {
    clearTimeout(this.debounceTimer);
  },

  methods: {
    t,
    getCategoryIcon,

    async performSearch() {
      const trimmed = this.query.trim();
      if (!trimmed) return;

      clearTimeout(this.debounceTimer);
      this.loading = true;
      this.error = null;
      this.hasSearched = true;

      try {
        const data = await searchPlaces(trimmed, currentLanguage(), 10);
        this.results = data.map((item) => normalizePlace(item));
      } catch (err) {
        console.error("Nominatim search error:", err);
        this.error = t("search.error");
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.search-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.search-input-row .filter-input {
  margin-bottom: 0;
}

.search-input-row .btn {
  flex-shrink: 0;
  padding-inline: 12px;
}
</style>
