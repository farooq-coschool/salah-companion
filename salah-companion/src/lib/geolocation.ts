export interface DetectedLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

/**
 * Asks the browser for the user's current position, then reverse-geocodes
 * the coordinates into a human-readable city/country via OpenStreetMap's
 * free Nominatim service. If reverse geocoding fails for any reason, the
 * coordinates are still returned with a generic "Current Location" label
 * so prayer-time lookups (which only need lat/lng) keep working.
 */
export function detectBrowserLocation(): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          const address = data?.address || {};
          const city =
            address.city || address.town || address.village || address.county || address.state || 'Current Location';
          const country = address.country || '';
          resolve({ latitude, longitude, city, country });
        } catch {
          // Reverse geocoding failed — coordinates are still enough for prayer times.
          resolve({ latitude, longitude, city: 'Current Location', country: '' });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Location permission was denied. You can enter your city manually instead.'));
        } else {
          reject(new Error('Could not determine your location. Please enter your city manually.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
