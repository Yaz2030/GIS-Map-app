<template>
  <Transition name="modal-fade">
    <div v-if="open" class="save-form-backdrop" @mousedown.self="$emit('cancel')">
      <div class="save-form-modal" role="dialog" aria-modal="true">
        <div class="save-form-modal__header">
          <h2>{{ mode === "edit" ? t("saved.formTitleEdit") : t("saved.formTitleCreate") }}</h2>
          <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('cancel')">
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <form class="save-form-modal__body" @submit.prevent="submit" novalidate>
          <div class="form-group">
            <label for="save-form-name">{{ t("saved.name") }}</label>
            <input id="save-form-name" v-model.trim="name" type="text" :placeholder="fallbackName" />
          </div>

          <div class="form-group">
            <label>{{ t("saved.chooseIcon") }}</label>
            <div class="save-form-icons">
              <button
                v-for="option in categoryOptions"
                :key="option.key"
                type="button"
                class="save-form-icon"
                :class="{ active: category === option.key }"
                :aria-label="t(option.labelKey)"
                :aria-pressed="category === option.key"
                @click="category = option.key"
              >
                <AppIcon :name="option.icon" :size="18" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="save-form-description">
              {{ t("saved.description") }}
              <span class="save-form-count">{{ description.length }}/{{ maxDescriptionLength }}</span>
            </label>
            <textarea
              id="save-form-description"
              v-model="description"
              rows="3"
              :maxlength="maxDescriptionLength"
            ></textarea>
          </div>

          <div class="save-form-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">{{ t("common.cancel") }}</button>
            <button type="submit" class="btn btn-primary">
              {{ mode === "edit" ? t("saved.saveChanges") : t("saved.save") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { getCategoryIcon, getCategoryLabelKey, SELECTABLE_CATEGORIES } from "../utils/placeCategory";

const MAX_DESCRIPTION_LENGTH = 300;

export default {
  name: "SaveLocationForm",

  components: { AppIcon },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "create", // "create" | "edit"
    },
    initialName: {
      type: String,
      default: "",
    },
    initialCategory: {
      type: String,
      default: "generic",
    },
    initialDescription: {
      type: String,
      default: "",
    },
    fallbackName: {
      type: String,
      default: "",
    },
  },

  emits: ["save", "cancel"],

  data() {
    return {
      name: this.initialName,
      category: this.initialCategory,
      description: this.initialDescription,
      maxDescriptionLength: MAX_DESCRIPTION_LENGTH,
      categoryOptions: SELECTABLE_CATEGORIES.map((key) => ({
        key,
        icon: getCategoryIcon(key),
        labelKey: getCategoryLabelKey(key),
      })),
    };
  },

  watch: {
    open(value) {
      if (value) {
        this.name = this.initialName;
        this.category = this.initialCategory || "generic";
        this.description = this.initialDescription;
      }
    },
  },

  methods: {
    t,

    submit() {
      this.$emit("save", {
        name: this.name.trim(),
        category: this.category,
        description: this.description.trim(),
      });
    },
  },
};
</script>

<style scoped>
.save-form-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3050;
}

.save-form-modal {
  width: min(420px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 22px 24px 26px;
}

.save-form-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.save-form-modal__header h2 {
  margin: 0;
  font-size: 18px;
}

.save-form-modal__body textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.save-form-modal__body textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(30, 27, 75, 0.15);
}

.save-form-count {
  float: inline-end;
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 11.5px;
}

.save-form-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.save-form-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
}

.save-form-icon:hover {
  background: var(--bg-primary);
}

.save-form-icon.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: #fff;
}

.save-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
</style>
