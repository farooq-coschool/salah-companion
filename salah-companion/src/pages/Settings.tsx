import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { Settings as SettingsIcon, MapPin, Globe, BookOpen, Volume2, Navigation, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { detectBrowserLocation } from '../lib/geolocation';

export default function Settings() {
  const {
    location,
    locationMode,
    calculationMethod,
    madhab,
    translation,
    customFajrAudioUrl,
    setLocation,
    setCoordinates,
    setLocationMode,
    setHasPromptedLocation,
    setCalculationMethod,
    setMadhab,
    setTranslation,
    setCustomFajrAudioUrl,
  } = useSettingsStore();

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocation({ ...location, [name]: value });
    setLocationMode('manual');
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    try {
      const detected = await detectBrowserLocation();
      setCoordinates({ latitude: detected.latitude, longitude: detected.longitude });
      setLocationMode('auto');
      setLocation({ city: detected.city, country: detected.country });
      setHasPromptedLocation(true);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not detect your location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="icon-badge p-4 rounded-2xl">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="eyebrow-gold mb-1">Preferences</p>
          <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Settings</h1>
        </div>
      </div>

      {/* Location Settings */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface surface-interactive p-8 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="icon-badge p-2.5 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Location</h2>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="btn-gold px-5 py-3 rounded-xl text-sm disabled:opacity-60 w-full sm:w-auto"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {locationMode === 'auto' ? 'Re-detect My Location' : 'Auto-Detect My Location'}
          </button>
          {locationMode === 'auto' && !locationError && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              Using your current location
            </span>
          )}
        </div>
        {locationError && (
          <p className="text-sm text-rose-600 font-medium mb-6">{locationError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={location.city}
              onChange={handleLocationChange}
              className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm"
              placeholder="e.g., London"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={location.country}
              onChange={handleLocationChange}
              className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm"
              placeholder="e.g., UK"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500 leading-relaxed">
          {locationMode === 'auto'
            ? 'Editing these fields switches back to manual mode.'
            : 'Enter a city and country, or use auto-detect above for precise, coordinate-based timings.'}
        </p>
      </motion.section>

      {/* Prayer Calculation Settings */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="surface surface-interactive p-8 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="icon-badge p-2.5 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Prayer Calculation</h2>
        </div>
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Calculation Method</label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(Number(e.target.value))}
              className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm appearance-none cursor-pointer"
            >
              <option value={2}>Islamic Society of North America (ISNA)</option>
              <option value={3}>Muslim World League (MWL)</option>
              <option value={4}>Umm Al-Qura University, Makkah</option>
              <option value={5}>Egyptian General Authority of Survey</option>
              <option value={1}>University of Islamic Sciences, Karachi</option>
              <option value={8}>Gulf Region</option>
              <option value={9}>Kuwait</option>
              <option value={10}>Qatar</option>
              <option value={11}>Majlis Ugama Islam Singapura, Singapore</option>
              <option value={12}>Union Organization islamic de France</option>
              <option value={13}>Diyanet Ä°Åleri BaÅkanlÄ±ÄÄ±, Turkey</option>
              <option value={14}>Spiritual Administration of Muslims of Russia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-3">Asr Calculation (Madhab)</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="madhab"
                    value={0}
                    checked={madhab === 0}
                    onChange={() => setMadhab(0)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 rounded-full border-2 border-stone-300 peer-checked:border-gold-500 peer-checked:bg-gold-500 transition-all"></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-stone-700 font-medium group-hover:text-stone-900 transition-colors">Shafi/Maliki/Hanbali</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="madhab"
                    value={1}
                    checked={madhab === 1}
                    onChange={() => setMadhab(1)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 rounded-full border-2 border-stone-300 peer-checked:border-gold-500 peer-checked:bg-gold-500 transition-all"></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-stone-700 font-medium group-hover:text-stone-900 transition-colors">Hanafi</span>
              </label>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quran Settings */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="surface surface-interactive p-8 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="icon-badge p-2.5 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Qur'an Preferences</h2>
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Translation Language</label>
          <select
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm appearance-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
          </select>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Select your preferred language for Qur'an translations and Duas.
          </p>
        </div>
      </motion.section>

      {/* Custom Audio Settings */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="surface surface-interactive p-8 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="icon-badge p-2.5 rounded-xl">
            <Volume2 className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Custom Audio</h2>
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Custom Fajr Audio URL (MP3)</label>
          <input
            type="url"
            value={customFajrAudioUrl || ''}
            onChange={(e) => setCustomFajrAudioUrl(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm"
            placeholder="https://example.com/my-fajr-recording.mp3"
          />
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Paste a direct link to an MP3 file of your custom Fajr script. If left blank, the default Sheikh Mishary recitation will be used.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
