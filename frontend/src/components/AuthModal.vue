<template>
  <Transition name="modal-fade">
    <div v-if="open" class="auth-backdrop" @mousedown.self="close">
      <div class="auth-modal" role="dialog" aria-modal="true">
        <div class="auth-modal__header">
          <h2>{{ modeTitle }}</h2>
          <button type="button" class="icon-btn" :aria-label="t('auth.close')" @click="close">
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <p v-if="note && (mode === 'login' || mode === 'register')" class="auth-modal__note">{{ note }}</p>

        <form
          v-if="mode === 'login' || mode === 'register'"
          class="auth-modal__body"
          @submit.prevent="submit"
          novalidate
        >
          <p v-if="formError" class="field-error auth-modal__form-error">{{ formError }}</p>
          <div v-if="mode === 'register'" class="form-group">
            <label for="auth-name">{{ t("auth.fullName") }}</label>
            <input id="auth-name" v-model.trim="form.name" type="text" autocomplete="name" />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="auth-email">{{ t("auth.email") }}</label>
            <input id="auth-email" v-model.trim="form.email" type="email" autocomplete="email" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="auth-password">{{ t("auth.password") }}</label>
            <div class="password-field">
              <input
                id="auth-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')"
                @click="showPassword = !showPassword"
              >
                <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <div v-if="mode === 'register'" class="form-group">
            <label for="auth-confirm">{{ t("auth.confirmPassword") }}</label>
            <div class="password-field">
              <input
                id="auth-confirm"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showConfirmPassword ? 'auth.hidePassword' : 'auth.showPassword')"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <AppIcon :name="showConfirmPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
          </div>

          <div v-if="mode === 'login'" class="auth-modal__forgot">
            <button type="button" class="auth-modal__link" @click="mode = 'forgot'">
              {{ t("auth.forgotPassword") }}
            </button>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
            {{ mode === "login" ? t("auth.loginButton") : t("auth.registerButton") }}
          </button>
        </form>

        <form v-else-if="mode === 'forgot'" class="auth-modal__body" @submit.prevent="submitForgot" novalidate>
          <p class="auth-modal__hint">{{ t("auth.forgotHint") }}</p>

          <div class="form-group">
            <label for="auth-forgot-email">{{ t("auth.email") }}</label>
            <input id="auth-forgot-email" v-model.trim="forgotEmail" type="email" autocomplete="email" />
            <span v-if="forgotError" class="field-error">{{ forgotError }}</span>
          </div>

          <p v-if="forgotSubmitted" class="auth-modal__note">{{ t("auth.forgotConfirmation") }}</p>

          <button type="submit" class="btn btn-primary btn-block" :disabled="forgotSubmitting">
            {{ t("auth.forgotSubmit") }}
          </button>
        </form>

        <form v-else-if="mode === 'reset'" class="auth-modal__body" @submit.prevent="submitReset" novalidate>
          <p v-if="formError" class="field-error auth-modal__form-error">{{ formError }}</p>
          <p class="auth-modal__hint">{{ t("auth.resetHint") }}</p>

          <div class="form-group">
            <label for="auth-reset-password">{{ t("auth.resetNewPassword") }}</label>
            <div class="password-field">
              <input
                id="auth-reset-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')"
                @click="showPassword = !showPassword"
              >
                <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="auth-reset-confirm">{{ t("auth.resetConfirmPassword") }}</label>
            <div class="password-field">
              <input
                id="auth-reset-confirm"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="t(showConfirmPassword ? 'auth.hidePassword' : 'auth.showPassword')"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <AppIcon :name="showConfirmPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
            {{ t("auth.resetSubmit") }}
          </button>
        </form>

        <button v-if="mode === 'login' || mode === 'register'" type="button" class="auth-modal__switch" @click="switchMode">
          {{ mode === "login" ? t("auth.switchToRegister") : t("auth.switchToLogin") }}
        </button>
        <button v-else-if="mode === 'forgot'" type="button" class="auth-modal__switch" @click="backToLogin">
          {{ t("auth.backToLogin") }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { login, register } from "../store/auth";
import httpClient from "../services/httpClient";
import { pushToast } from "../store/toast";
import { isStrongPassword } from "../utils/passwordStrength";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm() {
  return { name: "", email: "", password: "", confirmPassword: "" };
}

// Reads a field-specific validation message when the backend returns one
// (ErrorResponse.errors, e.g. { password: "..." } from @StrongPassword),
// falling back to the generic top-level message, then to a local fallback
function extractErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (data?.errors) {
    const firstFieldError = Object.values(data.errors)[0];
    if (firstFieldError) return firstFieldError;
  }
  return data?.message || fallback;
}

export default {
  name: "AuthModal",

  components: { AppIcon },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
    initialMode: {
      type: String,
      default: "login",
    },
    note: {
      type: String,
      default: "",
    },
    resetToken: {
      type: String,
      default: "",
    },
  },

  emits: ["close"],

  data() {
    return {
      mode: "login",
      form: emptyForm(),
      errors: {},
      formError: "",
      submitting: false,
      showPassword: false,
      showConfirmPassword: false,
      forgotEmail: "",
      forgotError: "",
      forgotSubmitted: false,
      forgotSubmitting: false,
    };
  },

  computed: {
    modeTitle() {
      if (this.mode === "register") return t("auth.registerTitle");
      if (this.mode === "forgot") return t("auth.forgotTitle");
      if (this.mode === "reset") return t("auth.resetTitle");
      return t("auth.loginTitle");
    },
  },

  watch: {
    open(value) {
      if (value) {
        this.mode =
          this.initialMode === "register" ? "register" : this.initialMode === "reset" ? "reset" : "login";
        this.form = emptyForm();
        this.errors = {};
        this.formError = "";
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.forgotEmail = "";
        this.forgotError = "";
        this.forgotSubmitted = false;
      }
    },
  },

  methods: {
    t,

    switchMode() {
      this.mode = this.mode === "login" ? "register" : "login";
      this.errors = {};
      this.formError = "";
    },

    backToLogin() {
      this.mode = "login";
      this.forgotError = "";
    },

    async submitForgot() {
      const email = this.forgotEmail.trim();

      if (!email) {
        this.forgotError = t("auth.errors.required");
        return;
      }
      if (!EMAIL_RE.test(email)) {
        this.forgotError = t("auth.errors.invalidEmail");
        return;
      }

      this.forgotError = "";
      this.forgotSubmitting = true;
      try {
        // The backend never reveals whether the email is registered (anti-enumeration);
        // it always returns the same generic success response, so there is no
        // "email not found" case to distinguish here by design.
        await httpClient.post("/api/users/forgot-password", { email });
        this.forgotSubmitted = true;
      } catch (err) {
        this.forgotError = extractErrorMessage(err, t("auth.errors.forgotSendFailed"));
      } finally {
        this.forgotSubmitting = false;
      }
    },

    async submitReset() {
      const errors = {};

      if (!this.form.password) {
        errors.password = t("auth.errors.required");
      } else if (!isStrongPassword(this.form.password)) {
        errors.password = t("account.password.errorWeak");
      }

      if (!this.form.confirmPassword) {
        errors.confirmPassword = t("auth.errors.required");
      } else if (this.form.password && this.form.confirmPassword !== this.form.password) {
        errors.confirmPassword = t("auth.errors.passwordMismatch");
      }

      this.errors = errors;
      if (Object.keys(errors).length > 0) return;

      this.formError = "";
      this.submitting = true;
      try {
        await httpClient.post("/api/users/reset-password", {
          token: this.resetToken,
          newPassword: this.form.password,
          confirmPassword: this.form.confirmPassword,
        });
        pushToast(t("auth.resetSuccess"), "success");
        this.mode = "login";
        this.form = emptyForm();
        this.errors = {};
      } catch (err) {
        const status = err.response?.status;
        this.formError =
          status === 401
            ? extractErrorMessage(err, t("auth.errors.resetTokenInvalid"))
            : extractErrorMessage(err, t("auth.errors.resetFailed"));
      } finally {
        this.submitting = false;
      }
    },

    validate() {
      const errors = {};

      if (this.mode === "register" && !this.form.name) {
        errors.name = t("auth.errors.required");
      }

      if (!this.form.email) {
        errors.email = t("auth.errors.required");
      } else if (!EMAIL_RE.test(this.form.email)) {
        errors.email = t("auth.errors.invalidEmail");
      }

      if (!this.form.password) {
        errors.password = t("auth.errors.required");
      } else if (this.mode === "register" && !isStrongPassword(this.form.password)) {
        errors.password = t("account.password.errorWeak");
      }

      if (this.mode === "register") {
        if (!this.form.confirmPassword) {
          errors.confirmPassword = t("auth.errors.required");
        } else if (this.form.confirmPassword !== this.form.password) {
          errors.confirmPassword = t("auth.errors.passwordMismatch");
        }
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },

    async submit() {
      if (!this.validate()) return;

      this.formError = "";
      this.submitting = true;

      try {
        if (this.mode === "login") {
          await login({ email: this.form.email, password: this.form.password });
          pushToast(t("auth.loginSuccess"), "success");
          this.close();
        } else {
          await register({ name: this.form.name, email: this.form.email, password: this.form.password });
          pushToast(t("auth.registerSuccess"), "success");
          this.close();
        }
      } catch (err) {
        const status = err.response?.status;

        if (this.mode === "login") {
          if (status === 403) {
            this.formError = t("auth.errors.emailNotVerified");
          } else if (status === 401) {
            this.formError = extractErrorMessage(err, t("auth.errors.invalidCredentials"));
          } else {
            this.formError = extractErrorMessage(err, t("auth.errors.loginFailed"));
          }
        } else {
          this.formError = extractErrorMessage(err, t("auth.errors.registerFailed"));
        }
      } finally {
        this.submitting = false;
      }
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.auth-modal {
  width: min(420px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 22px 24px 26px;
}

.auth-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.auth-modal__header h2 {
  margin: 0;
  font-size: 18px;
}

.auth-modal__note {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 16px;
}

.auth-modal__form-error {
  margin: 0 0 14px;
}

.auth-modal__forgot {
  text-align: end;
  margin: -6px 0 14px;
}

.auth-modal__link {
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 12.5px;
  cursor: pointer;
  padding: 0;
}

.auth-modal__link:hover {
  text-decoration: underline;
}

.auth-modal__hint {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 14px;
}

.auth-modal__switch {
  display: block;
  width: 100%;
  text-align: center;
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 13.5px;
  margin-top: 14px;
  cursor: pointer;
}

.auth-modal__switch:hover {
  text-decoration: underline;
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
</style>
