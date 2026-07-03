export interface DuaOfDay {
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
}

const POOL: DuaOfDay[] = [
  {
    title: 'Dua for Increase in Knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidni 'ilma.",
    translation: 'My Lord, increase me in knowledge.',
    reference: 'Quran 20:114',
  },
  {
    title: 'Sufficiency in Allah',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
    transliteration: "Hasbiyallahu la ilaha illa huwa, 'alayhi tawakkaltu.",
    translation: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied.',
    reference: 'Quran 9:129',
  },
  {
    title: 'Dua for Good in Both Worlds',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    reference: 'Quran 2:201',
  },
  {
    title: 'General Istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullahal-'azimal-ladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh.",
    translation: 'I seek forgiveness from Allah, the Mighty, and I turn to Him in repentance.',
    reference: 'Abu Dawud, Tirmidhi',
  },
  {
    title: 'Dua for Ease',
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
    transliteration: "Allahumma la sahla illa ma ja'altahu sahla.",
    translation: 'O Allah, there is no ease except in that which You have made easy.',
    reference: 'Ibn Hibban',
  },
  {
    title: 'Dua for Parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-hamhuma kama rabbayani saghira.',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Quran 17:24',
  },
  {
    title: 'Dua for Steadfastness of Faith',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    transliteration: "Ya Muqallibal-qulubi thabbit qalbi 'ala dinik.",
    translation: 'O Turner of the hearts, make my heart firm upon Your religion.',
    reference: 'Tirmidhi',
  },
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDuaOfTheDay(date: Date = new Date()): DuaOfDay {
  return POOL[dayOfYear(date) % POOL.length];
}
