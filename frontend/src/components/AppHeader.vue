<template>
  <header ref="headerEl" class="app-header" @click="handleHeaderClick">
    <div class="app-header__start">
      <button
        type="button"
        class="icon-btn header-icon-btn"
        :class="{ active: currentMenu === 'settings' }"
        :aria-label="t('header.settings')"
        :aria-pressed="currentMenu === 'settings'"
        @click="handleSettingsClick"
      >
        <AppIcon name="settings" :size="22" />
      </button>
    </div>

    <div class="app-header__brand">
      <img :src="logoUrl" class="app-header__logo" :alt="t('app.name')" />
    </div>

    <div class="app-header__end">
      <button
        v-if="isAdmin"
        type="button"
        class="icon-btn header-icon-btn"
        :class="{ active: currentMenu === 'adminPanel' }"
        :aria-label="t('admin.title')"
        :aria-pressed="currentMenu === 'adminPanel'"
        @click="handleAdminClick"
      >
        <AppIcon name="shield" :size="20" />
      </button>

      <div class="account-wrapper">
        <button
          type="button"
          class="account-btn"
          :aria-label="t('header.account')"
          :aria-expanded="accountMenuOpen"
          @click="handleAccountClick"
        >
          <span class="account-btn__avatar"><AppIcon name="user" :size="16" /></span>
          <span class="account-btn__label">{{ accountLabel }}</span>
        </button>

        <Transition name="panel-pop">
          <div v-if="accountMenuOpen" class="main-menu account-menu">
            <template v-if="isLoggedIn">
              <div class="account-menu__info">
                <span class="account-menu__name">{{ authState.user.name }}</span>
                <span class="account-menu__email">{{ authState.user.email }}</span>
              </div>
              <button type="button" class="list-item" @click="handleAccountSettingsClick">
                <span class="list-item__icon"><AppIcon name="settings" :size="18" /></span>
                <span class="list-item__name">{{ t("account.menuItem") }}</span>
              </button>
              <button type="button" class="list-item danger" @click="handleLogout">
                <span class="list-item__icon"><AppIcon name="logout" :size="18" /></span>
                <span class="list-item__name">{{ t("header.logout") }}</span>
              </button>
            </template>
            <template v-else>
              <button type="button" class="list-item" @click="handleLoginClick">
                <span class="list-item__icon"><AppIcon name="login" :size="18" /></span>
                <span class="list-item__name">{{ t("header.login") }}</span>
              </button>
              <button type="button" class="list-item" @click="handleRegisterClick">
                <span class="list-item__icon"><AppIcon name="user" :size="18" /></span>
                <span class="list-item__name">{{ t("header.register") }}</span>
              </button>
            </template>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import { authState, logout } from "../store/auth";
import { pushToast } from "../store/toast";
import wakebLogo from "../assets/images/wakeb-logo-white.svg";

export default {
  name: "AppHeader",

  components: { AppIcon },

  props: {
    currentMenu: {
      type: String,
      default: null,
    },
  },

  emits: ["change-menu", "open-auth", "account-interact", "header-interact"],

  data() {
    return {
      logoUrl: wakebLogo,
      authState,
      accountMenuOpen: false,
    };
  },

  computed: {
    isLoggedIn() {
      return !!this.authState.user;
    },

    isAdmin() {
      return this.authState.user?.role === "ADMIN";
    },

    accountLabel() {
      if (!this.isLoggedIn) return t("header.guest");
      return this.authState.user.name || this.authState.user.email;
    },
  },

  mounted() {
    document.addEventListener("mousedown", this.handleOutsideClick);
  },

  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClick);
  },

  methods: {
    t,

    handleOutsideClick(event) {
      if (this.$refs.headerEl && !this.$refs.headerEl.contains(event.target)) {
        this.accountMenuOpen = false;
      }
    },

    handleHeaderClick() {
      this.$emit("header-interact");
    },

    handleSettingsClick() {
      this.accountMenuOpen = false;
      this.$emit("change-menu", "settings");
    },

    handleAdminClick() {
      this.accountMenuOpen = false;
      this.$emit("change-menu", "adminPanel");
    },

    handleAccountSettingsClick() {
      this.accountMenuOpen = false;
      this.$emit("change-menu", "accountSettings");
    },

    handleLoginClick() {
      this.accountMenuOpen = false;
      this.$emit("open-auth", "login");
    },

    handleRegisterClick() {
      this.accountMenuOpen = false;
      this.$emit("open-auth", "register");
    },

    handleLogout() {
      logout();
      pushToast(t("auth.logoutSuccess"), "success");
      this.accountMenuOpen = false;
    },

    handleAccountClick() {
      this.$emit("account-interact");
      this.accountMenuOpen = !this.accountMenuOpen;
    },
  },
};
</script>

<style scoped>
.app-header {
  flex: 0 0 var(--header-height);
  height: var(--header-height);
  background: var(--header-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 16px;
  position: relative;
  z-index: 2000;
  box-shadow: var(--header-shadow);
}

.app-header__start,
.app-header__end {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.app-header__end {
  justify-content: flex-end;
}

.app-header__brand {
  display: flex;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* Wide text logo (98x25), not a square mark — sized by height to preserve its
   original aspect ratio instead of squaring it, especially now that it's the
   only brand element in the header */
.app-header__logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.account-wrapper {
  position: relative;
}

.header-icon-btn {
  width: 40px;
  height: 40px;
  color: #fff;
}

.header-icon-btn:hover,
.header-icon-btn.active {
  background: rgba(255, 255, 255, 0.16);
}

.main-menu {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-start: 0;
  width: 230px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: 6px;
  color: var(--text-primary);
}

.account-menu {
  /* Anchored to the account button's outer edge and expands toward the
     center, so it always stays within screen bounds whether the button is at
     the far right (LTR) or far left (RTL) */
  inset-inline-start: auto;
  inset-inline-end: 0;
  width: 180px;
  max-width: calc(100vw - 32px);
}

.list-item.danger {
  color: var(--color-danger);
}

.account-menu__info {
  padding: 8px 10px 10px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-menu__name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.account-menu__email {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: var(--radius-sm);
  padding-block: 6px;
  padding-inline: 6px 12px;
  cursor: pointer;
  font-size: 13.5px;
  max-width: 180px;
}

.account-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.account-btn__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.account-btn__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
