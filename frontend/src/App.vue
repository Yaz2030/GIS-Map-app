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

  <LandingPage v-if="showLanding" @get-started="landingDismissed = true" />

  <ConfirmDialog />
  <ToastContainer />
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import MapView from "./components/MapView.vue";
import AuthModal from "./components/AuthModal.vue";
import LandingPage from "./components/LandingPage.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { t } from "./i18n";
import { isLoggedIn } from "./store/auth";
import { checkEmailVerification } from "./composables/useEmailVerification";

export default {
  name: "App",

  components: {
    AppHeader,
    MapView,
    AuthModal,
    LandingPage,
    ConfirmDialog,
    ToastContainer,
  },

  data() {
    return {
      currentMenu: null,
      showAuthModal: false,
      authModalMode: "login",
      authModalNote: "",
      // Hidden for this session only (not localStorage); reverts to true
      // automatically after any reload as long as the user is still a guest, not logged in
      landingDismissed: false,
    };
  },

  computed: {
    showLanding() {
      return !isLoggedIn() && !this.landingDismissed;
    },
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
    checkEmailVerification({ onVerified: () => this.openAuth("login") });
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    // A name matching the current currentMenu closes it (toggle); any other name opens it and closes the rest
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
