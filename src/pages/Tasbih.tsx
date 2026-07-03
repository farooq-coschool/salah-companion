import { useMemo, useState } from 'react';
import { RotateCcw, Minus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../store/useSettingsStore';

const DHIKR_PHRASES = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', label: 'SubhanAllah' },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', label: 'Alhamdulillah' },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', label: 'Allahu Akbar' },
  { id: 'lailahaillallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', label: 'La ilaha illallah' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', label: 'Astaghfirullah' },
];

const TARGET_PRESETS = [33, 99, 100, 1000];

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function Tasbih() {
  const { tasbihHistory, tasbihTarget, addTasbihCount, resetTasbihToday, setTasbihTarget } = useSettingsStore();
  const [activePhrase, setActivePhrase] = useState(DHIKR_PHRASES[0].id);
  const [pulse, setPulse] = useState(false);

  const phrase = DHIKR_PHRASES.find((p) => p.id === activePhrase)!;

  const countToday = useMemo(() => {
    const entry = tasbihHistory.find((h) => h.date === todayKey() && h.phrase === activePhrase);
    return entry?.count || 0;
  }, [tasbihHistory, activePhrase]);

  const totalAllTime = useMemo(
    () => tasbihHistory.filter((h) => h.phrase === activePhrase).reduce((sum, h) => sum + h.count, 0),
    [tasbihHistory, activePhrase]
  );

  const handleTap = () => {
    addTasbihCount(activePhrase, 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
    if ('vibrate' in navigator) {
      navigator.vibrate(countToday + 1 === tasbihTarget ? [40, 30, 40] : 15);
    }
  };

  const progress = Math.min(100, (countToday / tasbihTarget) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <p className="eyebrow-gold justify-center mb-2">Dhikr &amp; Remembrance</p>
        <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Tasbih Counter</h1>
      </div>

      {/* Phrase selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
        {DHIKR_PHRASES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePhrase(p.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              activePhrase === p.id
                ? 'bg-[#0B3D2E] text-gold-200 shadow-md border border-gold-400/40'
                : 'surface text-stone-600 hover:border-gold-300/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="surface p-10 rounded-[2.5rem] flex flex-col items-center gap-8">
        <p className="text-4xl md:text-5xl font-arabic text-emerald-900 text-center" dir="rtl">
          {phrase.arabic}
        </p>

        {/* Counter ring */}
        <button
          onClick={handleTap}
          className="relative w-56 h-56 rounded-full select-none active:scale-95 transition-transform"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg className="absolute inset-0 -rotate-90 w-full h-full">
            <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="10" />
            <motion.circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="url(#tasbih-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="289%"
              animate={{ strokeDashoffset: `${289 - (289 * progress) / 100}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            />
            <defs>
              <linearGradient id="tasbih-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#D4AF37" />
                <stop offset="1" stopColor="#0B3D2E" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#06231A] shadow-2xl border border-gold-400/30 flex flex-col items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={countToday}
                initial={{ scale: pulse ? 1.15 : 1, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-gold-100 font-serif"
              >
                {countToday}
              </motion.span>
            </AnimatePresence>
            <span className="text-emerald-200/50 text-xs uppercase tracking-widest font-bold mt-2">
              of {tasbihTarget}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => resetTasbihToday(activePhrase)}
            className="p-3 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
            title="Reset today's count"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => addTasbihCount(activePhrase, -1)}
            disabled={countToday === 0}
            className="p-3 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-40"
            title="Undo last tap"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gold-600" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest mr-2">Target</span>
          {TARGET_PRESETS.map((t) => (
            <button
              key={t}
              onClick={() => setTasbihTarget(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                tasbihTarget === t ? 'bg-gold-400 text-emerald-950' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="text-sm text-stone-400">All-time: {totalAllTime.toLocaleString()} {phrase.label}</p>
      </div>
    </motion.div>
  );
}
