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

        <p v-if="note && mode !== 'forgot'" class="auth-modal__note">{{ note }}</p>

        <form v-if="mode !== 'forgot'" class="auth-modal__body" @submit.prevent="submit" novalidate>
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
            <input id="auth-password" v-model="form.password" type="password" autocomplete="current-password" />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <div v-if="mode === 'register'" class="form-group">
            <label for="auth-confirm">{{ t("auth.confirmPassword") }}</label>
            <input id="auth-confirm" v-model="form.confirmPassword" type="password" autocomplete="new-password" />
            <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
          </div>

          <div v-if="mode === 'login'" class="auth-modal__forgot">
            <button type="button" class="auth-modal__link" @click="mode = 'forgot'">
              {{ t("auth.forgotPassword") }}
            </button>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            {{ mode === "login" ? t("auth.loginButton") : t("auth.registerButton") }}
          </button>
        </form>

        <form v-else class="auth-modal__body" @submit.prevent="submitForgot" novalidate>
          <p class="auth-modal__hint">{{ t("auth.forgotHint") }}</p>

          <div class="form-group">
            <label for="auth-forgot-email">{{ t("auth.email") }}</label>
            <input id="auth-forgot-email" v-model.trim="forgotEmail" type="email" autocomplete="email" />
            <span v-if="forgotError" class="field-error">{{ forgotError }}</span>
          </div>

          <p v-if="forgotSubmitted" class="auth-modal__note">{{ t("auth.forgotConfirmation") }}</p>

          <button type="submit" class="btn btn-primary btn-block">{{ t("auth.forgotSubmit") }}</button>
        </form>

        <button v-if="mode !== 'forgot'" type="button" class="auth-modal__switch" @click="switchMode">
          {{ mode === "login" ? t("auth.switchToRegister") : t("auth.switchToLogin") }}
        </button>
        <button v-else type="button" class="auth-modal__switch" @click="backToLogin">
          {{ t("auth.backToLogin") }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { mockLogin, mockRegister } from "../store/auth";
import { pushToast } from "../store/toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm() {
  return { name: "", email: "", password: "", confirmPassword: "" };
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
  },

  emits: ["close"],

  data() {
    return {
      mode: "login",
      form: emptyForm(),
      errors: {},
      forgotEmail: "",
      forgotError: "",
      forgotSubmitted: false,
    };
  },

  computed: {
    modeTitle() {
      if (this.mode === "register") return t("auth.registerTitle");
      if (this.mode === "forgot") return t("auth.forgotTitle");
      return t("auth.loginTitle");
    },
  },

  watch: {
    open(value) {
      if (value) {
        this.mode = this.initialMode === "register" ? "register" : "login";
        this.form = emptyForm();
        this.errors = {};
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
    },

    backToLogin() {
      this.mode = "login";
      this.forgotError = "";
    },

    // تدفق استعادة كلمة المرور هنا واجهي بحت ومعزول عمدًا (بدون رمز إعادة
    // تعيين حقيقي أو بريد فعلي) حتى يسهل استبداله لاحقًا بخدمة Spring Boot
    submitForgot() {
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
      this.forgotSubmitted = true;
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
      } else if (this.form.password.length < 6) {
        errors.password = t("auth.errors.passwordLength");
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

    submit() {
      if (!this.validate()) return;

      // ملاحظة: هذا تسجيل دخول/تسجيل وهمي محليًا فقط (بدون كلمة مرور حقيقية تُخزَّن)
      if (this.mode === "login") {
        mockLogin({ email: this.form.email });
        pushToast(t("auth.loginSuccess"), "success");
      } else {
        mockRegister({ name: this.form.name, email: this.form.email });
        pushToast(t("auth.registerSuccess"), "success");
      }

      this.close();
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
</style>
