import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Location {
  city: string;
  country: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

type LocationMode = 'manual' | 'auto';
type Theme = 'light' | 'dark' | 'system';
type ArabicFontSize = 'sm' | 'md' | 'lg' | 'xl';
type PrayerStatus = 'done' | 'missed' | 'qada';
export type ReciterId = 'ar.alafasy' | 'ar.abdulbasitmurattal' | 'ar.husary' | 'ar.minshawi';

export interface CustomDua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface QuranBookmark {
  surah: number;
  surahName: string;
  ayah: number;
  numberInSurah: number;
  addedAt: number;
}

export interface LastRead {
  surah: number;
  surahName: string;
  numberInSurah: number;
}

export interface TasbihEntry {
  date: string; // yyyy-MM-dd
  phrase: string;
  count: number;
}

export const RECITERS: Record<ReciterId, string> = {
  'ar.alafasy': 'Mishary Rashid Alafasy',
  'ar.abdulbasitmurattal': 'Abdul Basit',
  'ar.husary': 'Mahmoud Khalil Al-Husary',
  'ar.minshawi': 'Mohamed Siddiq El-Minshawi',
};

interface SettingsState {
  location: Location;
  coordinates: Coordinates | null;
  locationMode: LocationMode;
  hasPromptedLocation: boolean;
  calculationMethod: number; // e.g., 2 for ISNA, 3 for MWL
  madhab: number; // 0 for Shafi/Hanbali/Maliki, 1 for Hanafi
  translation: string; // 'en', 'ur', 'hi', 'te'
  hasSeenAdab: boolean;
  customFajrAudioUrl: string;
  theme: Theme;
  arabicFontSize: ArabicFontSize;
  reciter: ReciterId;
  notificationsEnabled: boolean;
  favoriteDuas: string[];
  myDuas: CustomDua[];
  quranBookmarks: QuranBookmark[];
  lastRead: LastRead | null;
  hifzProgress: Record<number, number[]>; // surah number -> memorized ayah numbers
  prayerLog: Record<string, Partial<Record<string, PrayerStatus>>>; // date -> prayer -> status
  tasbihHistory: TasbihEntry[];
  tasbihTarget: number;

  setLocation: (location: Location) => void;
  setCoordinates: (coordinates: Coordinates | null) => void;
  setLocationMode: (mode: LocationMode) => void;
  setHasPromptedLocation: (seen: boolean) => void;
  setCalculationMethod: (method: number) => void;
  setMadhab: (madhab: number) => void;
  setTranslation: (translation: string) => void;
  setHasSeenAdab: (seen: boolean) => void;
  setCustomFajrAudioUrl: (url: string) => void;
  setTheme: (theme: Theme) => void;
  setArabicFontSize: (size: ArabicFontSize) => void;
  setReciter: (reciter: ReciterId) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleFavoriteDua: (id: string) => void;
  addMyDua: (dua: CustomDua) => void;
  updateMyDua: (id: string, dua: Partial<CustomDua>) => void;
  removeMyDua: (id: string) => void;
  toggleQuranBookmark: (bookmark: QuranBookmark) => void;
  setLastRead: (lastRead: LastRead) => void;
  toggleHifzAyah: (surah: number, ayah: number) => void;
  setPrayerStatus: (date: string, prayer: string, status: PrayerStatus | undefined) => void;
  addTasbihCount: (phrase: string, amount: number) => void;
  resetTasbihToday: (phrase: string) => void;
  setTasbihTarget: (target: number) => void;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      location: { city: 'Mecca', country: 'Saudi Arabia' },
      coordinates: null,
      locationMode: 'manual',
      hasPromptedLocation: false,
      calculationMethod: 2, // ISNA as default
      madhab: 0, // Shafi as default
      translation: 'en', // English as default
      hasSeenAdab: false,
      customFajrAudioUrl: '',
      theme: 'system',
      arabicFontSize: 'md',
      reciter: 'ar.alafasy',
      notificationsEnabled: false,
      favoriteDuas: [],
      myDuas: [],
      quranBookmarks: [],
      lastRead: null,
      hifzProgress: {},
      prayerLog: {},
      tasbihHistory: [],
      tasbihTarget: 33,

      setLocation: (location) => set({ location }),
      setCoordinates: (coordinates) => set({ coordinates }),
      setLocationMode: (locationMode) => set({ locationMode }),
      setHasPromptedLocation: (hasPromptedLocation) => set({ hasPromptedLocation }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setMadhab: (madhab) => set({ madhab }),
      setTranslation: (translation) => set({ translation }),
      setHasSeenAdab: (hasSeenAdab) => set({ hasSeenAdab }),
      setCustomFajrAudioUrl: (customFajrAudioUrl) => set({ customFajrAudioUrl }),
      setTheme: (theme) => set({ theme }),
      setArabicFontSize: (arabicFontSize) => set({ arabicFontSize }),
      setReciter: (reciter) => set({ reciter }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      toggleFavoriteDua: (id) =>
        set((state) => ({
          favoriteDuas: state.favoriteDuas.includes(id)
            ? state.favoriteDuas.filter((f) => f !== id)
            : [...state.favoriteDuas, id],
        })),

      addMyDua: (dua) => set((state) => ({ myDuas: [...state.myDuas, dua] })),
      updateMyDua: (id, patch) =>
        set((state) => ({
          myDuas: state.myDuas.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeMyDua: (id) =>
        set((state) => ({ myDuas: state.myDuas.filter((d) => d.id !== id) })),

      toggleQuranBookmark: (bookmark) =>
        set((state) => {
          const exists = state.quranBookmarks.some(
            (b) => b.surah === bookmark.surah && b.ayah === bookmark.ayah
          );
          return {
            quranBookmarks: exists
              ? state.quranBookmarks.filter(
                  (b) => !(b.surah === bookmark.surah && b.ayah === bookmark.ayah)
                )
              : [...state.quranBookmarks, bookmark],
          };
        }),

      setLastRead: (lastRead) => set({ lastRead }),

      toggleHifzAyah: (surah, ayah) =>
        set((state) => {
          const current = state.hifzProgress[surah] || [];
          const next = current.includes(ayah)
            ? current.filter((a) => a !== ayah)
            : [...current, ayah];
          return { hifzProgress: { ...state.hifzProgress, [surah]: next } };
        }),

      setPrayerStatus: (date, prayer, status) =>
        set((state) => {
          const dayLog = { ...(state.prayerLog[date] || {}) };
          if (status === undefined) {
            delete dayLog[prayer];
          } else {
            dayLog[prayer] = status;
          }
          return { prayerLog: { ...state.prayerLog, [date]: dayLog } };
        }),

      addTasbihCount: (phrase, amount) =>
        set((state) => {
          const date = todayKey();
          const existing = state.tasbihHistory.find((h) => h.date === date && h.phrase === phrase);
          if (existing) {
            return {
              tasbihHistory: state.tasbihHistory.map((h) =>
                h === existing ? { ...h, count: h.count + amount } : h
              ),
            };
          }
          return { tasbihHistory: [...state.tasbihHistory, { date, phrase, count: amount }] };
        }),

      resetTasbihToday: (phrase) =>
        set((state) => {
          const date = todayKey();
          return {
            tasbihHistory: state.tasbihHistory.map((h) =>
              h.date === date && h.phrase === phrase ? { ...h, count: 0 } : h
            ),
          };
        }),

      setTasbihTarget: (tasbihTarget) => set({ tasbihTarget }),
    }),
    {
      name: 'salaah-companion-settings',
    }
  )
);
