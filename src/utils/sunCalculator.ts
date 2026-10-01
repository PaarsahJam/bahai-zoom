// Solar calculation algorithm for sunrise and sunset
// Reference: NOAA Solar Calculations & Astronomical Algorithms

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  sunriseDisplay: string;
  sunsetDisplay: string;
  isDaytime: boolean;
  timeUntilSunsetSeconds: number;
  timeUntilSunriseSeconds: number;
}

// Default coordinates for major timezones / cities
const TIMEZONE_COORDS: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  'America/New_York': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
  'America/Chicago': { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'USA' },
  'America/Denver': { lat: 39.7392, lng: -104.9903, city: 'Denver', country: 'USA' },
  'America/Los_Angeles': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
  'America/Toronto': { lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada' },
  'America/Vancouver': { lat: 49.2827, lng: -123.1207, city: 'Vancouver', country: 'Canada' },
  'America/Sao_Paulo': { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil' },
  'Europe/London': { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
  'Europe/Paris': { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
  'Europe/Berlin': { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
  'Europe/Amsterdam': { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands' },
  'Europe/Madrid': { lat: 40.4168, lng: -3.7038, city: 'Madrid', country: 'Spain' },
  'Europe/Rome': { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy' },
  'Asia/Tehran': { lat: 35.6892, lng: 51.3890, city: 'Tehran', country: 'Iran' },
  'Asia/Dubai': { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE' },
  'Asia/Kolkata': { lat: 22.5726, lng: 88.3639, city: 'New Delhi', country: 'India' },
  'Asia/Calcutta': { lat: 22.5726, lng: 88.3639, city: 'New Delhi', country: 'India' },
  'Asia/Bangkok': { lat: 13.7563, lng: 100.5018, city: 'Bangkok', country: 'Thailand' },
  'Asia/Singapore': { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
  'Asia/Tokyo': { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
  'Asia/Shanghai': { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
  'Asia/Seoul': { lat: 37.5665, lng: 126.9780, city: 'Seoul', country: 'South Korea' },
  'Australia/Sydney': { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' },
  'Australia/Melbourne': { lat: -37.8136, lng: 144.9631, city: 'Melbourne', country: 'Australia' },
  'Pacific/Auckland': { lat: -36.8485, lng: 174.7633, city: 'Auckland', country: 'New Zealand' },
  'Africa/Cairo': { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt' },
  'Africa/Johannesburg': { lat: -26.2041, lng: 28.0473, city: 'Johannesburg', country: 'South Africa' },
  'Asia/Jerusalem': { lat: 31.7683, lng: 35.2137, city: 'Haifa / Jerusalem', country: 'Israel' },
};

export function getApproximateCoordsForTimezone(tz: string): { lat: number; lng: number; city: string; country: string } {
  if (TIMEZONE_COORDS[tz]) {
    return TIMEZONE_COORDS[tz];
  }
  // Fallbacks by continent prefix
  if (tz.startsWith('America/')) return { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' };
  if (tz.startsWith('Europe/')) return { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands' };
  if (tz.startsWith('Asia/')) return { lat: 35.6892, lng: 51.3890, city: 'Tehran', country: 'Iran' };
  if (tz.startsWith('Australia/')) return { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' };
  
  // Default to Haifa/Tehran/Amsterdam center
  return { lat: 32.8192, lng: 34.9983, city: 'Haifa', country: 'Israel' };
}

/**
 * Calculates sunrise and sunset for a given date and lat/lng.
 */
export function calculateSunriseSunset(date: Date, lat: number, lng: number): SolarTimes {
  const dayOfYear = getDayOfYear(date);
  const rad = Math.PI / 180;
  
  // Declination of the Sun in degrees
  const declination = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * rad);
  
  // Hour angle calculation
  const latRad = lat * rad;
  const declRad = declination * rad;
  
  // Solar noon angle - approximate
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad);
  
  // Bound cosHourAngle between -1 and 1
  const boundedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngle = Math.acos(boundedCos) * (180 / Math.PI);
  
  // Solar noon in hours UTC
  const solarNoonUtcHours = 12 - (lng / 15);
  
  const sunriseUtcHours = solarNoonUtcHours - (hourAngle / 15);
  const sunsetUtcHours = solarNoonUtcHours + (hourAngle / 15);
  
  // Create Date objects for sunrise and sunset
  const sunrise = new Date(date);
  sunrise.setUTCHours(Math.floor(sunriseUtcHours), Math.floor((sunriseUtcHours % 1) * 60), 0, 0);
  
  const sunset = new Date(date);
  sunset.setUTCHours(Math.floor(sunsetUtcHours), Math.floor((sunsetUtcHours % 1) * 60), 0, 0);

  const now = date.getTime();
  const isDaytime = now >= sunrise.getTime() && now < sunset.getTime();

  let timeUntilSunsetSeconds = Math.floor((sunset.getTime() - now) / 1000);
  if (timeUntilSunsetSeconds < 0) {
    // If sunset already passed today, calculate tomorrow's sunset
    const tomorrowSunset = new Date(sunset);
    tomorrowSunset.setDate(tomorrowSunset.getDate() + 1);
    timeUntilSunsetSeconds = Math.floor((tomorrowSunset.getTime() - now) / 1000);
  }

  let timeUntilSunriseSeconds = Math.floor((sunrise.getTime() - now) / 1000);
  if (timeUntilSunriseSeconds < 0) {
    const tomorrowSunrise = new Date(sunrise);
    tomorrowSunrise.setDate(tomorrowSunrise.getDate() + 1);
    timeUntilSunriseSeconds = Math.floor((tomorrowSunrise.getTime() - now) / 1000);
  }

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return {
    sunrise,
    sunset,
    sunriseDisplay: formatTime(sunrise),
    sunsetDisplay: formatTime(sunset),
    isDaytime,
    timeUntilSunsetSeconds,
    timeUntilSunriseSeconds,
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
