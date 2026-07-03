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
  setLocation: (location: Location) => void;
  setCoordinates: (coordinates: Coordinates | null) => void;
  setLocationMode: (mode: LocationMode) => void;
  setHasPromptedLocation: (seen: boolean) => void;
  setCalculationMethod: (method: number) => void;
  setMadhab: (madhab: number) => void;
  setTranslation: (translation: string) => void;
  setHasSeenAdab: (seen: boolean) => void;
  setCustomFajrAudioUrl: (url: string) => void;
}

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
      setLocation: (location) => set({ location }),
      setCoordinates: (coordinates) => set({ coordinates }),
      setLocationMode: (locationMode) => set({ locationMode }),
      setHasPromptedLocation: (hasPromptedLocation) => set({ hasPromptedLocation }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setMadhab: (madhab) => set({ madhab }),
      setTranslation: (translation) => set({ translation }),
      setHasSeenAdab: (hasSeenAdab) => set({ hasSeenAdab }),
      setCustomFajrAudioUrl: (customFajrAudioUrl) => set({ customFajrAudioUrl }),
    }),
    {
      name: 'salaah-companion-settings',
    }
  )
);
