// =============================================================
// Standalone routing service using the public OSRM demo server (no API key).
// Suitable for a training project only. When wiring up Spring Boot later,
// BASE_URL should be replaced with a proxy through our own server.
// =============================================================

const BASE_URL = import.meta.env.VITE_OSRM_API || "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoute(from, to) {
  const url = `${BASE_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Routing request failed with status ${res.status}`);
  }

  const data = await res.json();
  if (data.code !== "Ok" || !data.routes || !data.routes.length) {
    throw new Error("No route found");
  }

  const route = data.routes[0];

  const steps = (route.legs || []).flatMap((leg) =>
    (leg.steps || []).map((step) => ({
      type: step.maneuver?.type || "continue",
      modifier: step.maneuver?.modifier || null,
      bearing: step.maneuver?.bearing_after ?? null,
      exit: step.maneuver?.exit ?? null,
      name: step.name || "",
      distanceMeters: step.distance,
    }))
  );

  return {
    // Leaflet expects [lat, lng] while GeoJSON returns [lng, lat]
    latlngs: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps,
  };
}
