// Single source for all icons (simple, consistent line style, no emoji or images).
// These paths are used by AppIcon.vue (inside Vue components) and iconHtml.js
// (to build Leaflet popup icons and map markers as raw HTML).
export const ICON_PATHS = {
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',

  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',

  user: '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/>',

  bookmark: '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/>',

  "bookmark-plus": '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/><line x1="12" y1="7.5" x2="12" y2="11.5"/><line x1="10" y1="9.5" x2="14" y2="9.5"/>',

  settings:
    '<rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(45 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(90 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(135 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(180 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(225 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(270 12 12)"/><rect x="10.6" y="1.6" width="2.8" height="4.2" rx="0.7" transform="rotate(315 12 12)"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>',

  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor" stroke="none"/>',

  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',

  "arrow-up": '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',

  "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',

  "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',

  "arrow-u-turn": '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',

  login: '<path d="M11 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/><path d="M14.5 8l4 4-4 4"/><line x1="18.3" y1="12" x2="8.5" y2="12"/>',

  logout: '<path d="M13 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5"/><path d="M9.5 8l-4 4 4 4"/><line x1="5.7" y1="12" x2="15.5" y2="12"/>',

  search: '<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.3" y1="15.3" x2="20.5" y2="20.5"/>',

  layers: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',

  locate: '<circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="22"/><line x1="2" y1="12" x2="5.5" y2="12"/><line x1="18.5" y1="12" x2="22" y2="12"/>',

  refresh: '<path d="M4.5 9a8 8 0 0 1 13.9-4.6M19.5 15a8 8 0 0 1-13.9 4.6"/><path d="M4 4.2v4.8h4.8"/><path d="M20 19.8V15h-4.8"/>',

  route: '<path d="M12 2 4 21l8-5 8 5z"/>',

  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6.5 7l1 13a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',

  "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M7.8 12.3l2.7 2.7 5.7-6"/>',

  "alert-circle": '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7.5" x2="12" y2="13"/><circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none"/>',

  "x-circle": '<circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',

  "map-pin": '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',

  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',

  globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13 13 0 0 1 3.6 9 13 13 0 0 1-3.6 9 13 13 0 0 1-3.6-9A13 13 0 0 1 12 3z"/>',

  sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4.2"/><line x1="12" y1="19.8" x2="12" y2="22"/><line x1="2" y1="12" x2="4.2" y2="12"/><line x1="19.8" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.4" y2="6.4"/><line x1="17.6" y1="17.6" x2="19.1" y2="19.1"/><line x1="19.1" y1="4.9" x2="17.6" y2="6.4"/><line x1="6.4" y1="17.6" x2="4.9" y2="19.1"/>',

  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',

  "category-religious": '<path d="M6 21v-6a6 6 0 0 1 12 0v6"/><line x1="4" y1="21" x2="20" y2="21"/><path d="M9.5 21v-4a2.5 2.5 0 0 1 5 0v4"/><line x1="12" y1="3" x2="12" y2="5.3"/><circle cx="12" cy="4.2" r="0.9" fill="currentColor" stroke="none"/>',

  "category-office": '<rect x="6" y="3" width="12" height="18" rx="1"/><line x1="9" y1="7" x2="9" y2="8.5"/><line x1="15" y1="7" x2="15" y2="8.5"/><line x1="9" y1="11" x2="9" y2="12.5"/><line x1="15" y1="11" x2="15" y2="12.5"/><line x1="9" y1="15" x2="9" y2="16.5"/><line x1="15" y1="15" x2="15" y2="16.5"/>',

  "category-education": '<path d="M12 4 2 9l10 5 10-5-10-5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><line x1="22" y1="9" x2="22" y2="15"/>',

  "category-health": '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',

  "category-food": '<path d="M6 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8z"/><path d="M17 9.5h1.5a2 2 0 0 1 0 4H17"/><line x1="8.3" y1="4" x2="8.3" y2="7"/><line x1="11.3" y1="3" x2="11.3" y2="7"/><line x1="14.3" y1="4" x2="14.3" y2="7"/>',

  "category-fuel": '<rect x="4" y="4" width="9" height="17" rx="1"/><line x1="4" y1="10.5" x2="13" y2="10.5"/><path d="M13 8.5h2.5l3 3v5.3a1.4 1.4 0 0 1-2.8 0v-1.6a1.4 1.4 0 0 0-1.4-1.4H15"/><line x1="7" y1="4" x2="7" y2="2"/><line x1="10" y1="4" x2="10" y2="2"/>',

  "category-shop": '<path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',

  "category-residential": '<path d="M4 11 12 4l8 7"/><path d="M6 10v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10"/><path d="M10 21v-6h4v6"/>',

  shield: '<path d="M12 2.5 5 5.3v5.8c0 5.1 3 9.4 7 10.9 4-1.5 7-5.8 7-10.9V5.3l-7-2.8z"/><path d="M8.7 12.2l2.4 2.4 4.4-4.9"/>',

  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',

  "eye-off":
    '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
};

export function getIconMarkup(name) {
  return ICON_PATHS[name] || ICON_PATHS["map-pin"];
}
