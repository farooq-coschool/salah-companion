/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Quran from './pages/Quran';
import Duas from './pages/Duas';
import Library from './pages/Library';
import Settings from './pages/Settings';
import SpecialPrayers from './pages/SpecialPrayers';
import Calendar from './pages/Calendar';
import Qibla from './pages/Qibla';
import Tasbih from './pages/Tasbih';
import PrayerTracker from './pages/PrayerTracker';
import MosqueFinder from './pages/MosqueFinder';
import { useApplyTheme } from './lib/useTheme';

export default function App() {
  useApplyTheme();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quran/*" element={<Quran />} />
          <Route path="duas" element={<Duas />} />
          <Route path="special-prayers" element={<SpecialPrayers />} />
          <Route path="library" element={<Library />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="qibla" element={<Qibla />} />
          <Route path="tasbih" element={<Tasbih />} />
          <Route path="prayer-tracker" element={<PrayerTracker />} />
          <Route path="mosque-finder" element={<MosqueFinder />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
