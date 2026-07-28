import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initSettings } from "./store/settings";

initSettings();
createApp(App).mount("#app");
