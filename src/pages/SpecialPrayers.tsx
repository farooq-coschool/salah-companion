import { useState } from 'react';
import {
  Moon, Star, PartyPopper, MoonStar, Sunset, Compass, Flower, Sunrise,
  HandHeart, CloudRain, Feather, CircleOff, ArrowRight, ArrowLeft, BookMarked,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecitationItem {
  label: string;
  surah: string;
}

interface SpecialPrayer {
  id: string;
  title: string;
  icon: any;
  description: string;
  steps: string[];
  recitation: {
    items: RecitationItem[];
    note?: string;
  };
}

export default function SpecialPrayers() {
  const [selectedPrayer, setSelectedPrayer] = useState<SpecialPrayer | null>(null);
  const [stage, setStage] = useState<'instructions' | 'recitation'>('instructions');

  const selectPrayer = (prayer: SpecialPrayer) => {
    setSelectedPrayer(prayer);
    setStage('instructions');
  };

  const prayers: SpecialPrayer[] = [
    {
      id: 'taraweeh',
      title: 'Taraweeh',
      icon: Moon,
      description: 'Special prayers performed during the month of Ramadan after Isha.',
      steps: [
        'Perform Isha prayer as usual.',
        'Make intention (niyyah) for Taraweeh prayer.',
        "Pray in sets of 2 Raka'at.",
        "Usually performed as 8 or 20 Raka'at depending on the local custom.",
        'Conclude with Witr prayer.',
      ],
      recitation: {
        items: [
          { label: 'Common Practice', surah: "One Juz (para) recited progressively each night, completing the full Qur'an by the end of Ramadan" },
          { label: 'If Reciting Individually', surah: 'Any two surahs you know well, such as Al-Mulk and Al-Insan' },
        ],
      },
    },
    {
      id: 'lailatul-qadr',
      title: 'Lailatul Qadr',
      icon: Star,
      description: 'The Night of Decree, better than a thousand months. Focus on abundant worship.',
      steps: [
        'Perform Isha and Taraweeh prayers.',
        'Engage in Qiyam al-Layl (night prayers) in sets of 2 Raka\'at.',
        'Recite the Qur\'an abundantly.',
        'Make abundant Dua, especially: "Allahumma innaka \'afuwwun tuhibbul \'afwa fa\'fu \'anni".',
        'Seek forgiveness and make personal supplications until Fajr.',
      ],
      recitation: {
        items: [
          { label: 'Highly Recommended', surah: "Surah Al-Qadr (97), reflecting on the night's virtue" },
          { label: 'Also Recommended', surah: 'Lengthy portions of the Qur\'an alongside abundant dhikr and dua' },
        ],
      },
    },
    {
      id: 'eid',
      title: 'Eid Prayer',
      icon: PartyPopper,
      description: 'The special congregational prayer performed on the morning of Eid.',
      steps: [
        "Make intention for Eid prayer (2 Raka'at with 6 extra Takbeers).",
        "First Raka'at: 3 extra Takbeers before reciting Surah Al-Fatiha.",
        "Second Raka'at: 3 extra Takbeers before going into Ruku.",
        'Listen to the Khutbah (sermon) after the prayer is completed.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah (after the extra Takbeers)', surah: "Surah Al-A'la (87)" },
          { label: '2nd Rakah (after the extra Takbeers)', surah: 'Surah Al-Ghashiyah (88)' },
        ],
        note: 'Some narrations also mention Surah Qaf (50) and Surah Al-Qamar (54) as alternatives.',
      },
    },
    {
      id: 'tahajjud',
      title: 'Tahajjud',
      icon: MoonStar,
      description: 'A voluntary night prayer offered after waking from sleep, in the last third of the night. It was never left by the Prophet ﷺ.',
      steps: [
        'Sleep for at least part of the night, then wake before Fajr — ideally in the last third of the night.',
        'Perform wudu and pray in a calm, unhurried manner.',
        "Pray in sets of 2 Raka'at — commonly 8, though any number is acceptable.",
        'Recite the Qur\'an slowly, pausing to reflect on its meaning.',
        'Conclude the night prayers with Witr if you have not already prayed it.',
      ],
      recitation: {
        items: [
          { label: 'Sunnah Practice', surah: 'Lengthy portions such as Al-Baqarah, Al-Imran, or An-Nisa, spread over multiple raka\'at' },
          { label: 'For Beginners', surah: 'Any surahs you know well — even short ones are perfectly acceptable' },
        ],
      },
    },
    {
      id: 'witr',
      title: 'Witr',
      icon: Sunset,
      description: "An odd-numbered prayer that closes the night's voluntary prayers, ranging from 1 to 11 raka'at. It is a confirmed Sunnah.",
      steps: [
        'Pray any time after Isha, up until Fajr (the very end of the night is best if you can wake for it).',
        "Pray in sets of 2 Raka'at, finishing with a single, final Raka'ah.",
        'In the final Raka\'ah, recite the Qunut supplication before or after Ruku.',
        'Complete the prayer with the Tashahhud and Salam.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah', surah: "Surah Al-A'la (87)" },
          { label: '2nd Rakah', surah: 'Surah Al-Kafirun (109)' },
          { label: '3rd (Final) Rakah', surah: 'Surah Al-Ikhlas (112), sometimes followed by Al-Falaq and An-Nas' },
        ],
      },
    },
    {
      id: 'istikhara',
      title: 'Istikhara',
      icon: Compass,
      description: "A prayer seeking Allah's guidance when facing a decision, performed before making a choice you're unsure about.",
      steps: [
        'Have a specific matter or decision in mind before you begin.',
        "Pray 2 voluntary Raka'at, separate from any obligatory prayer.",
        'After Salam, recite the dua of Istikhara, mentioning your specific matter.',
        'Proceed with an open heart — trust that Allah will guide your circumstances toward what is best.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah (after Al-Fatiha)', surah: 'Surah Al-Kafirun (109) is recommended, though any surah is valid' },
          { label: '2nd Rakah (after Al-Fatiha)', surah: 'Surah Al-Ikhlas (112) is recommended, though any surah is valid' },
        ],
        note: 'The dua of Istikhara itself can be found in the Knowledge & Guidance section of Duas.',
      },
    },
    {
      id: 'janazah',
      title: 'Janazah (Funeral)',
      icon: Flower,
      description: "A communal obligation (fard kifayah) prayed for a deceased Muslim, performed standing, without ruku' or sujud.",
      steps: [
        'Stand in rows facing the Qiblah, with the body placed in front of the congregation.',
        'Make the intention (niyyah) for the funeral prayer.',
        'Say the first Takbir, then recite Surah Al-Fatiha silently.',
        'Say the second Takbir, then recite Salawat (blessings) upon the Prophet ﷺ.',
        'Say the third Takbir, then recite a dua for the deceased.',
        'Say the fourth Takbir, then conclude with Salam to the right and left.',
      ],
      recitation: {
        items: [
          { label: 'After 1st Takbir', surah: 'Surah Al-Fatiha (recited silently)' },
          { label: 'After 2nd Takbir', surah: 'Darood / Salawat upon the Prophet ﷺ' },
          { label: 'After 3rd Takbir', surah: 'A dua for the deceased, e.g. "Allahumma-ghfir li hayyina..."' },
        ],
        note: 'This prayer has no bowing or prostration — only four Takbirs, standing recitation, and dua.',
      },
    },
    {
      id: 'duha',
      title: 'Duha (Chasht)',
      icon: Sunrise,
      description: "A voluntary forenoon prayer offered after sunrise, once the sun has fully risen, until just before Dhuhr.",
      steps: [
        'Wait until the sun has fully risen (roughly 15–20 minutes after sunrise).',
        "Pray in sets of 2 Raka'at — a minimum of 2, though 4 or 8 are also reported.",
        'Recite with sincerity — this prayer is described as charity on behalf of every joint in the body.',
        'Perform it any time before Dhuhr enters.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah', surah: 'Surah Ash-Shams (91)' },
          { label: '2nd Rakah', surah: 'Surah Ad-Duha (93)' },
        ],
        note: 'These two are commonly recommended for their connection to daylight and morning, though any surahs are valid.',
      },
    },
    {
      id: 'hajah',
      title: 'Salat al-Hajah',
      icon: HandHeart,
      description: 'A voluntary prayer performed when seeking Allah\'s help for a specific need or difficult matter.',
      steps: [
        'Perform wudu carefully and completely.',
        "Pray 2 voluntary Raka'at with full presence of heart.",
        'After Salam, praise Allah, send blessings upon the Prophet ﷺ, then ask sincerely for your need.',
        'Be specific and persistent in your dua, and maintain good expectations of Allah.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah (after Al-Fatiha)', surah: 'Any surah you know well — none is specifically required' },
          { label: '2nd Rakah (after Al-Fatiha)', surah: 'Any surah you know well — none is specifically required' },
        ],
      },
    },
    {
      id: 'istisqa',
      title: 'Istisqa (Rain Prayer)',
      icon: CloudRain,
      description: 'A special congregational prayer performed to ask Allah for rain during times of drought.',
      steps: [
        'The community gathers in an open area, often in humble dress and having fasted beforehand.',
        "Pray 2 Raka'at, similar in style to the Eid prayer, with extra Takbeers.",
        'The Imam delivers a khutbah reminding the people to repent and turn to Allah.',
        'The Imam faces the Qiblah and reverses his cloak as a symbolic gesture, then makes dua for rain.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah', surah: "Surah Al-A'la (87)" },
          { label: '2nd Rakah', surah: 'Surah Al-Ghashiyah (88)' },
        ],
        note: 'The style of recitation mirrors the Eid prayer.',
      },
    },
    {
      id: 'tawbah',
      title: 'Salat al-Tawbah',
      icon: Feather,
      description: 'A voluntary prayer performed after committing a sin, as a means of turning back to Allah in sincere repentance.',
      steps: [
        'Perform wudu, ideally right after realizing the sin.',
        "Pray 2 sincere Raka'at.",
        'After Salam, seek Allah\'s forgiveness (Istighfar) and resolve firmly not to return to the sin.',
        'Follow the sin with a good deed, as good deeds erase bad ones.',
      ],
      recitation: {
        items: [
          { label: '1st Rakah (after Al-Fatiha)', surah: 'Any surah you know well' },
          { label: '2nd Rakah (after Al-Fatiha)', surah: 'Any surah you know well' },
        ],
      },
    },
    {
      id: 'kusuf',
      title: 'Kusuf (Eclipse Prayer)',
      icon: CircleOff,
      description: "A special prayer performed during a solar or lunar eclipse, reminding believers of Allah's power over creation.",
      steps: [
        'Gather in congregation as soon as the eclipse is noticed.',
        "Pray 2 Raka'at, each containing two Ruku' and two Sujud — longer than a normal prayer.",
        'Recitation is lengthy, often a full long surah recited in each standing.',
        'The Imam delivers a khutbah afterward, encouraging charity, dhikr, and dua.',
      ],
      recitation: {
        items: [
          { label: '1st Standing (1st Rakah)', surah: 'A lengthy surah such as Al-Baqarah, or any long surah you know' },
          { label: '2nd Standing (same Rakah, after the 1st Ruku)', surah: 'Another lengthy surah, somewhat shorter than the first' },
          { label: '2nd Rakah', surah: 'Follows the same pattern — two standings and two bowings' },
        ],
      },
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <p className="eyebrow-gold mb-2">Sacred Occasions</p>
        <h1 className="text-4xl font-bold font-serif text-stone-900 mb-3 tracking-tight">Special Prayers</h1>
        <p className="text-lg text-stone-600">Guides for special occasions and night prayers.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {prayers.map((prayer, index) => (
            <motion.button
              key={prayer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectPrayer(prayer)}
              className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 ${
                selectedPrayer?.id === prayer.id
                  ? 'bg-[#0B3D2E] border-gold-400/50 shadow-lg shadow-emerald-950/20 scale-[1.02]'
                  : 'surface surface-interactive hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl icon-badge">
                    <prayer.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold tracking-tight mb-1 ${selectedPrayer?.id === prayer.id ? 'text-gold-50' : 'text-stone-800'}`}>{prayer.title}</h3>
                    <p className={`text-sm line-clamp-1 ${selectedPrayer?.id === prayer.id ? 'text-emerald-200/70' : 'text-stone-500'}`}>{prayer.description}</p>
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 transition-colors shrink-0 ${
                  selectedPrayer?.id === prayer.id ? 'text-gold-300' : 'text-stone-300'
                }`} />
              </div>
            </motion.button>
          ))}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selectedPrayer ? (
              <motion.div 
                key={`${selectedPrayer.id}-${stage}`}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="surface p-8 rounded-[2.5rem] sticky top-24"
              >
                {stage === 'instructions' ? (
                  <>
                    <div className="flex items-center gap-5 mb-8">
                      <div className="icon-badge p-4 rounded-2xl">
                        <selectedPrayer.icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold font-serif text-stone-900 tracking-tight">{selectedPrayer.title}</h2>
                    </div>
                    
                    <p className="text-lg text-stone-600 mb-10 leading-relaxed">
                      {selectedPrayer.description}
                    </p>

                    <div className="space-y-6 mb-10">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-stone-800 tracking-tight">Step-by-Step Guide</h3>
                        <div className="flex-1 divider-gold opacity-40" />
                      </div>
                      <ol className="space-y-5">
                        {selectedPrayer.steps.map((step, index) => (
                          <motion.li 
                            key={index} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-5"
                          >
                            <div className="flex-shrink-0 w-10 h-10 icon-badge rounded-2xl font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="text-stone-700 pt-2 leading-relaxed">{step}</p>
                          </motion.li>
                        ))}
                      </ol>
                    </div>

                    <button
                      onClick={() => setStage('recitation')}
                      className="btn-gold w-full py-4 rounded-2xl"
                    >
                      Continue to Recitation
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setStage('instructions')}
                      className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-emerald-700 transition-colors mb-8"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Instructions
                    </button>

                    <div className="flex items-center gap-5 mb-8">
                      <div className="icon-badge p-4 rounded-2xl">
                        <BookMarked className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="eyebrow-gold mb-1">{selectedPrayer.title}</p>
                        <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Recommended Recitation</h2>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {selectedPrayer.recitation.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-5 rounded-2xl bg-gold-50/60 border border-gold-200/60"
                        >
                          <p className="eyebrow-gold !text-gold-600/80 mb-1.5 text-[10px]">{item.label}</p>
                          <p className="text-stone-800 font-semibold leading-relaxed">{item.surah}</p>
                        </motion.div>
                      ))}
                    </div>

                    {selectedPrayer.recitation.note && (
                      <p className="text-sm text-stone-500 leading-relaxed italic border-t border-gold-400/15 pt-5">
                        {selectedPrayer.recitation.note}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden md:flex flex-col items-center justify-center h-full min-h-[500px] bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gold-400/30 text-stone-400 p-8 text-center"
              >
                <Star className="w-16 h-16 mb-6 text-gold-300" />
                <p className="text-xl font-medium text-stone-500">Select a prayer to view its guide</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
