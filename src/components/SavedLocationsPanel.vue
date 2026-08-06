<template>
  <div class="floating-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("saved.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <input
        v-if="savedLocationsState.items.length"
        v-model="filterText"
        type="text"
        class="filter-input"
        :placeholder="t('saved.filterPlaceholder')"
      />

      <div v-if="!savedLocationsState.items.length" class="panel-empty-state">
        {{ t("saved.empty") }}
      </div>

      <div v-else-if="!filteredItems.length" class="panel-empty-state">
        {{ t("saved.emptyFiltered") }}
      </div>

      <ul v-else class="saved-list">
        <li v-for="item in filteredItems" :key="item.id" class="saved-item">
          <button type="button" class="saved-item__main" @click="$emit('select-location', item)">
            <span class="saved-item__icon">
              <AppIcon :name="getCategoryIcon(item.category)" :size="18" />
            </span>
            <span class="saved-item__text">
              <span class="saved-item__name">{{ item.name }}</span>
              <span v-if="item.address" class="saved-item__address">{{ item.address }}</span>
              <span v-if="item.description" class="saved-item__description">{{ item.description }}</span>
            </span>
          </button>

          <div class="saved-item__actions">
            <button
              type="button"
              class="icon-btn"
              :aria-label="t('saved.edit')"
              @click.stop="$emit('edit-location', item)"
            >
              <AppIcon name="edit" :size="16" />
            </button>
            <button
              type="button"
              class="icon-btn saved-item__delete"
              :aria-label="t('saved.delete')"
              @click.stop="handleDelete(item)"
            >
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { savedLocationsState } from "../store/savedLocations";
import { getCategoryIcon } from "../utils/placeCategory";
import { confirm } from "../composables/useConfirm";

export default {
  name: "SavedLocationsPanel",

  components: { AppIcon },

  emits: ["select-location", "edit-location", "delete-location", "close"],

  data() {
    return {
      savedLocationsState,
      filterText: "",
    };
  },

  computed: {
    filteredItems() {
      const query = this.filterText.trim().toLowerCase();
      const items = [...this.savedLocationsState.items].sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
      if (!query) return items;
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.address || "").toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query)
      );
    },
  },

  methods: {
    t,
    getCategoryIcon,

    async handleDelete(item) {
      const confirmed = await confirm({
        title: t("saved.delete"),
        message: t("saved.deleteConfirm"),
        isDangerous: true,
      });
      if (confirmed) {
        this.$emit("delete-location", item);
      }
    },
  },
};
</script>

<style scoped>
.saved-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.saved-item {
  display: flex;
  align-items: stretch;
  gap: 4px;
}

.saved-item + .saved-item {
  margin-top: 2px;
}

.saved-item__main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: start;
  color: var(--text-primary);
  transition: background-color 0.15s ease;
}

.saved-item__main:hover {
  background: var(--bg-primary);
}

/* عمود ثابت العرض للأيقونة حتى لا يزاحمه النص عند التفاف الأسطر */
.saved-item__icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  margin-top: 1px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* عمود النص: تكديس رأسي حقيقي (flex column) بدل الاعتماد على تدفق inline
   الذي كان يسبب تداخل الاسم/العنوان/الوصف مع النصوص الطويلة */
.saved-item__text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.saved-item__name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: break-word;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

.saved-item__address {
  overflow-wrap: break-word;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.saved-item__description {
  overflow-wrap: break-word;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* عمود ثابت لا ينكمش لصالح النص، ولا يتأثر بطول عمود النص المجاور */
.saved-item__actions {
  flex-shrink: 0;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 2px;
}

.saved-item__delete:hover {
  color: var(--color-danger);
}
</style>
