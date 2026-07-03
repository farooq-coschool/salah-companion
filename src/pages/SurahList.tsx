import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, BookOpen, List, ChevronRight, BookMarked, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../store/useSettingsStore';

interface QuranSearchMatch {
  number: number;
  text: string;
  surah: { number: number; englishName: string; name: string };
  numberInSurah: number;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const JUZ_MAPPING = [
  { juz: 1, surahs: [1, 2] },
  { juz: 2, surahs: [2] },
  { juz: 3, surahs: [2, 3] },
  { juz: 4, surahs: [3, 4] },
  { juz: 5, surahs: [4] },
  { juz: 6, surahs: [4, 5] },
  { juz: 7, surahs: [5, 6] },
  { juz: 8, surahs: [6, 7] },
  { juz: 9, surahs: [7, 8] },
  { juz: 10, surahs: [8, 9] },
  { juz: 11, surahs: [9, 10, 11] },
  { juz: 12, surahs: [11, 12] },
  { juz: 13, surahs: [12, 13, 14] },
  { juz: 14, surahs: [15, 16] },
  { juz: 15, surahs: [17, 18] },
  { juz: 16, surahs: [18, 19, 20] },
  { juz: 17, surahs: [21, 22] },
  { juz: 18, surahs: [23, 24, 25] },
  { juz: 19, surahs: [25, 26, 27] },
  { juz: 20, surahs: [27, 28, 29] },
  { juz: 21, surahs: [29, 30, 31, 32, 33] },
  { juz: 22, surahs: [33, 34, 35, 36] },
  { juz: 23, surahs: [36, 37, 38, 39] },
  { juz: 24, surahs: [39, 40, 41] },
  { juz: 25, surahs: [41, 42, 43, 44, 45] },
  { juz: 26, surahs: [46, 47, 48, 49, 50, 51] },
  { juz: 27, surahs: [51, 52, 53, 54, 55, 56, 57] },
  { juz: 28, surahs: [58, 59, 60, 61, 62, 63, 64, 65, 66] },
  { juz: 29, surahs: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77] },
  { juz: 30, surahs: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] }
];

const SURAH_TO_JUZ: Record<number, string> = {
  1: "Juz 1", 2: "Juz 1-3", 3: "Juz 3-4", 4: "Juz 4-6", 5: "Juz 6-7",
  6: "Juz 7-8", 7: "Juz 8-9", 8: "Juz 9-10", 9: "Juz 10-11", 10: "Juz 11",
  11: "Juz 11-12", 12: "Juz 12-13", 13: "Juz 13", 14: "Juz 13", 15: "Juz 14",
  16: "Juz 14", 17: "Juz 15", 18: "Juz 15-16", 19: "Juz 16", 20: "Juz 16",
  21: "Juz 17", 22: "Juz 17", 23: "Juz 18", 24: "Juz 18", 25: "Juz 18-19",
  26: "Juz 19", 27: "Juz 19-20", 28: "Juz 20", 29: "Juz 20-21", 30: "Juz 21",
  31: "Juz 21", 32: "Juz 21", 33: "Juz 21-22", 34: "Juz 22", 35: "Juz 22",
  36: "Juz 22-23", 37: "Juz 23", 38: "Juz 23", 39: "Juz 23-24", 40: "Juz 24",
  41: "Juz 24-25", 42: "Juz 25", 43: "Juz 25", 44: "Juz 25", 45: "Juz 25",
  46: "Juz 26", 47: "Juz 26", 48: "Juz 26", 49: "Juz 26", 50: "Juz 26",
  51: "Juz 26-27", 52: "Juz 27", 53: "Juz 27", 54: "Juz 27", 55: "Juz 27",
  56: "Juz 27", 57: "Juz 27", 58: "Juz 28", 59: "Juz 28", 60: "Juz 28",
  61: "Juz 28", 62: "Juz 28", 63: "Juz 28", 64: "Juz 28", 65: "Juz 28",
  66: "Juz 28", 67: "Juz 29", 68: "Juz 29", 69: "Juz 29", 70: "Juz 29",
  71: "Juz 29", 72: "Juz 29", 73: "Juz 29", 74: "Juz 29", 75: "Juz 29",
  76: "Juz 29", 77: "Juz 29", 78: "Juz 30", 79: "Juz 30", 80: "Juz 30",
  81: "Juz 30", 82: "Juz 30", 83: "Juz 30", 84: "Juz 30", 85: "Juz 30",
  86: "Juz 30", 87: "Juz 30", 88: "Juz 30", 89: "Juz 30", 90: "Juz 30",
  91: "Juz 30", 92: "Juz 30", 93: "Juz 30", 94: "Juz 30", 95: "Juz 30",
  96: "Juz 30", 97: "Juz 30", 98: "Juz 30", 99: "Juz 30", 100: "Juz 30",
  101: "Juz 30", 102: "Juz 30", 103: "Juz 30", 104: "Juz 30", 105: "Juz 30",
  106: "Juz 30", 107: "Juz 30", 108: "Juz 30", 109: "Juz 30", 110: "Juz 30",
  111: "Juz 30", 112: "Juz 30", 113: "Juz 30", 114: "Juz 30"
};

export default function SurahList() {
  const { lastRead, translation } = useSettingsStore();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  const juzContainerRef = useRef<HTMLDivElement>(null);

  const [textSearchOpen, setTextSearchOpen] = useState(false);
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [textSearchLoading, setTextSearchLoading] = useState(false);
  const [textSearchResults, setTextSearchResults] = useState<QuranSearchMatch[] | null>(null);

  const runTextSearch = async () => {
    if (!textSearchQuery.trim()) return;
    setTextSearchLoading(true);
    setTextSearchResults(null);
    try {
      const edition = translation === 'en' || !translation ? 'en' : translation;
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(textSearchQuery.trim())}/all/${edition}`
      );
      const data = await response.json();
      setTextSearchResults(data.code === 200 ? data.data.matches : []);
    } catch {
      setTextSearchResults([]);
    } finally {
      setTextSearchLoading(false);
    }
  };

  const juzs = Array.from({ length: 30 }, (_, i) => i + 1);

  const scrollToJuz = (juzNumber: number) => {
    const element = document.getElementById(`juz-${juzNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        }
      } catch (error) {
        console.error('Error fetching surahs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter((surah) =>
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.number.toString() === searchQuery
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <p className="eyebrow-gold mb-2">Kalam Allah</p>
          <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">The Holy Qur'an</h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'surah' ? "Search Surah..." : "Search Juz..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 rounded-2xl leading-5 input-premium placeholder-stone-400 sm:text-sm shadow-sm hover:shadow-md transition-shadow"
            />
          </div>
          <button
            onClick={() => setTextSearchOpen(true)}
            className="btn-gold px-4 py-3 rounded-2xl shrink-0"
            title="Search within the Qur'an text"
          >
            <BookMarked className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Continue Reading */}
      {lastRead && (
        <Link
          to={`/quran/surah/${lastRead.surah}#ayah-${lastRead.numberInSurah}`}
          className="flex items-center gap-4 surface surface-interactive p-5 rounded-3xl"
        >
          <div className="icon-badge p-3 rounded-2xl shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="eyebrow-gold !text-gold-600/80 text-[10px] mb-1">Continue Reading</p>
            <p className="font-bold text-stone-800">{lastRead.surahName} &middot; Ayah {lastRead.numberInSurah}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300" />
        </Link>
      )}

      {/* Full-text search modal */}
      <AnimatePresence>
        {textSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-emerald-950/50 backdrop-blur-md"
            onClick={() => setTextSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FCFAF4] rounded-[2rem] p-6 max-w-2xl w-full shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-900 font-serif">Search the Qur'an</h3>
                <button onClick={() => setTextSearchOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  autoFocus
                  type="text"
                  value={textSearchQuery}
                  onChange={(e) => setTextSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runTextSearch()}
                  placeholder="e.g. patience, mercy, forgiveness..."
                  className="flex-1 px-5 py-3 rounded-2xl input-premium outline-none"
                />
                <button onClick={runTextSearch} className="btn-gold px-5 py-3 rounded-2xl shrink-0">
                  {textSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              <div className="overflow-y-auto space-y-3 flex-1">
                {textSearchResults?.length === 0 && (
                  <p className="text-center text-stone-500 py-8">No matches found.</p>
                )}
                {textSearchResults?.map((match) => (
                  <Link
                    key={match.number}
                    to={`/quran/surah/${match.surah.number}#ayah-${match.numberInSurah}`}
                    onClick={() => setTextSearchOpen(false)}
                    className="block p-4 rounded-2xl bg-white hover:bg-gold-50/50 border border-stone-100 transition-colors"
                  >
                    <p className="text-xs font-bold text-gold-700 uppercase tracking-wide mb-1">
                      {match.surah.englishName} {match.numberInSurah}
                    </p>
                    <p className="text-stone-700 text-sm leading-relaxed">{match.text}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-8 p-1.5 bg-emerald-950/[0.06] backdrop-blur-sm rounded-2xl w-fit border border-stone-900/[0.04]">
        <button
          onClick={() => setActiveTab('surah')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'surah'
              ? 'bg-[#0B3D2E] text-gold-200 shadow-md scale-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 scale-95'
          }`}
        >
          <List className="w-4 h-4" />
          Surahs
        </button>
        <button
          onClick={() => setActiveTab('juz')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'juz'
              ? 'bg-[#0B3D2E] text-gold-200 shadow-md scale-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 scale-95'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Juz (Paare)
        </button>
      </div>

      {activeTab === 'surah' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredSurahs.map((surah, index) => (
              <motion.div
                key={surah.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link
                  to={`/quran/surah/${surah.number}`}
                  className="group surface surface-interactive p-5 rounded-3xl flex items-center gap-5 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 flex-shrink-0 icon-badge rounded-2xl font-bold text-xl group-hover:scale-105 transition-transform duration-300">
                    {surah.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h2 className="text-lg font-bold text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
                        {surah.englishName}
                      </h2>
                      <span className="px-2.5 py-0.5 bg-gold-50 text-gold-700 text-[10px] uppercase tracking-wider font-bold rounded-full border border-gold-200/60">
                        {SURAH_TO_JUZ[surah.number]}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 truncate font-medium">{surah.englishNameTranslation}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold font-arabic text-emerald-800 group-hover:text-gold-600 transition-colors">{surah.name}</p>
                    <p className="text-xs text-stone-400 mt-1.5 font-medium tracking-wide">{surah.numberOfAyahs} Ayahs</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8" 
          ref={juzContainerRef}
        >
          {/* Quick Navigation Bar */}
          <div className="sticky top-0 z-10 bg-[#F8F4EA]/90 backdrop-blur-xl py-4 border-b border-gold-400/20 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {juzs.map((juz) => (
                <button
                  key={juz}
                  onClick={() => scrollToJuz(juz)}
                  className="flex-shrink-0 w-12 h-12 rounded-2xl surface text-stone-600 font-bold hover:bg-[#0B3D2E] hover:text-gold-200 hover:border-gold-400/40 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
                >
                  {juz}
                </button>
              ))}
            </div>
          </div>

          {/* Juz List */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {JUZ_MAPPING
                .filter((mapping) => mapping.juz.toString().includes(searchQuery))
                .map((mapping, index) => {
                  const juzSurahs = surahs.filter(s => mapping.surahs.includes(s.number));
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={mapping.juz} 
                      id={`juz-${mapping.juz}`} 
                      className="surface surface-interactive rounded-[2rem] overflow-hidden scroll-mt-32"
                    >
                    <div className="bg-gradient-to-r from-[#0B3D2E] to-[#0E4A37] p-6 md:p-8 border-b border-gold-400/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/[0.08] text-gold-200 border border-gold-400/30 rounded-2xl flex items-center justify-center font-bold text-3xl">
                          {mapping.juz}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gold-50 font-serif tracking-tight">Juz {mapping.juz}</h2>
                          <p className="text-emerald-200/60 font-medium tracking-wide uppercase text-sm mt-1">Para {mapping.juz}</p>
                        </div>
                      </div>
                      <Link
                        to={`/quran/juz/${mapping.juz}`}
                        className="btn-gold px-6 py-3 rounded-xl"
                      >
                        Read Juz
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                    <div className="divide-y divide-stone-100/80">
                      {juzSurahs.map((surah) => (
                        <Link
                          key={surah.number}
                          to={`/quran/surah/${surah.number}`}
                          className="flex items-center gap-5 p-5 hover:bg-gold-50/50 transition-colors group"
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-stone-100/80 text-stone-500 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-emerald-900 group-hover:text-gold-200 transition-colors">
                            {surah.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                              {surah.englishName}
                            </h3>
                            <p className="text-sm text-stone-500 truncate font-medium">{surah.englishNameTranslation}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold font-arabic text-emerald-800 group-hover:text-gold-600 transition-colors">{surah.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
