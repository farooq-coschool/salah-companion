import { useState } from 'react';
import { MapPin, Loader2, Navigation2, ExternalLink, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../store/useSettingsStore';
import { detectBrowserLocation } from '../lib/geolocation';

interface MosqueResult {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address?: string;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MosqueFinder() {
  const { coordinates, setCoordinates, setLocation, setLocationMode } = useSettingsStore();
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MosqueResult[] | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const handleDetect = async () => {
    setDetecting(true);
    setError(null);
    try {
      const detected = await detectBrowserLocation();
      setCoordinates({ latitude: detected.latitude, longitude: detected.longitude });
      setLocationMode('auto');
      setLocation({ city: detected.city, country: detected.country });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not determine your location.');
    } finally {
      setDetecting(false);
    }
  };

  const search = async () => {
    if (!coordinates) return;
    setSearching(true);
    setError(null);
    setResults(null);
    try {
      const { latitude, longitude } = coordinates;
      const query = `[out:json][timeout:25];(node["amenity"="mosque"](around:${radiusKm * 1000},${latitude},${longitude});way["amenity"="mosque"](around:${radiusKm * 1000},${latitude},${longitude}););out center 60;`;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await response.json();
      const mosques: MosqueResult[] = (data.elements || [])
        .map((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (lat == null || lon == null) return null;
          const tags = el.tags || {};
          const address = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ');
          return {
            id: el.id,
            name: tags.name || tags['name:en'] || 'Mosque',
            lat,
            lon,
            distanceKm: haversineKm(latitude, longitude, lat, lon),
            address: address || undefined,
          };
        })
        .filter(Boolean)
        .sort((a: MosqueResult, b: MosqueResult) => a.distanceKm - b.distanceKm);
      setResults(mosques);
    } catch {
      setError('Could not reach the mosque directory service. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <p className="eyebrow-gold justify-center mb-2">Find a Place to Pray</p>
        <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Nearby Mosques</h1>
      </div>

      {!coordinates ? (
        <div className="surface p-8 rounded-[2rem] text-center space-y-5">
          <MapPin className="w-10 h-10 text-gold-500 mx-auto" />
          <p className="text-stone-600">Share your location to find mosques near you.</p>
          <button onClick={handleDetect} disabled={detecting} className="btn-gold px-6 py-3 rounded-xl mx-auto disabled:opacity-60">
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
            Use My Location
          </button>
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        </div>
      ) : (
        <>
          <div className="surface p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1 w-full">
              <span className="text-sm font-bold text-stone-600 shrink-0">Radius</span>
              {[2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    radiusKm === r ? 'bg-[#0B3D2E] text-gold-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
            <button onClick={search} disabled={searching} className="btn-gold px-6 py-3 rounded-xl w-full sm:w-auto disabled:opacity-60">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {error && <p className="text-sm text-rose-600 font-medium text-center">{error}</p>}

          {results && (
            <div className="surface rounded-[2rem] overflow-hidden divide-y divide-stone-100/80">
              {results.length === 0 ? (
                <p className="p-10 text-center text-stone-500">No mosques found within {radiusKm} km. Try a larger radius.</p>
              ) : (
                results.map((mosque) => (
                  <a
                    key={mosque.id}
                    href={`https://www.openstreetmap.org/?mlat=${mosque.lat}&mlon=${mosque.lon}#map=17/${mosque.lat}/${mosque.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 hover:bg-gold-50/40 transition-colors group"
                  >
                    <div className="icon-badge p-3 rounded-2xl shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-800 group-hover:text-emerald-700 transition-colors truncate">{mosque.name}</h3>
                      {mosque.address && <p className="text-sm text-stone-500 truncate">{mosque.address}</p>}
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="text-sm font-bold text-gold-700">{mosque.distanceKm.toFixed(1)} km</span>
                      <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-gold-500 transition-colors" />
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
          <p className="text-xs text-stone-400 text-center">Data from OpenStreetMap contributors — coverage varies by region.</p>
        </>
      )}
    </motion.div>
  );
}
