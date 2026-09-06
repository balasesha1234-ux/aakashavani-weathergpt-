/**
 * Location Service for AakashaVani.
 * Provides live device GPS detection with IP fallback,
 * and geocoding search for any city/district in India and worldwide.
 */

export async function detectIPLocation() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          district: data.city || data.region || "Detected Area",
          state: data.region || "India",
          isGPS: false
        };
      }
    }
  } catch (e) {
    console.warn("IP Geolocation fallback error:", e);
  }
  return null;
}

export async function detectDeviceLocation() {
  // If browser doesn't support geolocation, try IP directly
  if (!navigator.geolocation) {
    const ipLoc = await detectIPLocation();
    if (ipLoc) return ipLoc;
    throw new Error("Geolocation is not supported by your browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let district = "Detected Location";
        let state = "India";

        try {
          // Reverse-geocode using Open-Meteo Geocoding / BigDataCloud
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            district = data.locality || data.city || data.principalSubdivision || "Detected GPS Area";
            state = data.principalSubdivision || "India";
          }
        } catch (e) {
          console.warn("Reverse geocode fallback:", e);
        }

        resolve({
          latitude,
          longitude,
          district,
          state,
          accuracy: Math.round(accuracy),
          isGPS: true
        });
      },
      async (error) => {
        console.warn("Browser GPS failed or blocked, attempting IP geolocation fallback:", error.message);
        const ipLoc = await detectIPLocation();
        if (ipLoc) {
          resolve(ipLoc);
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Search any Indian city, district, village, or world location via Open-Meteo Geocoding
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.results) return [];

    return data.results.map((r) => ({
      name: r.name,
      district: r.name,
      state: r.admin1 || r.country || "India",
      country: r.country || "India",
      latitude: r.latitude,
      longitude: r.longitude,
      display: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}${r.country && r.country !== 'India' ? ` (${r.country})` : ''}`
    }));
  } catch (err) {
    console.warn("Geocoding search failed:", err);
    return [];
  }
}
