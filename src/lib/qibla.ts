const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Initial great-circle bearing (0-360, clockwise from true north) from a point to the Kaaba. */
export function getQiblaBearing(latitude: number, longitude: number): number {
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA_LAT);
  const deltaLng = toRad(KAABA_LNG - longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/** Great-circle distance in km, used to display "~X,XXX km to Makkah". */
export function getDistanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371;
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA_LAT);
  const deltaLat = toRad(KAABA_LAT - latitude);
  const deltaLng = toRad(KAABA_LNG - longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
