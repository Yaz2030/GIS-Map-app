import { createApp } from "vue";
// Leaflet's own CSS must load before style.css: it sets a hardcoded white
// popup background/text color, and with equal-specificity selectors the
// last-loaded rule wins the cascade. Previously leaflet.css was imported
// from within MapView.vue, so Vite emitted it *after* style.css in the
// bundle and Leaflet's white popup silently overrode our dark-mode fix
// despite the fix being present in the source.
import "leaflet/dist/leaflet.css";
import "./style.css";
import App from "./App.vue";
import { initSettings } from "./store/settings";

initSettings();
createApp(App).mount("#app");
