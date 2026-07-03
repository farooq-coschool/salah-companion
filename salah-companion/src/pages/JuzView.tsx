import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { ArrowLeft, Loader2, Settings2, PlayCircle, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Global registry to prevent Audio objects from being garbage collected
// while their play() promise is pending.
const activeAudios = new Set<HTMLAudioElement>();

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: SurahInfo;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

interface JuzData {
  number: number;
  ayahs: Ayah[];
}

export default function JuzView() {
  const { id } = useParams<{ id: string }>();
  const { translation, setTranslation } = useSettingsStore();
  const [juzArabic, setJuzArabic] = useState<JuzData | null>(null);
  const [juzTranslation, setJuzTranslation] = useState<JuzData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

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
      
      audioRef.current = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`);
      activeAudios.add(audioRef.current);
      
      setPlayingAyah(ayahNumber);
      audioRef.current.onended = () => {
        setPlayingAyah(null);
        if (audioRef.current) activeAudios.delete(audioRef.current);
      };

      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Audio playback failed:', error);
            setPlayingAyah(null);
          }
          if (audioRef.current) activeAudios.delete(audioRef.current);
        });
      }
    }
  };

  const getTranslationEdition = (lang: string) => {
    switch (lang) {
      case 'en': return 'en.asad';
      case 'ur': return 'ur.jalandhry';
      case 'hi': return 'hi.farooq';
      case 'te': return 'en.asad'; // Fallback for Telugu
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
    const fetchJuz = async () => {
      setLoading(true);
      try {
        const edition = getTranslationEdition(translation);
        const [arabicRes, transRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`),
          fetch(`https://api.alquran.cloud/v1/juz/${id}/${edition}`)
        ]);
        
        const arabicData = await arabicRes.json();
        const transData = await transRes.json();
        
        if (arabicData.code === 200 && transData.code === 200) {
          setJuzArabic(arabicData.data);
          setJuzTranslation(transData.data);
        }
      } catch (error) {
        console.error('Error fetching juz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJuz();
  }, [id, translation]);

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

  if (!juzArabic || !juzTranslation) {
    return <div className="text-center p-8 text-stone-500 font-medium">Juz not found.</div>;
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
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full transition-all ${showSettings ? 'icon-badge shadow-inner' : 'bg-white text-stone-600 shadow-sm border border-stone-200/60 hover:shadow-md hover:text-emerald-600'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
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
            Juz {juzArabic.number}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-stone-500 font-medium text-sm"
          >
            {juzArabic.ayahs.length} Ayahs
          </motion.p>
        </div>
      </div>

      {/* Ayahs */}
      <div className="space-y-8">
        {juzArabic.ayahs.map((ayah, index) => {
          const transAyah = juzTranslation.ayahs[index];
          let arabicText = ayah.text;
          
          // Show Surah header if it's the first ayah of the Juz or if the Surah changes
          const prevAyah = index > 0 ? juzArabic.ayahs[index - 1] : null;
          const isNewSurah = !prevAyah || prevAyah.surah.number !== ayah.surah.number;

          // Remove Bismillah from the first ayah text if it's not Surah Al-Fatiha
          if (ayah.surah.number !== 1 && ayah.numberInSurah === 1 && arabicText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
            arabicText = arabicText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              key={ayah.number}
            >
              {isNewSurah && (
                <div className="text-center py-10 mb-10 border-b border-gold-400/20">
                  <p className="eyebrow-gold justify-center mb-3">Surah {ayah.surah.number}</p>
                  <h2 className="text-3xl font-bold font-serif text-emerald-800 mb-3 tracking-tight">{ayah.surah.name}</h2>
                  <p className="text-stone-500 font-medium mb-8">{ayah.surah.englishName} - {ayah.surah.englishNameTranslation}</p>
                  {ayah.surah.number !== 1 && ayah.surah.number !== 9 && (
                    <p className="text-4xl md:text-5xl font-arabic text-emerald-900 leading-loose">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  )}
                </div>
              )}
              
              <div className={`bg-white/85 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border transition-all duration-300 ${playingAyah === ayah.number ? 'border-gold-400/60 shadow-gold-500/10 shadow-lg scale-[1.01]' : 'border-stone-200/60 hover:shadow-md hover:border-gold-300/40'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 icon-badge rounded-2xl font-bold text-lg">
                      {ayah.numberInSurah}
                    </div>
                    <span className="text-sm font-bold text-stone-400 uppercase tracking-widest bg-stone-100/50 px-3 py-1.5 rounded-lg">
                      {ayah.surah.englishName}
                    </span>
                  </div>
                  <div className="flex gap-3">
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
                  <p className="text-4xl md:text-5xl font-arabic text-stone-900 leading-[2.5] md:leading-[2.5]" dir="rtl">
                    {arabicText}
                  </p>
                </div>
                
                <div className="pt-8 border-t border-stone-100/80">
                  <p className="text-xl text-stone-600 leading-relaxed font-medium">
                    {transAyah.text}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
