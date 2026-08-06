<template>
  <AppHeader
    :current-menu="currentMenu"
    @change-menu="setMenu"
    @open-auth="openAuth"
    @account-interact="clearMapSelection"
    @header-interact="clearMapSelection"
  />

  <MapView
    ref="mapView"
    :current-menu="currentMenu"
    @change-menu="setMenu"
    @require-auth="handleRequireAuth"
    @account-deleted="handleAccountDeleted"
  />

  <AuthModal :open="showAuthModal" :initial-mode="authModalMode" :note="authModalNote" @close="showAuthModal = false" />

  <ConfirmDialog />
  <ToastContainer />
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import MapView from "./components/MapView.vue";
import AuthModal from "./components/AuthModal.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { t } from "./i18n";
import { isLoggedIn } from "./store/auth";

export default {
  name: "App",

  components: {
    AppHeader,
    MapView,
    AuthModal,
    ConfirmDialog,
    ToastContainer,
  },

  data() {
    return {
      currentMenu: null,
      showAuthModal: false,
      authModalMode: "login",
      authModalNote: "",
    };
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    // اسم يطابق currentMenu الحالي يغلقه (تبديل)، أي اسم آخر يفتحه ويغلق البقية
    setMenu(name) {
      if (name === "savedLocations" && !isLoggedIn()) {
        this.handleRequireAuth();
        return;
      }
      this.clearMapSelection();
      this.currentMenu = this.currentMenu === name ? null : name;
    },

    openAuth(mode) {
      this.clearMapSelection();
      this.authModalMode = mode === "register" ? "register" : "login";
      this.authModalNote = "";
      this.showAuthModal = true;
    },

    handleRequireAuth() {
      this.clearMapSelection();
      this.authModalMode = "login";
      this.authModalNote = t("auth.loginRequiredLocations");
      this.showAuthModal = true;
    },

    handleAccountDeleted() {
      this.clearMapSelection();
      this.authModalMode = "login";
      this.authModalNote = t("account.deleteSuccessNote");
      this.showAuthModal = true;
    },

    clearMapSelection() {
      if (this.$refs.mapView) this.$refs.mapView.clearTemporarySelection();
    },

    handleKeydown(event) {
      if (event.key !== "Escape") return;

      if (this.showAuthModal) {
        this.showAuthModal = false;
        return;
      }

      if (this.$refs.mapView && this.$refs.mapView.closeSaveFormIfOpen()) {
        return;
      }

      if (this.currentMenu) {
        this.currentMenu = null;
      }
    },
  },
};
</script>
