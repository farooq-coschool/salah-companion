import { useState, useEffect, useRef } from 'react';
import { Compass as CompassIcon, Navigation2, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../store/useSettingsStore';
import { detectBrowserLocation } from '../lib/geolocation';
import { getQiblaBearing, getDistanceToKaabaKm } from '../lib/qibla';

export default function Qibla() {
  const { coordinates, setCoordinates, setLocation, setLocationMode } = useSettingsStore();
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationSupported, setOrientationSupported] = useState(false);
  const [orientationPermissionNeeded, setOrientationPermissionNeeded] = useState(false);
  const headingRef = useRef<number | null>(null);

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

  const handleOrientationEvent = (event: DeviceOrientationEvent) => {
    const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
    let compassHeading: number;
    if (typeof webkitEvent.webkitCompassHeading === 'number') {
      // iOS Safari gives compass heading directly (0 = North, clockwise).
      compassHeading = webkitEvent.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Other browsers: alpha is counter-clockwise from device's initial orientation.
      compassHeading = 360 - event.alpha;
    } else {
      return;
    }
    headingRef.current = compassHeading;
    setHeading(compassHeading);
  };

  const enableCompass = async () => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          setOrientationSupported(true);
          setOrientationPermissionNeeded(false);
          window.addEventListener('deviceorientation', handleOrientationEvent);
        } else {
          setError('Compass permission denied. Showing a fixed bearing instead.');
        }
      } catch {
        setError('Could not access the device compass.');
      }
    }
  };

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) return;

    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DOE.requestPermission === 'function') {
      // iOS 13+ requires an explicit user gesture to grant motion/orientation permission.
      setOrientationPermissionNeeded(true);
    } else {
      setOrientationSupported(true);
      window.addEventListener('deviceorientation', handleOrientationEvent);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientationEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bearing = coordinates ? getQiblaBearing(coordinates.latitude, coordinates.longitude) : null;
  const distanceKm = coordinates ? getDistanceToKaabaKm(coordinates.latitude, coordinates.longitude) : null;

  // When we have a live compass heading, rotate the needle so it points at the Qibla
  // relative to which way the phone is currently facing. Otherwise show the raw bearing.
  const needleRotation = bearing !== null ? (heading !== null ? bearing - heading : bearing) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <div className="text-center">
        <p className="eyebrow-gold justify-center mb-2">Direction of Prayer</p>
        <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Qibla Finder</h1>
      </div>

      {!coordinates ? (
        <div className="surface p-8 rounded-[2rem] text-center space-y-5">
          <MapPin className="w-10 h-10 text-gold-500 mx-auto" />
          <p className="text-stone-600">We need your location to calculate the direction to the Kaaba in Makkah.</p>
          <button onClick={handleDetect} disabled={detecting} className="btn-gold px-6 py-3 rounded-xl mx-auto disabled:opacity-60">
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
            Use My Location
          </button>
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        </div>
      ) : (
        <>
          <div className="surface p-10 rounded-[2.5rem] flex flex-col items-center gap-8">
            <div className="relative w-64 h-64">
              {/* Compass dial */}
              <div className="absolute inset-0 rounded-full border-4 border-gold-400/30 bg-gradient-to-br from-[#0B3D2E] to-[#06231A] shadow-2xl">
                {['N', 'E', 'S', 'W'].map((label, i) => (
                  <span
                    key={label}
                    className="absolute text-gold-200/70 text-xs font-bold"
                    style={{
                      top: i === 0 ? '10px' : i === 2 ? undefined : '50%',
                      bottom: i === 2 ? '10px' : undefined,
                      left: i === 3 ? '12px' : i === 1 ? undefined : '50%',
                      right: i === 1 ? '12px' : undefined,
                      transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              {/* Needle pointing to Qibla */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: needleRotation }}
                transition={{ type: 'spring', stiffness: 60, damping: 12 }}
              >
                <div className="flex flex-col items-center -translate-y-16">
                  <CompassIcon className="w-10 h-10 text-gold-300 drop-shadow-lg" />
                  <div className="w-1 h-24 bg-gradient-to-b from-gold-400 to-transparent rounded-full mt-1" />
                </div>
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gold-400 shadow-lg" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-3xl font-bold font-serif text-emerald-800">{bearing?.toFixed(1)}°</p>
              <p className="text-stone-500 text-sm">Bearing from true north to Makkah</p>
              {distanceKm !== null && (
                <p className="text-stone-400 text-xs">~{Math.round(distanceKm).toLocaleString()} km to the Kaaba</p>
              )}
            </div>

            {orientationPermissionNeeded && (
              <button onClick={enableCompass} className="btn-gold px-5 py-2.5 rounded-xl text-sm">
                Enable Live Compass
              </button>
            )}
            {!orientationSupported && !orientationPermissionNeeded && (
              <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-4 py-2 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Live compass not available on this device — showing fixed bearing.
              </div>
            )}
          </div>

          <button
            onClick={handleDetect}
            disabled={detecting}
            className="text-sm font-bold text-stone-500 hover:text-emerald-700 transition-colors mx-auto flex items-center gap-2"
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
            Re-detect location
          </button>
        </>
      )}
    </motion.div>
  );
}
