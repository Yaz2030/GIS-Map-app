import { getIconMarkup } from "./iconPaths";

// Builds raw HTML for an SVG icon for use inside a Leaflet popup or L.divIcon,
// where Vue components can't be used directly.
export function iconSvg(name, { size = 20, color = "currentColor", className = "" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${getIconMarkup(name)}</svg>`;
}
