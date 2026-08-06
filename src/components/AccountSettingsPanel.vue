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
        <div class="form-group">
          <label for="account-name">{{ t("account.name.label") }}</label>
          <input id="account-name" v-model.trim="name" type="text" autocomplete="name" />
        </div>
        <button
          type="button"
          class="btn btn-primary btn-block"
          :disabled="nameSaving || !name.trim()"
          @click="saveName"
        >
          {{ t("account.name.save") }}
        </button>
      </section>

      <section class="account-section">
        <h3>{{ t("account.password.title") }}</h3>

        <div class="form-group">
          <label for="account-current-password">{{ t("account.password.current") }}</label>
          <input
            id="account-current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
          />
          <span v-if="passwordErrors.currentPassword" class="field-error">{{ passwordErrors.currentPassword }}</span>
        </div>

        <div class="form-group">
          <label for="account-new-password">{{ t("account.password.new") }}</label>
          <input id="account-new-password" v-model="newPassword" type="password" autocomplete="new-password" />
          <span v-if="passwordErrors.newPassword" class="field-error">{{ passwordErrors.newPassword }}</span>
        </div>

        <div class="form-group">
          <label for="account-confirm-password">{{ t("account.password.confirm") }}</label>
          <input
            id="account-confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
          />
          <span v-if="passwordErrors.confirmPassword" class="field-error">{{ passwordErrors.confirmPassword }}</span>
        </div>

        <p v-if="passwordFormError" class="field-error account-form-error">{{ passwordFormError }}</p>

        <button type="button" class="btn btn-primary btn-block" :disabled="passwordSaving" @click="savePassword">
          {{ t("account.password.save") }}
        </button>
      </section>

      <section class="account-section account-section--danger">
        <h3>{{ t("account.delete.title") }}</h3>
        <p class="account-danger-warning">{{ t("account.delete.warning") }}</p>

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

        <button type="button" class="btn btn-danger btn-block" :disabled="deleting" @click="handleDeleteAccount">
          {{ t("account.delete.button") }}
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import httpClient from "../services/httpClient";
import { confirm } from "../composables/useConfirm";
import { pushToast } from "../store/toast";
import { authState, updateUserName, logout } from "../store/auth";

export default {
  name: "AccountSettingsPanel",

  components: { AppIcon },

  emits: ["close", "account-deleted"],

  data() {
    return {
      name: authState.user ? authState.user.name || "" : "",
      nameSaving: false,

      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      passwordErrors: {},
      passwordFormError: "",
      passwordSaving: false,

      deletePassword: "",
      deleteError: "",
      deleting: false,
    };
  },

  methods: {
    t,

    async saveName() {
      const trimmed = this.name.trim();
      if (!trimmed) return;

      this.nameSaving = true;
      try {
        await httpClient.put("/api/users/me/name", { name: trimmed });
        updateUserName(trimmed);
        pushToast(t("account.name.updated"), "success");
      } catch (err) {
        console.error("Failed to update name:", err);
        pushToast(t("account.name.error"), "error");
      } finally {
        this.nameSaving = false;
      }
    },

    validatePasswordForm() {
      const errors = {};

      if (!this.currentPassword) errors.currentPassword = t("auth.errors.required");
      if (!this.newPassword) errors.newPassword = t("auth.errors.required");
      if (!this.confirmPassword) errors.confirmPassword = t("auth.errors.required");

      if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
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

        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.passwordErrors = {};
        pushToast(t("account.password.updated"), "success");
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) this.passwordFormError = t("account.password.errorWrongCurrent");
        else if (status === 400) this.passwordFormError = t("account.password.errorMismatch");
        else this.passwordFormError = t("account.password.errorGeneric");
      } finally {
        this.passwordSaving = false;
      }
    },

    async handleDeleteAccount() {
      this.deleteError = "";
      if (!this.deletePassword) {
        this.deleteError = t("auth.errors.required");
        return;
      }

      const confirmed = await confirm({
        title: t("account.delete.confirmTitle"),
        message: t("account.delete.confirmMessage"),
        isDangerous: true,
      });
      if (!confirmed) return;

      this.deleting = true;
      try {
        await httpClient.delete("/api/users/me", { data: { password: this.deletePassword } });
        logout();
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
</style>
