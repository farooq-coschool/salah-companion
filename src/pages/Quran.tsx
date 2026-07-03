import { Routes, Route } from 'react-router-dom';
import SurahList from './SurahList';
import SurahView from './SurahView';
import JuzView from './JuzView';
import AdabScreen from './AdabScreen';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Quran() {
  const { hasSeenAdab } = useSettingsStore();

  if (!hasSeenAdab) {
    return <AdabScreen />;
  }

  return (
    <Routes>
      <Route index element={<SurahList />} />
      <Route path="surah/:id" element={<SurahView />} />
      <Route path="juz/:id" element={<JuzView />} />
    </Routes>
  );
}
