<template>
  <Transition name="modal-fade">
    <div
      v-if="confirmState.visible"
      class="confirm-backdrop"
      @mousedown.self="handleCancel"
    >
      <div class="confirm-modal" role="alertdialog" aria-modal="true">
        <h2 v-if="confirmState.title" class="confirm-modal__title">{{ confirmState.title }}</h2>
        <p class="confirm-modal__message">{{ confirmState.message }}</p>

        <div class="confirm-modal__actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            {{ confirmState.cancelText }}
          </button>
          <button
            type="button"
            class="btn"
            :class="confirmState.isDangerous ? 'btn-danger' : 'btn-primary'"
            @click="handleConfirm"
          >
            {{ confirmState.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { confirmState, resolveConfirm } from "../composables/useConfirm";

export default {
  name: "ConfirmDialog",

  data() {
    return { confirmState };
  },

  watch: {
    "confirmState.visible"(isVisible) {
      if (isVisible) {
        document.addEventListener("keydown", this.handleKeydown);
      } else {
        document.removeEventListener("keydown", this.handleKeydown);
      }
    },
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    handleKeydown(event) {
      if (event.key === "Escape") this.handleCancel();
    },

    handleCancel() {
      resolveConfirm(false);
    },

    handleConfirm() {
      resolveConfirm(true);
    },
  },
};
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3500;
  padding: 16px;
}

.confirm-modal {
  width: min(380px, 100%);
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 20px 22px;
}

.confirm-modal__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
}

.confirm-modal__message {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.confirm-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>
