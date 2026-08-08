<template>
  <div class="floating-panel account-settings-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("account.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <section class="account-section">
        <h3>{{ t("account.name.title") }}</h3>

        <div v-if="!nameEditing" class="account-row">
          <span class="account-row__value">{{ authState.user ? authState.user.name : "" }}</span>
          <button type="button" class="btn btn-secondary account-change-btn" @click="startNameEdit">
            {{ t("account.change") }}
          </button>
        </div>

        <div v-else class="account-inline-form">
          <div class="form-group">
            <label for="account-name">{{ t("account.name.label") }}</label>
            <input id="account-name" v-model.trim="nameDraft" type="text" autocomplete="name" />
          </div>
          <div class="account-inline-actions">
            <button type="button" class="btn btn-secondary" @click="cancelNameEdit">
              {{ t("common.cancel") }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="nameSaving || !nameDraft.trim()"
              @click="saveName"
            >
              {{ t("account.name.save") }}
            </button>
          </div>
        </div>
      </section>

      <section class="account-section">
        <div class="account-row">
          <span class="account-row__value">{{ t("account.password.label") }}</span>
          <button type="button" class="btn btn-secondary account-change-btn" @click="openPasswordModal">
            {{ t("account.change") }}
          </button>
        </div>
      </section>

      <section class="account-section account-section--danger">
        <h3>{{ t("account.delete.title") }}</h3>
        <p class="account-danger-warning">{{ t("account.delete.warning") }}</p>
        <button type="button" class="btn btn-danger btn-block" @click="openDeleteModal">
          {{ t("account.delete.button") }}
        </button>
      </section>
    </div>

    <Transition name="modal-fade">
      <div v-if="passwordModalOpen" class="account-modal-backdrop" @mousedown.self="closePasswordModal">
        <div class="account-modal" role="dialog" aria-modal="true">
          <h2 class="account-modal__title">{{ t("account.password.title") }}</h2>

          <div class="form-group">
            <label for="account-current-password">{{ t("account.password.current") }}</label>
            <div class="password-field">
              <input
                id="account-current-password"
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showCurrentPassword ? 'account.password.hide' : 'account.password.show')"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <AppIcon :name="showCurrentPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="passwordErrors.currentPassword" class="field-error">{{ passwordErrors.currentPassword }}</span>
          </div>

          <div class="form-group">
            <label for="account-new-password">{{ t("account.password.new") }}</label>
            <div class="password-field">
              <input
                id="account-new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showNewPassword ? 'account.password.hide' : 'account.password.show')"
                @click="showNewPassword = !showNewPassword"
              >
                <AppIcon :name="showNewPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="passwordErrors.newPassword" class="field-error">{{ passwordErrors.newPassword }}</span>
          </div>

          <div class="form-group">
            <label for="account-confirm-password">{{ t("account.password.confirm") }}</label>
            <div class="password-field">
              <input
                id="account-confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showConfirmPassword ? 'account.password.hide' : 'account.password.show')"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <AppIcon :name="showConfirmPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="passwordErrors.confirmPassword" class="field-error">{{ passwordErrors.confirmPassword }}</span>
          </div>

          <p v-if="passwordFormError" class="field-error account-form-error">{{ passwordFormError }}</p>

          <div class="account-modal__actions">
            <button type="button" class="btn btn-secondary" @click="closePasswordModal">
              {{ t("common.cancel") }}
            </button>
            <button type="button" class="btn btn-primary" :disabled="passwordSaving" @click="savePassword">
              {{ t("account.password.save") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="deleteModalOpen" class="account-modal-backdrop" @mousedown.self="closeDeleteModal">
        <div class="account-modal" role="alertdialog" aria-modal="true">
          <h2 class="account-modal__title account-modal__title--danger">{{ t("account.delete.confirmTitle") }}</h2>
          <p class="account-modal__message">{{ t("account.delete.warning") }}</p>
          <p class="account-modal__message account-modal__message--strong">{{ t("account.delete.confirmMessage") }}</p>

          <div class="form-group">
            <label for="account-delete-password">{{ t("account.delete.passwordLabel") }}</label>
            <input
              id="account-delete-password"
              v-model="deletePassword"
              type="password"
              autocomplete="current-password"
            />
          </div>

          <p v-if="deleteError" class="field-error">{{ deleteError }}</p>

          <div class="account-modal__actions">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">
              {{ t("common.cancel") }}
            </button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="handleDeleteAccount">
              {{ t("account.delete.confirmButton") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import httpClient from "../services/httpClient";
import { pushToast } from "../store/toast";
import { authState, updateUserName, logout } from "../store/auth";

// Same password strength rule enforced by the backend (StrongPasswordValidator):
// at least 8 characters, one uppercase, one lowercase, and a special character from @ # $ % ! *
const STRONG_PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%!&*]).{8,}$/;

export default {
  name: "AccountSettingsPanel",

  components: { AppIcon },

  emits: ["close", "account-deleted"],

  data() {
    return {
      authState,

      nameEditing: false,
      nameDraft: "",
      nameSaving: false,

      passwordModalOpen: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      passwordErrors: {},
      passwordFormError: "",
      passwordSaving: false,

      deleteModalOpen: false,
      deletePassword: "",
      deleteError: "",
      deleting: false,
    };
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    t,

    handleKeydown(event) {
      if (event.key !== "Escape") return;
      if (this.passwordModalOpen) this.closePasswordModal();
      else if (this.deleteModalOpen) this.closeDeleteModal();
    },

    startNameEdit() {
      this.nameDraft = authState.user ? authState.user.name || "" : "";
      this.nameEditing = true;
    },

    cancelNameEdit() {
      this.nameEditing = false;
    },

    async saveName() {
      const trimmed = this.nameDraft.trim();
      if (!trimmed) return;

      this.nameSaving = true;
      try {
        await httpClient.put("/api/users/me/name", { name: trimmed });
        updateUserName(trimmed);
        pushToast(t("account.name.updated"), "success");
        this.nameEditing = false;
      } catch (err) {
        console.error("Failed to update name:", err);
        pushToast(t("account.name.error"), "error");
      } finally {
        this.nameSaving = false;
      }
    },

    openPasswordModal() {
      this.passwordModalOpen = true;
    },

    closePasswordModal() {
      this.passwordModalOpen = false;
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmPassword = "";
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.passwordErrors = {};
      this.passwordFormError = "";
    },

    validatePasswordForm() {
      const errors = {};

      if (!this.currentPassword) errors.currentPassword = t("auth.errors.required");

      if (!this.newPassword) {
        errors.newPassword = t("auth.errors.required");
      } else if (!STRONG_PASSWORD_RE.test(this.newPassword)) {
        errors.newPassword = t("account.password.errorWeak");
      }

      if (!this.confirmPassword) {
        errors.confirmPassword = t("auth.errors.required");
      } else if (this.newPassword && this.confirmPassword !== this.newPassword) {
        errors.confirmPassword = t("auth.errors.passwordMismatch");
      }

      this.passwordErrors = errors;
      return Object.keys(errors).length === 0;
    },

    async savePassword() {
      this.passwordFormError = "";
      if (!this.validatePasswordForm()) return;

      this.passwordSaving = true;
      try {
        await httpClient.put("/api/users/me/password", {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword,
        });

        pushToast(t("account.password.updated"), "success");
        this.closePasswordModal();
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) this.passwordFormError = t("account.password.errorWrongCurrent");
        else if (status === 400) this.passwordFormError = t("account.password.errorMismatch");
        else this.passwordFormError = t("account.password.errorGeneric");
      } finally {
        this.passwordSaving = false;
      }
    },

    openDeleteModal() {
      this.deleteModalOpen = true;
    },

    closeDeleteModal() {
      this.deleteModalOpen = false;
      this.deletePassword = "";
      this.deleteError = "";
    },

    async handleDeleteAccount() {
      this.deleteError = "";
      if (!this.deletePassword) {
        this.deleteError = t("auth.errors.required");
        return;
      }

      this.deleting = true;
      try {
        await httpClient.delete("/api/users/me", { data: { password: this.deletePassword } });
        logout();
        this.deleteModalOpen = false;
        pushToast(t("account.delete.success"), "success");
        this.$emit("account-deleted");
      } catch (err) {
        const status = err.response?.status;
        this.deleteError = status === 401 ? t("account.delete.errorWrongPassword") : t("account.delete.errorGeneric");
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>

<style scoped>
.account-section {
  margin-bottom: 22px;
}

.account-section:last-child {
  margin-bottom: 0;
}

.account-section h3 {
  font-size: 13.5px;
  margin: 0 0 10px;
  font-weight: 700;
}

.account-section--danger {
  padding-top: 16px;
  border-top: 1px solid var(--color-danger);
}

.account-section--danger h3 {
  color: var(--color-danger);
}

.account-danger-warning {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.account-form-error {
  margin: -6px 0 12px;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.account-row__value {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-change-btn {
  flex-shrink: 0;
  padding: 7px 14px;
  font-size: 12.5px;
}

.account-inline-form .form-group {
  margin-bottom: 12px;
}

.account-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.password-field {
  position: relative;
}

.password-field input {
  width: 100%;
  padding-inline-end: 42px;
}

.password-toggle-btn {
  position: absolute;
  inset-inline-end: 3px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.password-toggle-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.password-toggle-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.account-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 16px;
}

.account-modal {
  width: min(400px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 22px 24px 24px;
}

.account-modal__title {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
}

.account-modal__title--danger {
  color: var(--color-danger);
}

.account-modal__message {
  margin: -6px 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.account-modal__message--strong {
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

.account-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}
</style>
