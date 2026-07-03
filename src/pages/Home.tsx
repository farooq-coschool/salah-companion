import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { format, isAfter, addDays } from 'date-fns';
import { Bell, MapPin, Loader2, PlayCircle, PauseCircle, X, Navigation, ShieldCheck, Heart, Moon, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { detectBrowserLocation } from '../lib/geolocation';
import { getDuaOfTheDay } from '../lib/duaOfDay';
import { getHijriDate, isRamadan, isWhiteDay, isSunnahFastWeekday } from '../lib/hijriEvents';
import { scheduleNotification } from '../lib/notifications';

function createWavDataUrl(base64: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);

  // Write PCM data
  const pcmData = new Uint8Array(buffer, 44);
  pcmData.set(bytes);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Global registry to prevent Audio objects from being garbage collected
// while their play() promise is pending.
const activeAudios = new Set<HTMLAudioElement>();

// Using reliable MP3 links for full prayers. 
const IMAM_RECITATIONS: Record<string, string> = {
  Fajr: 'https://server8.mp3quran.net/afs/089.mp3', // Al-Fajr
  Dhuhr: 'https://server8.mp3quran.net/afs/055.mp3', // Ar-Rahman
  Asr: 'https://server8.mp3quran.net/afs/103.mp3',   // Al-Asr
  Maghrib: 'https://server8.mp3quran.net/afs/112.mp3',// Al-Ikhlas
  Isha: 'https://server8.mp3quran.net/afs/067.mp3',   // Al-Mulk
  "Jumu'ah": 'https://server8.mp3quran.net/afs/062.mp3', // Al-Jumu'ah
};

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function Home() {
  const {
    location, calculationMethod, madhab, customFajrAudioUrl, reciter,
    coordinates, locationMode, hasPromptedLocation,
    setLocation, setCoordinates, setLocationMode, setHasPromptedLocation,
  } = useSettingsStore();
  const duaOfDay = getDuaOfTheDay();
  const today = new Date();
  const hijriToday = getHijriDate(today);
  const ramadanActive = isRamadan(today);
  const sunnahFastToday = isWhiteDay(today) || isSunnahFastWeekday(today);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: string } | null>(null);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [activeNotification, setActiveNotification] = useState<{ type: 'adhan' | 'salah'; prayerName: string } | null>(null);
  const lastNotifiedRef = useRef<string | null>(null);
  const [isPlayingImam, setIsPlayingImam] = useState(false);
  const [playingImamUrl, setPlayingImamUrl] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    try {
      const detected = await detectBrowserLocation();
      setCoordinates({ latitude: detected.latitude, longitude: detected.longitude });
      setLocationMode('auto');
      setLocation({ city: detected.city, country: detected.country });
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not detect your location.');
    } finally {
      setHasPromptedLocation(true);
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    // Component mount logic
  }, []);

  const toggleAdhan = () => {
    if (isPlayingImam) {
      setIsPlayingImam(false);
    }

    if (isPlayingAdhan) {
      setIsPlayingAdhan(false);
      const oldAudio = audioRef.current;
      const oldPromise = playPromiseRef.current;
      if (oldAudio) {
        oldAudio.muted = true;
        if (oldPromise) {
          oldPromise.then(() => {
            oldAudio.pause();
            activeAudios.delete(oldAudio);
          }).catch(() => {
            activeAudios.delete(oldAudio);
          });
        } else {
          oldAudio.pause();
          activeAudios.delete(oldAudio);
        }
      }
      audioRef.current = null;
    } else {
      setIsPlayingAdhan(true);
      audioRef.current = new Audio(`https://cdn.islamic.network/quran/audio/128/${reciter}/1.mp3`);
      activeAudios.add(audioRef.current);
      audioRef.current.onended = () => {
        setIsPlayingAdhan(false);
        if (audioRef.current) activeAudios.delete(audioRef.current);
      };
      
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error('Audio playback failed:', error);
              setIsPlayingAdhan(false);
            }
            if (audioRef.current) activeAudios.delete(audioRef.current);
          });
      }
    }
  };

  const playImamRecitation = async (prayerName: string) => {
    if (isPlayingAdhan) {
      setIsPlayingAdhan(false);
    }

    let url = IMAM_RECITATIONS[prayerName] || IMAM_RECITATIONS['Fajr'];
    if (prayerName === 'Fajr' && customFajrAudioUrl) {
      url = customFajrAudioUrl;
    }

    if (playingImamUrl === url && isPlayingImam) {
      setIsPlayingImam(false);
      const oldAudio = audioRef.current;
      const oldPromise = playPromiseRef.current;
      if (oldAudio) {
        oldAudio.muted = true;
        if (oldPromise) {
          oldPromise.then(() => {
            oldAudio.pause();
            activeAudios.delete(oldAudio);
          }).catch(() => {
            activeAudios.delete(oldAudio);
          });
        } else {
          oldAudio.pause();
          activeAudios.delete(oldAudio);
        }
      }
      audioRef.current = null;
    } else {
      // Stop current if any
      const oldAudio = audioRef.current;
      const oldPromise = playPromiseRef.current;
      if (oldAudio) {
        oldAudio.muted = true;
        if (oldPromise) {
          oldPromise.then(() => {
            oldAudio.pause();
            activeAudios.delete(oldAudio);
          }).catch(() => {
            activeAudios.delete(oldAudio);
          });
        } else {
          oldAudio.pause();
          activeAudios.delete(oldAudio);
        }
      }

      setPlayingImamUrl(url);
      setIsPlayingImam(true);
      
      audioRef.current = new Audio(url);
      activeAudios.add(audioRef.current);
      audioRef.current.onended = () => {
        setIsPlayingImam(false);
        setPlayingImamUrl('');
        if (audioRef.current) activeAudios.delete(audioRef.current);
      };
      
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error('Audio playback failed:', error);
              setIsPlayingImam(false);
              setPlayingImamUrl('');
            }
            if (audioRef.current) activeAudios.delete(audioRef.current);
          });
      }
    }
  };

  const handleNotificationPlay = () => {
    if (!activeNotification) return;
    
    if (activeNotification.type === 'adhan') {
      if (!isPlayingAdhan) toggleAdhan();
    } else {
      if (!isPlayingImam) playImamRecitation(activeNotification.prayerName);
    }
    setActiveNotification(null);
  };

  const handleNotificationDismiss = () => {
    setActiveNotification(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        const oldAudio = audioRef.current;
        const oldPromise = playPromiseRef.current;
        oldAudio.muted = true;
        if (oldPromise) {
          oldPromise.then(() => {
            oldAudio.pause();
            activeAudios.delete(oldAudio);
          }).catch(() => {
            activeAudios.delete(oldAudio);
          });
        } else {
          oldAudio.pause();
          activeAudios.delete(oldAudio);
        }
      }
    };
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const date = new Date();
        const formattedDate = format(date, 'dd-MM-yyyy');
        const url = locationMode === 'auto' && coordinates
          ? `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${calculationMethod}&school=${madhab}`
          : `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${location.city}&country=${location.country}&method=${calculationMethod}&school=${madhab}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [location, coordinates, locationMode, calculationMethod, madhab]);

  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  useEffect(() => {
    if (!notificationsEnabled || !prayerTimes) return;

    const cancels: Array<() => void> = [];
    const now = new Date();

    for (const [prayer, timeStr] of Object.entries(prayerTimes)) {
      if (prayer === 'Sunrise') continue;
      const [hours, minutes] = timeStr.split(':');
      const prayerDate = new Date();
      prayerDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      if (isAfter(prayerDate, now)) {
        cancels.push(scheduleNotification('Prayer Time', `It's time for ${prayer}.`, prayerDate));
      }
    }

    return () => cancels.forEach((cancel) => cancel());
  }, [notificationsEnabled, prayerTimes]);

  useEffect(() => {
    if (!prayerTimes) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      let next = null;
      let minDiff = Infinity;

      for (const prayer of prayers) {
        const timeStr = prayerTimes[prayer as keyof PrayerTimes];
        const [hours, minutes] = timeStr.split(':');
        const prayerDate = new Date();
        prayerDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        if (prayer !== 'Sunrise') {
          // Check notifications
          const adhanDate = new Date(prayerDate.getTime() - 5 * 60000);
          const adhanTimeStr = `${adhanDate.getHours().toString().padStart(2, '0')}:${adhanDate.getMinutes().toString().padStart(2, '0')}`;
          
          const isFriday = new Date().getDay() === 5;
          const displayName = prayer === 'Dhuhr' && isFriday ? "Jumu'ah" : prayer;

          const adhanKey = `${prayer}-adhan-${adhanTimeStr}`;
          if (currentTimeStr === adhanTimeStr && lastNotifiedRef.current !== adhanKey) {
            setActiveNotification({ type: 'adhan', prayerName: displayName });
            lastNotifiedRef.current = adhanKey;
          }

          const salahKey = `${prayer}-salah-${timeStr}`;
          if (currentTimeStr === timeStr && lastNotifiedRef.current !== salahKey) {
            if (prayer === 'Fajr') {
              playImamRecitation('Fajr');
            } else {
              setActiveNotification({ type: 'salah', prayerName: displayName });
            }
            lastNotifiedRef.current = salahKey;
          }
        }

        if (isAfter(prayerDate, now)) {
          const diff = prayerDate.getTime() - now.getTime();
          if (diff < minDiff) {
            minDiff = diff;
            next = { name: prayer, time: timeStr, date: prayerDate };
          }
        }
      }

      // If no next prayer today, it's Fajr tomorrow
      if (!next) {
        const timeStr = prayerTimes.Fajr;
        const [hours, minutes] = timeStr.split(':');
        const tomorrowFajr = addDays(new Date(), 1);
        tomorrowFajr.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        next = { name: 'Fajr', time: timeStr, date: tomorrowFajr };
      }

      if (next) {
        const diffMs = next.date.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setNextPrayer({
          name: next.name,
          time: next.time,
          diff: `${hours}h ${minutes}m`,
        });
      }
    };

    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="space-y-8">
      {/* Location Permission Prompt */}
      <AnimatePresence>
        {!hasPromptedLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="surface p-6 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="icon-badge p-3 rounded-2xl shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-800">Get accurate prayer times for where you are</p>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                  Allow location access for precise timings, or enter your city manually in Settings.
                </p>
                {locationError && (
                  <p className="text-sm text-rose-600 mt-2 font-medium">{locationError}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="btn-gold flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm disabled:opacity-60"
              >
                {isDetectingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Use My Location
              </button>
              <button
                onClick={() => setHasPromptedLocation(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Next Prayer */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-panel section-shell rounded-[2.3rem] p-6 md:p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-12 w-72 h-72 rounded-full bg-gold-300/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-gold-50/90">
              <MapPin className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-medium tracking-wide">{location.city}, {location.country}</span>
              {locationMode === 'auto' && (
                <span className="flex items-center gap-1 pl-2 ml-1 border-l border-white/15 text-[10px] uppercase tracking-widest font-bold text-emerald-200/70">
                  <ShieldCheck className="w-3 h-3" />
                  Auto
                </span>
              )}
            </div>

            <div className="space-y-4">
              <p className="eyebrow-gold !text-gold-200/75">Today&apos;s Prayer Journey</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-gold-50 leading-tight">
                Build a quiet rhythm for recitation, reflection, and salah.
              </h2>
              <p className="max-w-2xl text-gold-50/76 text-base md:text-lg leading-relaxed">
                The app now opens like a devotional space: large reading cards, category-focused duas, and a calmer layout that feels easier to sit with for longer recitation sessions.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="stat-tile rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold">Prayer</p>
                <p className="text-lg font-bold text-stone-900">{nextPrayer?.name === 'Dhuhr' && isFriday ? 'Jumu\'ah' : nextPrayer?.name}</p>
              </div>
              <div className="stat-tile rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold">Time</p>
                <p className="text-lg font-bold text-stone-900">{nextPrayer?.time}</p>
              </div>
              <div className="stat-tile rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold">Countdown</p>
                <p className="text-lg font-bold text-stone-900">in {nextPrayer?.diff}</p>
              </div>
              <div className="stat-tile rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold">Mode</p>
                <p className="text-lg font-bold text-stone-900">{reciter.split('.').pop()}</p>
              </div>
            </div>
          </div>

          <div className="hero-panel-soft rounded-[2rem] p-5 md:p-6 text-stone-900 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow-gold mb-1">Recitation Control</p>
                <h3 className="text-2xl font-bold font-serif text-stone-900">Sit, listen, recite</h3>
              </div>
              <div className="icon-badge p-3 rounded-2xl">
                <Heart className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0B3D2E] text-gold-50 p-5 shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold-100/70 font-bold mb-2">Next Prayer</p>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
                    {nextPrayer?.name === 'Dhuhr' && isFriday ? 'Jumu\'ah' : nextPrayer?.name}
                  </h3>
                  <div className="text-right">
                    <p className="text-2xl font-light">{nextPrayer?.time}</p>
                    <p className="text-gold-100/80 text-sm">in {nextPrayer?.diff}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isPlayingImam && (
                  <button
                    onClick={() => playImamRecitation(nextPrayer?.name === 'Dhuhr' && isFriday ? "Jumu'ah" : nextPrayer?.name || 'Fajr')}
                    className="flex-1 btn-gold px-5 py-3.5 rounded-2xl text-sm"
                    title="Stop Imam Recitation"
                  >
                    <PauseCircle className="w-5 h-5" />
                    Stop Recitation
                  </button>
                )}
                <button
                  onClick={toggleAdhan}
                  className="flex-1 px-5 py-3.5 rounded-2xl text-sm font-bold bg-white/80 text-stone-900 border border-gold-400/20 hover:bg-white transition-all shadow-md flex items-center justify-center gap-2"
                  title="Play Adhan"
                >
                  {isPlayingAdhan ? <PauseCircle className="w-5 h-5 text-emerald-800" /> : <PlayCircle className="w-5 h-5 text-emerald-800" />}
                  {isPlayingAdhan ? 'Pause Adhan' : 'Play Adhan'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-2xl bg-white/75 p-4 border border-gold-400/15">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold mb-1">Status</p>
                  <p className="text-sm font-semibold text-stone-800">Focus mode ready</p>
                </div>
                <div className="rounded-2xl bg-white/75 p-4 border border-gold-400/15">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-bold mb-1">Reminder</p>
                  <p className="text-sm font-semibold text-stone-800">Recite with calm pacing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Ramadan Sehri/Iftar Countdown */}
      {ramadanActive && prayerTimes && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="surface p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="icon-badge p-3 rounded-2xl shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Ramadan Mubarak &mdash; Day {hijriToday.day}</p>
              <p className="text-sm text-stone-500">Fasting from Fajr to Maghrib today.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Sehri Ends</p>
              <p className="text-xl font-bold text-emerald-700">{prayerTimes.Fajr}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Iftar</p>
              <p className="text-xl font-bold text-gold-600">{prayerTimes.Maghrib}</p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Sunnah Fasting Reminder */}
      {!ramadanActive && sunnahFastToday && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="surface p-5 rounded-[2rem] flex items-center gap-4"
        >
          <div className="icon-badge p-2.5 rounded-xl shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <p className="text-sm text-stone-600">
            <span className="font-bold text-stone-800">Recommended fast today</span> &mdash; it's a Sunnah fasting day (White Days or Monday/Thursday).
          </p>
        </motion.section>
      )}

      {/* Dua of the Day */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="surface p-6 md:p-8 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-badge p-2.5 rounded-xl">
            <Heart className="w-4 h-4" />
          </div>
          <p className="eyebrow-gold">Dua of the Day</p>
        </div>
        <p className="text-2xl md:text-3xl font-arabic text-emerald-900 text-right mb-4 leading-loose" dir="rtl">
          {duaOfDay.arabic}
        </p>
        <p className="text-stone-600 leading-relaxed mb-2">{duaOfDay.translation}</p>
        <p className="text-sm text-gold-700 font-semibold">{duaOfDay.title} &middot; {duaOfDay.reference}</p>
      </motion.section>

      {/* Prayer Times List */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6 px-2">
          <h3 className="text-2xl font-bold text-stone-800 font-serif">Today's Prayers</h3>
          <div className="flex-1 divider-gold opacity-50" />
        </div>
        <div className="grid gap-4">
          {prayerTimes && Object.entries(prayerTimes).map(([name, time], index) => {
            if (['Sunset', 'Imsak', 'Midnight', 'Firstthird', 'Lastthird'].includes(name)) return null;
            
            const isNext = nextPrayer?.name === name;
            const displayName = name === 'Dhuhr' && isFriday ? 'Jumu\'ah' : name;
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                key={name}
                className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${
                  isNext 
                    ? 'bg-gradient-to-r from-[#0B3D2E] to-[#123F30] border border-gold-400/40 shadow-lg shadow-emerald-950/20 scale-[1.02]' 
                    : 'surface surface-interactive'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isNext ? 'bg-gold-400/15 text-gold-300 border border-gold-400/40' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Bell className={`w-5 h-5 ${isNext ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-lg font-semibold tracking-wide ${isNext ? 'text-gold-50' : 'text-stone-700'}`}>
                    {displayName}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-xl ${isNext ? 'font-bold text-gold-200' : 'font-medium text-stone-600'}`}>
                    {time}
                  </span>
                  {name !== 'Sunrise' && (
                    <button
                      onClick={() => playImamRecitation(displayName)}
                      className={`p-3 rounded-xl transition-all hover:scale-110 ${
                        isNext
                          ? 'bg-white/[0.06] text-gold-300/70 hover:text-gold-200 hover:bg-white/[0.1]'
                          : 'bg-stone-50 text-stone-400 hover:text-emerald-700 hover:bg-gold-50'
                      }`}
                      title={`Play ${displayName} Imam Recitation`}
                    >
                      <PlayCircle className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Notification Modal */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#FCFAF4]/95 backdrop-blur-xl rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gold-400/30 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold-50 to-transparent pointer-events-none" />
              
              <button 
                onClick={handleNotificationDismiss}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10 space-y-6">
                <div className="icon-badge w-20 h-20 rounded-[2rem] mx-auto">
                  <Bell className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">
                    {activeNotification.prayerName} {activeNotification.type === 'adhan' ? 'Adhan' : 'Prayer'}
                  </h3>
                  <p className="text-stone-600 mt-3 leading-relaxed">
                    {activeNotification.type === 'adhan' 
                      ? `It is 5 minutes until ${activeNotification.prayerName}. Would you like to play the Adhan?`
                      : `It is time for ${activeNotification.prayerName}. Would you like to listen to the Imam's recitation?`}
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleNotificationDismiss}
                    className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleNotificationPlay}
                    className="btn-gold flex-1 py-3.5 px-4 rounded-2xl"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Play
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
