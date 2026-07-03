import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { ArrowLeft, Loader2, Settings2, PlayCircle, PauseCircle, Star, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ARABIC_FONT_SIZES: Record<string, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
  xl: 'text-6xl md:text-7xl',
};

// Global registry to prevent Audio objects from being garbage collected
// while their play() promise is pending.
const activeAudios = new Set<HTMLAudioElement>();

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export default function SurahView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    translation, setTranslation, arabicFontSize, reciter,
    quranBookmarks, toggleQuranBookmark, setLastRead,
    hifzProgress, toggleHifzAyah,
  } = useSettingsStore();
  const [surahArabic, setSurahArabic] = useState<SurahData | null>(null);
  const [surahTranslation, setSurahTranslation] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [hifzMode, setHifzMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const hasScrolledToHash = useRef(false);

  const toggleAyahAudio = (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
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
      setPlayingAyah(null);
    } else {
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
      
      const playAyahAudio = () => {
        const audio = new Audio(`https://cdn.islamic.network/quran/audio/128/${reciter}/${ayahNumber}.mp3`);
        activeAudios.add(audio);
        audioRef.current = audio;
        audio.onended = () => {
          activeAudios.delete(audio);
          if (hifzMode) {
            // Loop the same ayah for memorization practice instead of stopping.
            playAyahAudio();
            return;
          }
          setPlayingAyah(null);
        };
        const playPromise = audio.play();
        playPromiseRef.current = playPromise;
        playPromise.catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Audio playback failed:', error);
            setPlayingAyah(null);
          }
          activeAudios.delete(audio);
        });
      };

      setPlayingAyah(ayahNumber);
      playAyahAudio();
    }
  };

  const getTranslationEdition = (lang: string) => {
    switch (lang) {
      case 'en': return 'en.asad';
      case 'ur': return 'ur.jalandhry';
      case 'hi': return 'hi.farooq';
      case 'te': return 'en.asad'; // Fallback for Telugu if not available
      default: return 'en.asad';
    }
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
    const fetchSurah = async () => {
      setLoading(true);
      try {
        const edition = getTranslationEdition(translation);
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,${edition}`);
        const data = await response.json();
        if (data.code === 200) {
          setSurahArabic(data.data[0]);
          setSurahTranslation(data.data[1]);
        }
      } catch (error) {
        console.error('Error fetching surah:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurah();
  }, [id, translation]);

  useEffect(() => {
    if (!surahArabic) return;
    setLastRead({
      surah: surahArabic.number,
      surahName: surahArabic.englishName,
      numberInSurah: 1,
    });
  }, [surahArabic]);

  useEffect(() => {
    if (hasScrolledToHash.current || !surahArabic || !location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToHash.current = true;
    }
  }, [surahArabic, location.hash]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-gold-500" />
        </motion.div>
      </div>
    );
  }

  if (!surahArabic || !surahTranslation) {
    return <div className="text-center p-8 text-stone-500 font-medium">Surah not found.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8F4EA]/85 backdrop-blur-xl border-b border-gold-400/20 pb-6 mb-10 pt-6 px-4 -mx-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <Link to="/quran" className="flex items-center gap-3 text-stone-600 hover:text-emerald-700 transition-colors group">
            <div className="p-2 bg-white rounded-full shadow-sm border border-stone-200/60 group-hover:shadow-md group-hover:border-gold-300/60 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">Back to List</span>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setHifzMode(!hifzMode)}
              title="Hifz Mode: hides translation and loops each ayah for memorization"
              className={`p-3 rounded-full transition-all ${hifzMode ? 'icon-badge shadow-inner' : 'bg-white text-stone-600 shadow-sm border border-stone-200/60 hover:shadow-md hover:text-emerald-600'}`}
            >
              <GraduationCap className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-full transition-all ${showSettings ? 'icon-badge shadow-inner' : 'bg-white text-stone-600 shadow-sm border border-stone-200/60 hover:shadow-md hover:text-emerald-600'}`}
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="surface p-6 rounded-[2rem] shadow-lg mb-8 overflow-hidden"
            >
              <label className="block text-sm font-bold text-stone-700 mb-3">Translation Language</label>
              <select
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl input-premium outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu (Fallback to English)</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-serif text-emerald-800 mb-3 tracking-tight"
          >
            {surahArabic.name}
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-stone-800 mb-2 tracking-tight"
          >
            {surahArabic.englishName}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 font-medium flex items-center justify-center gap-2 text-sm"
          >
            <span>{surahArabic.englishNameTranslation}</span>
            <span className="w-1 h-1 rounded-full bg-gold-400"></span>
            <span>{surahArabic.revelationType}</span>
            <span className="w-1 h-1 rounded-full bg-gold-400"></span>
            <span>{surahArabic.numberOfAyahs} Ayahs</span>
          </motion.p>
        </div>
      </div>

      {/* Bismillah */}
      {surahArabic.number !== 1 && surahArabic.number !== 9 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-10 mb-12 border-b border-gold-400/20"
        >
          <p className="text-4xl md:text-5xl font-arabic text-emerald-900 leading-loose">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </motion.div>
      )}

      {/* Ayahs */}
      <div className="space-y-8">
        {surahArabic.ayahs.map((ayah, index) => {
          const transAyah = surahTranslation.ayahs[index];
          // Remove Bismillah from the first ayah text if it's not Surah Al-Fatiha
          let arabicText = ayah.text;
          if (surahArabic.number !== 1 && index === 0 && arabicText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
            arabicText = arabicText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
          }

          const isBookmarked = quranBookmarks.some(
            (b) => b.surah === surahArabic.number && b.ayah === ayah.number
          );
          const isMemorized = (hifzProgress[surahArabic.number] || []).includes(ayah.number);

          return (
            <motion.div
              id={`ayah-${ayah.numberInSurah}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              key={ayah.number}
              className={`bg-white/85 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border transition-all duration-300 scroll-mt-40 ${playingAyah === ayah.number ? 'border-gold-400/60 shadow-gold-500/10 shadow-lg scale-[1.01]' : 'border-stone-200/60 hover:shadow-md hover:border-gold-300/40'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 icon-badge rounded-2xl text-lg font-bold">
                  {ayah.numberInSurah}
                </div>
                <div className="flex gap-3">
                  {hifzMode && (
                    <button
                      onClick={() => toggleHifzAyah(surahArabic.number, ayah.number)}
                      title={isMemorized ? 'Marked as memorized' : 'Mark as memorized'}
                      className={`p-3 transition-all duration-300 rounded-2xl ${
                        isMemorized
                          ? 'text-white bg-emerald-600 border border-emerald-500 shadow-md'
                          : 'text-stone-400 bg-stone-50 hover:text-emerald-700 hover:bg-gold-50'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      toggleQuranBookmark({
                        surah: surahArabic.number,
                        surahName: surahArabic.englishName,
                        ayah: ayah.number,
                        numberInSurah: ayah.numberInSurah,
                        addedAt: Date.now(),
                      })
                    }
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this ayah'}
                    className={`p-3 transition-all duration-300 rounded-2xl ${
                      isBookmarked
                        ? 'text-white bg-gold-500 border border-gold-400 shadow-md'
                        : 'text-stone-400 bg-stone-50 hover:text-gold-600 hover:bg-gold-50'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleAyahAudio(ayah.number)}
                    className={`p-3 transition-all duration-300 rounded-2xl ${
                      playingAyah === ayah.number
                        ? 'text-white bg-[#0B3D2E] border border-gold-400/50 shadow-md scale-105'
                        : 'text-stone-400 bg-stone-50 hover:text-emerald-700 hover:bg-gold-50 hover:shadow-sm'
                    }`}
                  >
                    {playingAyah === ayah.number ? (
                      <PauseCircle className="w-6 h-6" />
                    ) : (
                      <PlayCircle className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-10 text-right">
                <p className={`${ARABIC_FONT_SIZES[arabicFontSize]} font-arabic text-stone-900 leading-[2.5] md:leading-[2.5]`} dir="rtl">
                  {arabicText}
                </p>
              </div>

              {!hifzMode && (
                <div className="pt-8 border-t border-stone-100/80">
                  <p className="text-xl text-stone-600 leading-relaxed font-medium">
                    {transAyah.text}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
