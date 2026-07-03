import { useState, useEffect, useRef } from 'react';
import { Search, Heart, Shield, Sun, Moon, Coffee, Play, Square, BookOpen, LifeBuoy, Plane, Users, Sparkles, Share2, Plus, Trash2, X, BookHeart } from 'lucide-react';
import { useSettingsStore, type CustomDua } from '../store/useSettingsStore';

const emptyDuaForm: Omit<CustomDua, 'id'> = { title: '', arabic: '', transliteration: '', translation: '' };

export default function Duas() {
  const { favoriteDuas, toggleFavoriteDua, myDuas, addMyDua, removeMyDua } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [tab, setTab] = useState<'all' | 'favorites' | 'mine'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyDuaForm);

  const shareDua = async (title: string, arabic: string, translation: string) => {
    const text = `${title}\n\n${arabic}\n\n${translation}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch {
        // user cancelled the share sheet — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard access denied — nothing further we can do
      }
    }
  };

  const submitNewDua = () => {
    if (!form.title.trim() || !form.arabic.trim()) return;
    addMyDua({ id: `custom-${Date.now()}`, ...form });
    setForm(emptyDuaForm);
    setShowAddForm(false);
  };

  useEffect(() => {
    // Pre-load voices
    window.speechSynthesis.getVoices();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const playAudio = (id: string, text: string, lang: string = 'ar-SA') => {
    try {
      if (playingId === id) {
        window.speechSynthesis.cancel();
        setPlayingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slightly slower for Arabic
      
      // Try to find a specific voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        setPlayingId(null);
      };
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setPlayingId(null);
      };
      
      utteranceRef.current = utterance; // Prevent garbage collection
      setPlayingId(id);
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Audio playback failed:", error);
      setPlayingId(null);
    }
  };

  const duaCategories = [
    {
      id: 'morning',
      title: 'Morning & Evening',
      icon: Sun,
      duas: [
        {
          id: 'm1',
          title: 'Morning Supplication',
          arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
          transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur.',
          translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return.',
          reference: 'Abu Dawud',
        },
        {
          id: 'm2',
          title: 'Evening Supplication',
          arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
          transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir.',
          translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our final return.',
          reference: 'Tirmidhi',
        },
        {
          id: 'm3',
          title: "Sayyidul Istighfar (Master Supplication for Forgiveness)",
          arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
          transliteration: "Allahumma anta Rabbi, la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li, fa innahu la yaghfirudh-dhunuba illa anta.",
          translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
          reference: 'Bukhari',
        },
        {
          id: 'm4',
          title: 'Dua for Well-Being',
          arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ',
          transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa anta.",
          translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. There is no god but You.',
          reference: 'Abu Dawud',
        },
      ],
    },
    {
      id: 'protection',
      title: 'Protection',
      icon: Shield,
      duas: [
        {
          id: 'p1',
          title: 'Protection from Harm',
          arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
          transliteration: "Bismillahil-ladhi la yadhurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim.",
          translation: 'In the Name of Allah, with Whose Name nothing on the earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
          reference: 'Tirmidhi',
        },
        {
          id: 'p2',
          title: 'Seeking Refuge from Evil of Creation',
          arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
          transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
          translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
          reference: 'Muslim',
        },
        {
          id: 'p3',
          title: 'Protection from Calamity',
          arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ',
          transliteration: "Allahumma inni a'udhu bika min zawali ni'matika, wa tahawwuli 'afiyatika, wa fuja'ati niqmatika, wa jami'i sakhatik.",
          translation: 'O Allah, I seek refuge in You from the decline of Your blessing, the change of Your protection, the suddenness of Your punishment, and all that displeases You.',
          reference: 'Muslim',
        },
        {
          id: 'p4',
          title: 'Sufficiency in Allah',
          arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
          transliteration: "Hasbiyallahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim.",
          translation: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.',
          reference: 'Quran 9:129',
        },
      ],
    },
    {
      id: 'daily',
      title: 'Daily Life',
      icon: Coffee,
      duas: [
        {
          id: 'd1',
          title: 'Before Eating',
          arabic: 'بِسْمِ اللَّهِ',
          transliteration: 'Bismillah.',
          translation: 'In the name of Allah.',
          reference: 'Abu Dawud',
        },
        {
          id: 'd2',
          title: 'After Eating',
          arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
          transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana Muslimin.",
          translation: 'Praise be to Allah Who has fed us, given us drink, and made us Muslims.',
          reference: 'Abu Dawud',
        },
        {
          id: 'd3',
          title: 'Before Sleeping',
          arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
          transliteration: 'Bismika Allahumma amutu wa ahya.',
          translation: 'In Your name, O Allah, I die and I live.',
          reference: 'Bukhari',
        },
        {
          id: 'd4',
          title: 'Upon Waking Up',
          arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
          transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
          translation: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
          reference: 'Bukhari',
        },
        {
          id: 'd5',
          title: 'Entering the Home',
          arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
          transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'alallahi Rabbina tawakkalna.",
          translation: 'In the name of Allah we enter, and in the name of Allah we leave, and upon our Lord we place our trust.',
          reference: 'Abu Dawud',
        },
        {
          id: 'd6',
          title: 'Leaving the Home',
          arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
          transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah.",
          translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
          reference: 'Abu Dawud, Tirmidhi',
        },
        {
          id: 'd7',
          title: 'Wearing New Clothes',
          arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
          transliteration: "Allahumma lakal-hamdu anta kasawtanihi, as'aluka min khayrihi wa khayri ma suni'a lahu, wa a'udhu bika min sharrihi wa sharri ma suni'a lahu.",
          translation: 'O Allah, praise is for You. You have clothed me with it. I ask You for its good and the good of what it was made for, and I seek refuge in You from its evil and the evil of what it was made for.',
          reference: 'Abu Dawud, Tirmidhi',
        },
      ],
    },
    {
      id: 'fateha',
      title: 'Fateha & Khatam',
      icon: Moon,
      duas: [
        {
          id: 'f1',
          title: 'Darood Shareef',
          arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
          transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum-Majid.",
          translation: 'O Allah, let Your Blessings come upon Muhammad and the family of Muhammad, as you have blessed Ibrahim and his family. Truly, You are Praiseworthy and Glorious.',
          reference: 'Bukhari',
        },
        {
          id: 'f2',
          title: 'Surah Al-Fatiha',
          arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ • الرَّحْمَٰنِ الرَّحِيمِ • مَالِكِ يَوْمِ الدِّينِ • إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ • اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          transliteration: "Bismillahir-Rahmanir-Rahim. Alhamdu lillahi Rabbil-'alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin.",
          translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
          reference: 'Quran 1:1-7',
        },
        {
          id: 'f3',
          title: 'Ayat al-Kursi',
          arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
          transliteration: "Allahu la ilaha illa huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi-idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha'a, wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa Huwal-'Aliyyul-'Azim.",
          translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
          reference: 'Quran 2:255',
        },
        {
          id: 'f4',
          title: 'Surah Al-Ikhlas',
          arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
          transliteration: "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.",
          translation: 'Say, He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
          reference: 'Quran 112:1-4',
        },
      ],
    },
    {
      id: 'knowledge',
      title: 'Knowledge & Guidance',
      icon: BookOpen,
      duas: [
        {
          id: 'k1',
          title: 'Dua for Increase in Knowledge',
          arabic: 'رَبِّ زِدْنِي عِلْمًا',
          transliteration: "Rabbi zidni 'ilma.",
          translation: 'My Lord, increase me in knowledge.',
          reference: 'Quran 20:114',
        },
        {
          id: 'k2',
          title: 'Dua for Ease',
          arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
          transliteration: "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla.",
          translation: 'O Allah, there is no ease except in that which You have made easy, and You make the difficult, if You wish, easy.',
          reference: 'Ibn Hibban',
        },
        {
          id: 'k3',
          title: 'Dua Before Studying',
          arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا',
          transliteration: "Allahummanfa'ni bima 'allamtani, wa 'allimni ma yanfa'uni, wa zidni 'ilma.",
          translation: 'O Allah, benefit me with what You have taught me, and teach me what will benefit me, and increase me in knowledge.',
          reference: 'Tirmidhi, Ibn Majah',
        },
        {
          id: 'k4',
          title: 'Dua of Istikhara (Seeking Guidance)',
          arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَٰذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَٰذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
          transliteration: "Allahumma inni astakhiruka bi'ilmika, wa astaqdiruka bi qudratika, wa as'aluka min fadlikal-'azim, fa innaka taqdiru wa la aqdiru, wa ta'lamu wa la a'lamu, wa anta 'allamul-ghuyub. Allahumma in kunta ta'lamu anna hadhal-amra khayrun li fi dini wa ma'ashi wa 'aqibati amri, faqdurhu li wa yassirhu li thumma barik li fih, wa in kunta ta'lamu anna hadhal-amra sharrun li fi dini wa ma'ashi wa 'aqibati amri, fasrifhu 'anni wasrifni 'anhu, waqdur liyal-khayra haythu kana thumma ardini bih.",
          translation: "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. You have power, I have none, and You know, I know not, and You are the Knower of hidden things. O Allah, if in Your knowledge this matter is good for me in my religion, my livelihood, and my affairs, then ordain it for me, make it easy for me, and bless it for me. And if in Your knowledge this matter is bad for me in my religion, my livelihood, and my affairs, then turn it away from me, and turn me away from it, and ordain for me the good wherever it may be, and make me pleased with it.",
          reference: 'Bukhari',
        },
      ],
    },
    {
      id: 'distress',
      title: 'Distress & Hardship',
      icon: LifeBuoy,
      duas: [
        {
          id: 'dr1',
          title: 'Dua for Anxiety and Grief',
          arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
          transliteration: "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim.",
          translation: 'There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.',
          reference: 'Bukhari, Muslim',
        },
        {
          id: 'dr2',
          title: 'Dua of Prophet Yunus (AS)',
          arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
          transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
          translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
          reference: 'Quran 21:87',
        },
        {
          id: 'dr3',
          title: 'Dua for Relief from Hardship',
          arabic: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَٰهَ إِلَّا أَنْتَ',
          transliteration: "Allahumma rahmataka arju fala takilni ila nafsi tarfata 'aynin, wa aslih li sha'ni kullahu, la ilaha illa anta.",
          translation: 'O Allah, it is Your mercy that I hope for, so do not leave me to myself even for the blink of an eye, and set right all of my affairs. There is no deity except You.',
          reference: 'Abu Dawud',
        },
      ],
    },
    {
      id: 'travel',
      title: 'Travel',
      icon: Plane,
      duas: [
        {
          id: 't1',
          title: 'Dua for Starting a Journey',
          arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
          transliteration: "Allahu akbar, Allahu akbar, Allahu akbar. Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
          translation: 'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory be to Him who has subjected this to us, for we could never have done it by ourselves. And indeed, to our Lord we will surely return.',
          reference: 'Muslim; Quran 43:13-14',
        },
        {
          id: 't2',
          title: 'Dua for Returning from a Journey',
          arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
          transliteration: "Ayibuna ta'ibuna 'abiduna li-Rabbina hamidun.",
          translation: 'We return, repentant, worshipping, and to our Lord we give praise.',
          reference: 'Bukhari, Muslim',
        },
      ],
    },
    {
      id: 'family',
      title: 'Family & Parents',
      icon: Users,
      duas: [
        {
          id: 'fam1',
          title: 'Dua for Parents',
          arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
          transliteration: 'Rabbir-hamhuma kama rabbayani saghira.',
          translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
          reference: 'Quran 17:24',
        },
        {
          id: 'fam2',
          title: 'Dua for Spouse and Children',
          arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
          transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama.",
          translation: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders for the righteous.',
          reference: 'Quran 25:74',
        },
        {
          id: 'fam3',
          title: 'Dua for a Newborn Child',
          arabic: 'أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
          transliteration: "U'idhuka bikalimatillahit-tammati min kulli shaytanin wa hammatin, wa min kulli 'aynin lammah.",
          translation: 'I seek protection for you in the perfect words of Allah from every devil and poisonous creature, and from every evil eye.',
          reference: 'Bukhari',
        },
      ],
    },
    {
      id: 'repentance',
      title: 'Repentance & Remembrance',
      icon: Sparkles,
      duas: [
        {
          id: 'r1',
          title: 'General Istighfar',
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
          transliteration: "Astaghfirullahal-'azimal-ladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh.",
          translation: 'I seek forgiveness from Allah, the Mighty, besides whom there is none worthy of worship, the Ever-Living, the Sustainer, and I turn to Him in repentance.',
          reference: 'Abu Dawud, Tirmidhi',
        },
        {
          id: 'r2',
          title: 'Dua for Good in Both Worlds',
          arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
          transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
          translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
          reference: 'Quran 2:201',
        },
        {
          id: 'r3',
          title: 'Dua for Steadfastness of Faith',
          arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
          transliteration: "Ya Muqallibal-qulubi thabbit qalbi 'ala dinik.",
          translation: 'O Turner of the hearts, make my heart firm upon Your religion.',
          reference: 'Tirmidhi',
        },
      ],
    },
  ];

  const filteredCategories = duaCategories.map(category => ({
    ...category,
    duas: category.duas.filter(dua =>
      (dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (tab !== 'favorites' || favoriteDuas.includes(dua.id))
    )
  })).filter(category => category.duas.length > 0);

  const filteredMyDuas = myDuas.filter(dua =>
    dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <p className="eyebrow-gold mb-2">Adhkar &amp; Supplication</p>
          <h1 className="text-3xl font-bold font-serif text-stone-900">Duas &amp; Supplications</h1>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Search Duas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 rounded-xl leading-5 input-premium sm:text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {([
          { id: 'all', label: 'All Duas' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'mine', label: 'My Duas' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              tab === t.id
                ? 'bg-[#0B3D2E] text-gold-200 shadow-md border border-gold-400/40'
                : 'surface text-stone-600 hover:border-gold-300/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mine' ? (
        <div className="space-y-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gold px-5 py-3 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add Your Own Dua
          </button>

          {filteredMyDuas.length === 0 && (
            <div className="text-center py-16 text-stone-500 flex flex-col items-center gap-3">
              <BookHeart className="w-10 h-10 text-stone-300" />
              <p>You haven&apos;t added any personal duas yet.</p>
            </div>
          )}

          <div className="grid gap-6">
            {filteredMyDuas.map((dua) => (
              <div key={dua.id} className="surface surface-interactive p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-emerald-800">{dua.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareDua(dua.title, dua.arabic, dua.translation)}
                      className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-stone-50 rounded-full transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeMyDua(dua.id)}
                      className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mb-5 text-right">
                  <p className="text-2xl md:text-3xl font-arabic text-stone-900 leading-loose" dir="rtl">{dua.arabic}</p>
                </div>
                {dua.transliteration && (
                  <div className="mb-5">
                    <p className="eyebrow-gold !text-gold-600/80 mb-1.5 text-[10px]">Transliteration</p>
                    <p className="text-base text-stone-600 italic leading-relaxed">{dua.transliteration}</p>
                  </div>
                )}
                {dua.translation && (
                  <div className="pt-4 border-t border-gold-400/15">
                    <p className="eyebrow-gold !text-gold-600/80 mb-1.5 text-[10px]">Meaning</p>
                    <p className="text-lg text-stone-600 leading-relaxed">{dua.translation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div className="space-y-12">
        {filteredCategories.map((category) => (
          <section key={category.id}>
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-badge p-3 rounded-2xl">
                <category.icon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 font-serif">{category.title}</h2>
              <div className="flex-1 divider-gold opacity-40" />
            </div>
            
            <div className="grid gap-6">
              {category.duas.map((dua) => (
                <div key={dua.id} className="surface surface-interactive p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-emerald-800">{dua.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playAudio(dua.id, dua.arabic, 'ar-SA')}
                        className={`p-2 transition-colors rounded-full ${playingId === dua.id ? 'text-gold-600 bg-gold-50' : 'text-stone-400 hover:text-emerald-700 hover:bg-stone-50'}`}
                        title={playingId === dua.id ? "Stop Audio" : "Play Audio"}
                      >
                        {playingId === dua.id ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>
                      <button
                        onClick={() => shareDua(dua.title, dua.arabic, dua.translation)}
                        className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-stone-50 rounded-full transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleFavoriteDua(dua.id)}
                        className={`p-2 rounded-full transition-colors ${favoriteDuas.includes(dua.id) ? 'text-rose-500 bg-rose-50' : 'text-stone-400 hover:text-rose-500 hover:bg-stone-50'}`}
                        title={favoriteDuas.includes(dua.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-5 h-5 ${favoriteDuas.includes(dua.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-5 text-right">
                    <p className="text-2xl md:text-3xl font-arabic text-stone-900 leading-loose" dir="rtl">
                      {dua.arabic}
                    </p>
                  </div>

                  <div className="mb-5">
                    <p className="eyebrow-gold !text-gold-600/80 mb-1.5 text-[10px]">Transliteration</p>
                    <p className="text-base text-stone-600 italic leading-relaxed">
                      {dua.transliteration}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gold-400/15">
                    <p className="eyebrow-gold !text-gold-600/80 mb-1.5 text-[10px]">Meaning</p>
                    <p className="text-lg text-stone-600 mb-3 leading-relaxed">{dua.translation}</p>
                    <p className="text-sm text-gold-700 font-semibold tracking-wide">Reference: {dua.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            {tab === 'favorites' ? 'No favorite duas yet — tap the heart on any dua to save it here.' : 'No duas found matching your search.'}
          </div>
        )}
      </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-md" onClick={() => setShowAddForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#FCFAF4] rounded-[2rem] p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-stone-900 font-serif">Add a Personal Dua</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-premium outline-none"
              />
              <textarea
                placeholder="Arabic text"
                value={form.arabic}
                onChange={(e) => setForm({ ...form, arabic: e.target.value })}
                dir="rtl"
                rows={2}
                className="w-full px-4 py-3 rounded-xl input-premium outline-none font-arabic text-xl"
              />
              <input
                type="text"
                placeholder="Transliteration (optional)"
                value={form.transliteration}
                onChange={(e) => setForm({ ...form, transliteration: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-premium outline-none"
              />
              <textarea
                placeholder="Translation / meaning (optional)"
                value={form.translation}
                onChange={(e) => setForm({ ...form, translation: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl input-premium outline-none"
              />
              <button onClick={submitNewDua} className="btn-gold w-full py-3 rounded-xl">
                <Plus className="w-4 h-4" />
                Save Dua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
