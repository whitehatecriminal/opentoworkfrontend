export const checkLocationPermission = async () => {
  if (typeof window === "undefined" || !navigator?.geolocation) {
    return "unsupported";
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state; // 'granted', 'prompt', or 'denied'
    } catch {
      return "prompt";
    }
  }

  return "prompt";
};


export const getCurrentLocation = (
  options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
) => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy,
        });
      },
      (error) => {
        let message = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access in your browser settings or select your location directly on the map.";
            break;
          case error.POSITION_UNAVAILABLE:
            message =
              "Location information is currently unavailable. Please pick your location on the map.";
            break;
          case error.TIMEOUT:
            message =
              "The location request timed out. Please try again or select on the map.";
            break;
          default:
            message = error.message || message;
        }
        const customError = new Error(message);
        customError.code = error.code;
        reject(customError);
      },
      options
    );
  });
};

/**
 * Reverse geocode latitude and longitude to a human-readable address.
 * Uses OpenStreetMap Nominatim API.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ displayName: string, city: string, state: string, country: string } | null>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const addr = data.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      "";
    const state = addr.state || "";
    const country = addr.country || "";

    return {
      displayName: data.display_name || "",
      city,
      state,
      country,
    };
  } catch (error) {
    console.warn("Could not reverse geocode location:", error);
    return null;
  }
};
