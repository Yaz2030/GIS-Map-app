<template>
  <main class="app-main">
    <div id="map"></div>

    <MapSidebar
      :current-menu="currentMenu"
      :locating="locating"
      @change-menu="$emit('change-menu', $event)"
      @my-location="handleMyLocation"
      @reset="handleReset"
    />

    <Transition name="panel-pop">
      <SearchPanel
        v-if="currentMenu === 'search'"
        key="search"
        :user-location="currentLocation"
        @select-result="handleSearchSelect"
        @close="$emit('change-menu', null)"
      />
    </Transition>

    <Transition name="panel-pop">
      <LayersPanel
        v-if="currentMenu === 'layers'"
        key="layers"
        :overlays="overlays"
        @toggle-overlay="toggleOverlay"
        @close="$emit('change-menu', null)"
      />
    </Transition>

    <Transition name="panel-pop">
      <SavedLocationsPanel
        v-if="currentMenu === 'savedLocations'"
        key="saved"
        @select-location="handleSavedSelect"
        @edit-location="openEditForm"
        @delete-location="handleDeleteLocationRequest"
        @close="$emit('change-menu', null)"
      />
    </Transition>

    <Transition name="panel-pop">
      <SettingsPanel v-if="currentMenu === 'settings'" key="settings" @close="$emit('change-menu', null)" />
    </Transition>

    <Transition name="panel-pop">
      <AccountSettingsPanel
        v-if="currentMenu === 'accountSettings'"
        key="accountSettings"
        @close="$emit('change-menu', null)"
        @account-deleted="handleAccountDeleted"
      />
    </Transition>

    <Transition name="panel-pop">
      <AdminPanel v-if="currentMenu === 'adminPanel'" key="adminPanel" @close="$emit('change-menu', null)" />
    </Transition>

    <RouteSummary :route="routeData" :loading="routeLoading" :error="routeError" @clear="clearRoute" />

    <SaveLocationForm
      :open="saveForm.open"
      :mode="saveForm.mode"
      :initial-name="saveFormInitialName"
      :initial-category="saveFormInitialCategory"
      :initial-description="saveFormInitialDescription"
      :fallback-name="saveFormFallbackName"
      @save="handleSaveFormSubmit"
      @cancel="closeSaveForm"
    />
  </main>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import MapSidebar from "./MapSidebar.vue";
import SearchPanel from "./SearchPanel.vue";
import LayersPanel from "./LayersPanel.vue";
import SavedLocationsPanel from "./SavedLocationsPanel.vue";
import SettingsPanel from "./SettingsPanel.vue";
import AccountSettingsPanel from "./AccountSettingsPanel.vue";
import AdminPanel from "./AdminPanel.vue";
import RouteSummary from "./RouteSummary.vue";
import SaveLocationForm from "./SaveLocationForm.vue";

import { t, currentLanguage } from "../i18n";
import { pushToast } from "../store/toast";
import { settingsState } from "../store/settings";
import { mapPreferencesState } from "../store/mapPreferences";
import {
  savedLocationsState,
  fetchSavedLocations,
  clearSavedLocations,
  saveLocation,
  updateLocation,
  deleteLocation,
  deleteLocationByCoords,
  findSavedByCoords,
} from "../store/savedLocations";
import { authState, isLoggedIn } from "../store/auth";
import { reverseGeocode, normalizePlace } from "../services/nominatimService";
import { fetchRoute } from "../services/routingService";
import { getCategoryIcon } from "../utils/placeCategory";
import { iconSvg } from "../utils/iconHtml";
import { escapeHtml } from "../utils/escapeHtml";
import { SAUDI_ARABIA_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM, MIN_ZOOM } from "../config/mapConfig";

const ROUTE_COLOR = "#1a73e8";
const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY || "";

export default {
  name: "MapView",

  components: {
    MapSidebar,
    SearchPanel,
    LayersPanel,
    SavedLocationsPanel,
    SettingsPanel,
    AccountSettingsPanel,
    AdminPanel,
    RouteSummary,
    SaveLocationForm,
  },

  props: {
    currentMenu: {
      type: String,
      default: null,
    },
  },

  emits: ["change-menu", "require-auth", "account-deleted"],

  data() {
    return {
      map: null,
      baseLayerInstances: null,

      tempMarker: null,
      savedMarkers: new Map(),
      selectionToken: 0,

      currentLocation: null,
      currentLocationMarker: null,
      locating: false,

      overlays: { saved: true, currentLocation: true, route: true },

      routeLine: null,
      routeData: null,
      routeLoading: false,
      routeError: null,

      saveForm: {
        open: false,
        mode: "create",
        place: null,
        target: null,
      },

      savedLocationsState,
      mapPreferencesState,
      settingsState,
      authState,
    };
  },

  computed: {
    saveFormInitialName() {
      if (this.saveForm.mode === "edit") return (this.saveForm.target && this.saveForm.target.name) || "";
      return (this.saveForm.place && this.saveForm.place.name) || "";
    },

    saveFormInitialCategory() {
      const source = this.saveForm.mode === "edit" ? this.saveForm.target : this.saveForm.place;
      return (source && source.category) || "generic";
    },

    saveFormInitialDescription() {
      if (this.saveForm.mode !== "edit") return "";
      return (this.saveForm.target && this.saveForm.target.description) || "";
    },

    saveFormFallbackName() {
      if (this.saveForm.mode === "edit") {
        const target = this.saveForm.target;
        return target ? target.name : "";
      }
      return (this.saveForm.place && this.saveForm.place.name) || t("popup.unknownPlace");
    },
  },

  watch: {
    "savedLocationsState.items": {
      handler() {
        this.syncSavedMarkers();
      },
      deep: true,
    },

    "mapPreferencesState.baseLayer"(newVal, oldVal) {
      this.switchBaseLayer(newVal, oldVal);
    },

    "settingsState.autoLocation"(enabled) {
      if (enabled) this.requestGeolocation({ silent: true, center: true });
    },

    "authState.user"(newUser, oldUser) {
      if (newUser && !oldUser) {
        this.loadSavedLocations();
      } else if (!newUser && oldUser) {
        clearSavedLocations();
      }
    },
  },

  mounted() {
    // minZoom على مستوى الخريطة نفسها يمنع المستخدم من التصغير لدرجة يتكرر
    // فيها العالم أفقيًا جنب بعضه (يحدث لأن Leaflet لا يمنع التصغير افتراضيًا
    // حتى تصير كل نسخة من العالم أضيق من حاوية الخريطة). نضيفه أيضًا على كل
    // طبقة أساسية على حدة (osm/dark/satellite) حتى لا تحاول أي طبقة تحميل
    // بلاطات أبعد من هذا الحد حتى لو تغيّرت قيمة الخريطة العامة لاحقًا
    this.map = L.map("map", { minZoom: MIN_ZOOM }).setView(
      [SAUDI_ARABIA_CENTER.lat, SAUDI_ARABIA_CENTER.lng],
      DEFAULT_ZOOM
    );

    this.baseLayerInstances = {
      osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: MIN_ZOOM,
      }),
      dark: L.tileLayer(
        `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png${STADIA_API_KEY ? `?api_key=${STADIA_API_KEY}` : ""}`,
        {
          attribution:
            '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> &copy; OpenStreetMap contributors',
          maxZoom: 20,
          minZoom: MIN_ZOOM,
        }
      ),
      // طبقة الأقمار الصناعية = تجميعة (imagery + شوارع + تسميات/حدود) بـ
      // layerGroup واحدة حتى تُفعَّل/تُطفأ كلها تلقائيًا مع اختيار/تبديل هذه
      // الطبقة الأساسية نفسها، دون أي حالة أو خيار قائمة منفصل لها.
      // الترتيب (zIndex تصاعديًا): الصور بالأسفل، شبكة الشوارع فوقها،
      // وحدود/أسماء الأحياء والمدن بالأعلى
      satellite: L.layerGroup([
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            maxZoom: 19,
            minZoom: MIN_ZOOM,
            zIndex: 1,
          }
        ),
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Roads &copy; Esri",
            maxZoom: 19,
            minZoom: MIN_ZOOM,
            zIndex: 2,
            className: "esri-reference-tile",
          }
        ),
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Labels &copy; Esri",
            maxZoom: 19,
            minZoom: MIN_ZOOM,
            zIndex: 3,
            className: "esri-reference-tile",
          }
        ),
      ]),
    };
    this.baseLayerInstances[this.mapPreferencesState.baseLayer].addTo(this.map);

    this.syncSavedMarkers();

    this.map.on("click", this.handleMapClick);
    this.map.on("popupopen", this.handlePopupOpen);

    // silent + center: false: يحدد موقع المستخدم وتُعرض علامته على الخريطة
    // فقط، دون أي تغيير لعرض/تكبير الخريطة — يبقى العرض الافتراضي عند فتح
    // التطبيق ثابتًا على السعودية (SAUDI_ARABIA_CENTER/DEFAULT_ZOOM) بغض
    // النظر عن نجاح تحديد الموقع. زر "موقعي الحالي" (handleMyLocation) هو
    // الوحيد الذي يمرّر center: true فيقوم بالـ zoom-in والتوسّط الفعلي.
    if (this.settingsState.autoLocation) {
      this.requestGeolocation({ silent: true, center: false });
    }

    if (isLoggedIn()) {
      this.loadSavedLocations();
    }
  },

  beforeUnmount() {
    if (!this.map) return;
    this.map.off("click", this.handleMapClick);
    this.map.off("popupopen", this.handlePopupOpen);
    this.map.remove();
    this.map = null;
  },

  methods: {
    t,

    // ---------------- base layers ----------------

    switchBaseLayer(newVal, oldVal) {
      if (!this.baseLayerInstances) return;
      if (oldVal && this.map.hasLayer(this.baseLayerInstances[oldVal])) {
        this.map.removeLayer(this.baseLayerInstances[oldVal]);
      }
      this.baseLayerInstances[newVal].addTo(this.map);
    },

    toggleOverlay(key) {
      this.overlays[key] = !this.overlays[key];

      if (key === "saved") {
        this.savedMarkers.forEach((marker) => {
          if (this.overlays.saved) marker.addTo(this.map);
          else this.map.removeLayer(marker);
        });
      } else if (key === "currentLocation" && this.currentLocationMarker) {
        if (this.overlays.currentLocation) this.currentLocationMarker.addTo(this.map);
        else this.map.removeLayer(this.currentLocationMarker);
      } else if (key === "route" && this.routeLine) {
        if (this.overlays.route) this.routeLine.addTo(this.map);
        else this.map.removeLayer(this.routeLine);
      }
    },

    // ---------------- marker icons ----------------

    buildMarkerIcon(category, isTemp = false) {
      const name = isTemp ? "map-pin" : getCategoryIcon(category);
      return L.divIcon({
        className: `app-marker${isTemp ? " app-marker--temp" : ""}`,
        html: `<div class="app-marker__pin"><span class="app-marker__icon">${iconSvg(name, { size: 15 })}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 28],
        popupAnchor: [0, -26],
      });
    },

    buildCurrentLocationIcon() {
      return L.divIcon({
        className: "current-location-icon",
        html: '<div class="current-location-marker"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    },

    // ---------------- saved markers sync ----------------

    syncSavedMarkers() {
      if (!this.map) return;
      const currentIds = new Set(this.savedLocationsState.items.map((item) => item.id));

      for (const [id, marker] of this.savedMarkers) {
        if (!currentIds.has(id)) {
          this.map.removeLayer(marker);
          this.savedMarkers.delete(id);
        }
      }

      this.savedLocationsState.items.forEach((item) => {
        const place = {
          lat: item.lat,
          lng: item.lng,
          name: item.name,
          category: item.category,
          isSaved: true,
          savedId: item.id,
        };

        let marker = this.savedMarkers.get(item.id);
        if (!marker) {
          marker = L.marker([item.lat, item.lng], { icon: this.buildMarkerIcon(item.category) });
          if (this.overlays.saved) marker.addTo(this.map);
          marker.bindPopup(this.buildPopupHtml(place));
          marker._place = place;
          this.savedMarkers.set(item.id, marker);
        } else {
          marker._place = place;
          marker.setIcon(this.buildMarkerIcon(item.category));
          marker.setPopupContent(this.buildPopupHtml(place));
          if (marker.isPopupOpen()) this.wirePopupButtons(marker.getPopup(), place);
        }
      });
    },

    // ---------------- saved locations API ----------------

    async loadSavedLocations() {
      try {
        await fetchSavedLocations();
      } catch (err) {
        console.error("Failed to load saved locations:", err);
        pushToast(t("saved.loadError"), "error");
      }
    },

    // ---------------- popup building ----------------

    buildLoadingPopupHtml() {
      return `<div class="map-popup"><p class="map-popup-address">${escapeHtml(t("popup.loading"))}</p></div>`;
    },

    buildPopupHtml(place) {
      const catIcon = getCategoryIcon(place.category);
      const name = escapeHtml(place.name || t("popup.unknownPlace"));
      const address = place.address ? escapeHtml(place.address) : "";
      const lat = Number(place.lat).toFixed(5);
      const lng = Number(place.lng).toFixed(5);

      const saveOrDelete = place.isSaved
        ? `<button type="button" data-action="delete" class="danger">${iconSvg("trash", { size: 14 })}${t("popup.delete")}</button>`
        : `<button type="button" data-action="save">${iconSvg("bookmark-plus", { size: 14 })}${t("popup.save")}</button>`;

      const cancelBtn = place.isSaved
        ? ""
        : `<button type="button" data-action="cancel">${iconSvg("x-circle", { size: 14 })}${t("popup.cancel")}</button>`;

      return `
        <div class="map-popup">
          <div class="map-popup-header">
            <span class="map-popup-icon">${iconSvg(catIcon, { size: 20 })}</span>
            <span class="map-popup-title">${name}</span>
          </div>
          ${address ? `<p class="map-popup-address">${address}</p>` : ""}
          <div class="map-popup-coords">
            <span>${t("popup.lat")}: ${lat}</span>
            <span>${t("popup.lng")}: ${lng}</span>
          </div>
          <div class="map-popup-actions">
            <button type="button" data-action="route" class="primary">${iconSvg("route", { size: 14 })}${t("popup.startRoute")}</button>
            ${saveOrDelete}
            ${cancelBtn}
          </div>
        </div>`;
    },

    handlePopupOpen(e) {
      const marker = e.popup._source;
      if (marker && marker._place) this.wirePopupButtons(e.popup, marker._place);
    },

    wirePopupButtons(popup, place) {
      const el = popup.getElement ? popup.getElement() : null;
      if (!el) return;

      const routeBtn = el.querySelector('[data-action="route"]');
      const saveBtn = el.querySelector('[data-action="save"]');
      const deleteBtn = el.querySelector('[data-action="delete"]');
      const cancelBtn = el.querySelector('[data-action="cancel"]');

      if (routeBtn) routeBtn.onclick = () => this.startRoute(place);
      if (saveBtn) saveBtn.onclick = () => this.handleSavePlace(place);
      if (deleteBtn) deleteBtn.onclick = () => this.handleDeletePlace(place);
      if (cancelBtn) cancelBtn.onclick = () => this.clearTemporarySelection();
    },

    // ---------------- temp marker / selection ----------------

    ensureTempMarker(lat, lng) {
      if (!this.tempMarker) {
        this.tempMarker = L.marker([lat, lng], { icon: this.buildMarkerIcon("generic", true) }).addTo(this.map);
      } else {
        this.tempMarker.setLatLng([lat, lng]);
      }
    },

    clearTempMarker() {
      if (this.tempMarker) {
        this.map.removeLayer(this.tempMarker);
        this.tempMarker = null;
      }
    },

    // مركزية: الدالة الوحيدة التي تُنهي أي تحديد مؤقت (بوب-أب + علامة مؤقتة)
    // يجب استدعاؤها عند التنقل لأي جزء آخر من التطبيق بدل تكرار نفس السطور
    clearTemporarySelection() {
      this.selectionToken += 1;
      this.map.closePopup();
      this.clearTempMarker();
    },

    showTempMarker(place) {
      this.ensureTempMarker(place.lat, place.lng);
      this.tempMarker._place = place;
      this.tempMarker.bindPopup(this.buildPopupHtml(place));
      this.tempMarker.openPopup();
      this.map.setView([place.lat, place.lng], Math.max(this.map.getZoom(), FOCUS_ZOOM));
    },

    // Centralizes "only one temporary selection can be active" for search
    // results and map clicks that land on an already-saved location.
    resolvePlaceSelection(place) {
      this.clearTemporarySelection();

      const saved = findSavedByCoords(place.lat, place.lng);
      if (saved) {
        this.map.setView([saved.lat, saved.lng], Math.max(this.map.getZoom(), FOCUS_ZOOM));
        const marker = this.savedMarkers.get(saved.id);
        if (marker) marker.openPopup();
        return;
      }
      this.showTempMarker(place);
    },

    // ---------------- map click / reverse geocoding ----------------

    async handleMapClick(e) {
      const { lat, lng } = e.latlng;
      this.clearTemporarySelection();
      const requestId = this.selectionToken;
      this.ensureTempMarker(lat, lng);

      const loadingPlace = { lat, lng, name: t("popup.loading"), address: "", category: "generic", isSaved: false };
      this.tempMarker._place = loadingPlace;
      this.tempMarker.bindPopup(this.buildLoadingPopupHtml());
      this.tempMarker.openPopup();

      try {
        const data = await reverseGeocode(lat, lng, currentLanguage());
        if (requestId !== this.selectionToken) return; // superseded by a newer selection

        const normalized = normalizePlace(data, lat, lng);
        const finalPlace = { ...normalized, name: normalized.name || t("popup.unknownPlace"), isSaved: false };

        if (!this.tempMarker) return;
        this.tempMarker._place = finalPlace;
        this.tempMarker.setPopupContent(this.buildPopupHtml(finalPlace));
        this.wirePopupButtons(this.tempMarker.getPopup(), finalPlace);
      } catch (err) {
        if (requestId !== this.selectionToken) return; // superseded by a newer selection

        console.error("Reverse geocoding error:", err);
        if (!this.tempMarker) return;
        const errorPlace = { ...loadingPlace, name: t("popup.loadError") };
        this.tempMarker._place = errorPlace;
        this.tempMarker.setPopupContent(this.buildPopupHtml(errorPlace));
        this.wirePopupButtons(this.tempMarker.getPopup(), errorPlace);
      }
    },

    // ---------------- search & saved list selection ----------------

    handleSearchSelect(result) {
      this.$emit("change-menu", null);
      this.resolvePlaceSelection({
        ...result,
        name: result.name || result.displayName || t("popup.unknownPlace"),
        isSaved: false,
      });
    },

    handleSavedSelect(item) {
      this.$emit("change-menu", null);
      this.clearTemporarySelection();
      this.map.setView([item.lat, item.lng], Math.max(this.map.getZoom(), FOCUS_ZOOM));
      const marker = this.savedMarkers.get(item.id);
      if (marker) marker.openPopup();
    },

    // ---------------- account settings ----------------

    handleAccountDeleted() {
      this.$emit("change-menu", null);
      this.$emit("account-deleted");
    },

    // ---------------- save / delete ----------------

    handleSavePlace(place) {
      if (!isLoggedIn()) {
        this.$emit("require-auth");
        return;
      }
      this.openSaveForm(place);
    },

    async handleDeletePlace(place) {
      try {
        const deleted = place.savedId
          ? await deleteLocation(place.savedId)
          : await deleteLocationByCoords(place.lat, place.lng);
        if (deleted) {
          pushToast(t("toast.locationDeleted"), "success");
          this.map.closePopup();
        }
      } catch (err) {
        console.error("Failed to delete location:", err);
        pushToast(t("toast.locationDeleteError"), "error");
      }
    },

    handleDeleteLocationRequest(item) {
      this.handleDeletePlace({ savedId: item.id, lat: item.lat, lng: item.lng });
    },

    // ---------------- save-location form (create / edit) ----------------

    openSaveForm(place) {
      this.saveForm = { open: true, mode: "create", place, target: null };
    },

    openEditForm(item) {
      this.saveForm = { open: true, mode: "edit", place: null, target: item };
    },

    closeSaveForm() {
      this.saveForm.open = false;
    },

    closeSaveFormIfOpen() {
      if (this.saveForm.open) {
        this.closeSaveForm();
        return true;
      }
      return false;
    },

    async handleSaveFormSubmit({ name, category, description }) {
      if (this.saveForm.mode === "edit") {
        const target = this.saveForm.target;
        if (!target) return;

        try {
          await updateLocation(target.id, {
            name: name || this.saveFormFallbackName,
            category,
            description,
          });
          pushToast(t("toast.locationUpdated"), "success");
          this.closeSaveForm();
        } catch (err) {
          console.error("Failed to update location:", err);
          pushToast(t("toast.locationUpdateError"), "error");
        }
        return;
      }

      const place = this.saveForm.place;
      if (!place) return;

      let result;
      try {
        result = await saveLocation({
          name: name || this.saveFormFallbackName,
          category: category || place.category,
          description,
          lat: place.lat,
          lng: place.lng,
        });
      } catch (err) {
        console.error("Failed to save location:", err);
        pushToast(t("toast.locationSaveError"), "error");
        this.closeSaveForm();
        return;
      }

      if (result.duplicate) {
        pushToast(t("toast.locationExists"), "error");
        this.closeSaveForm();
        return;
      }

      pushToast(t("toast.locationSaved"), "success");
      this.closeSaveForm();

      // Compare by coordinates, not object identity: this.tempMarker._place is
      // read back through Vue's reactive proxy (data() deep-wraps it), so it is
      // never === the plain `place` object the popup button closure captured.
      if (this.tempMarker && this.tempMarker._place && this.tempMarker._place.lat === place.lat && this.tempMarker._place.lng === place.lng) {
        this.clearTemporarySelection();
      }

      this.$nextTick(() => {
        const marker = this.savedMarkers.get(result.item.id);
        if (marker) marker.openPopup();
      });
    },

    // ---------------- geolocation ----------------

    handleMyLocation() {
      this.clearTemporarySelection();
      this.requestGeolocation({ center: true });
    },

    requestGeolocation({ silent = false, center = true, routeTarget = null } = {}) {
      if (!navigator.geolocation) {
        if (!silent) pushToast(t("geolocation.unsupported"), "error");
        return;
      }

      this.locating = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locating = false;
          this.currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          this.placeCurrentLocationMarker(this.currentLocation);

          if (center) {
            this.map.setView([this.currentLocation.lat, this.currentLocation.lng], Math.max(this.map.getZoom(), 14));
          }

          if (routeTarget) this.startRoute(routeTarget);
        },
        (err) => {
          this.locating = false;
          if (silent) return;

          if (err.code === err.PERMISSION_DENIED) pushToast(t("geolocation.denied"), "error");
          else pushToast(t("geolocation.error"), "error");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },

    placeCurrentLocationMarker(loc) {
      if (!this.currentLocationMarker) {
        this.currentLocationMarker = L.marker([loc.lat, loc.lng], {
          icon: this.buildCurrentLocationIcon(),
          zIndexOffset: 500,
        });
        if (this.overlays.currentLocation) this.currentLocationMarker.addTo(this.map);
      } else {
        this.currentLocationMarker.setLatLng([loc.lat, loc.lng]);
      }
    },

    // ---------------- routing ----------------

    async startRoute(place) {
      this.map.closePopup();

      if (!this.currentLocation) {
        pushToast(t("route.needLocation"), "error");
        this.requestGeolocation({ center: false, routeTarget: place });
        return;
      }

      this.routeError = null;
      this.routeData = null;
      this.routeLoading = true;
      this.clearRouteLine();

      try {
        const result = await fetchRoute(this.currentLocation, { lat: place.lat, lng: place.lng });
        this.routeData = result;
        this.routeLine = L.polyline(result.latlngs, { color: ROUTE_COLOR, weight: 5, opacity: 0.85 });
        if (this.overlays.route) this.routeLine.addTo(this.map);
        this.map.fitBounds(this.routeLine.getBounds(), { padding: [60, 60] });
      } catch (err) {
        console.error("Routing error:", err);
        this.routeError = t("route.error");
      } finally {
        this.routeLoading = false;
      }
    },

    clearRouteLine() {
      if (this.routeLine) {
        this.map.removeLayer(this.routeLine);
        this.routeLine = null;
      }
    },

    clearRoute() {
      this.clearRouteLine();
      this.routeData = null;
      this.routeError = null;
      this.routeLoading = false;
    },

    // ---------------- reset ----------------

    handleReset() {
      this.clearTemporarySelection();
      this.map.setView([SAUDI_ARABIA_CENTER.lat, SAUDI_ARABIA_CENTER.lng], DEFAULT_ZOOM);
    },
  },
};
</script>
