// Approximate center of Saudi Arabia — default view on app load and "Reset" only,
// not tied to the user's actual location (the "My Location" button is separate).
export const SAUDI_ARABIA_CENTER = { lat: 23.8859, lng: 45.0792 };
// Zoom level that shows most of Saudi Arabia at a country-wide view.
export const DEFAULT_ZOOM = 5;
export const FOCUS_ZOOM = 15;
// Minimum zoom for all base layers — prevents the world map from repeating
// horizontally when zoomed out too far (each world copy becomes narrower than
// the container). 3 keeps the world visible without repeats on wide screens.
export const MIN_ZOOM = 3;
