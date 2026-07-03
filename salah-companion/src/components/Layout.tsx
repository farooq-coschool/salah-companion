import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Clock, Music, Settings, Heart, Star, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CrescentMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="26" fill="url(#mark-bg)" />
      <path d="M62 20a30 30 0 1 0 18 41 24 24 0 1 1-18-41z" fill="url(#mark-gold)" />
      <defs>
        <linearGradient id="mark-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12664A" />
          <stop offset="1" stopColor="#06231A" />
        </linearGradient>
        <linearGradient id="mark-gold" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0DFA0" />
          <stop offset="1" stopColor="#C09A2B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quran', label: "Qur'an", icon: BookOpen },
    { path: '/duas', label: 'Duas', icon: Heart },
    { path: '/special-prayers', label: 'Special', icon: Star },
    { path: '/library', label: 'Library', icon: Music },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-transparent text-stone-900 pb-24 md:pb-0 md:pl-72">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 left-0 bg-gradient-to-b from-[#0B3D2E] via-[#0A3629] to-[#06231A] z-50 border-r border-gold-400/20 shadow-[8px_0_40px_-12px_rgba(6,35,26,0.5)]">
        {/* subtle top gold hairline */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

        <div className="p-7 flex items-center gap-3.5">
          <CrescentMark className="w-11 h-11 shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gold-100 font-serif tracking-tight leading-tight truncate">Salaah Companion</h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/50 font-semibold mt-0.5">Deen &amp; Devotion</p>
          </div>
        </div>

        <div className="mx-7 divider-gold opacity-40" />

        <nav className="flex-1 px-5 pt-6 space-y-1.5 overflow-y-auto scrollbar-hide pb-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-white/[0.07] text-gold-100 font-semibold'
                    : 'text-emerald-100/60 hover:bg-white/[0.04] hover:text-emerald-50'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-gold-300 to-gold-500"
                  />
                )}
                <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-gold-300' : 'text-emerald-200/40 group-hover:text-gold-300/70'}`} />
                <span className="tracking-wide text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-7 pt-4">
          <div className="divider-gold opacity-30 mb-4" />
          <p className="text-[11px] text-emerald-200/35 tracking-wide leading-relaxed">
            &ldquo;And establish prayer and give zakah.&rdquo;
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-r from-[#0B3D2E] to-[#06231A] p-4 sticky top-0 z-40 border-b border-gold-400/20 shadow-lg">
        <div className="flex items-center justify-center gap-2.5">
          <CrescentMark className="w-7 h-7 shrink-0" />
          <h1 className="text-lg font-bold text-gold-100 text-center font-serif tracking-tight">Salaah Companion</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-10 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav (Floating Glassmorphism) */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-50 pb-safe">
        <nav className="bg-[#0B3D2E]/95 backdrop-blur-xl border border-gold-400/25 shadow-2xl shadow-emerald-950/40 rounded-2xl flex justify-around p-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-all duration-300 ${
                  isActive
                    ? 'text-gold-300'
                    : 'text-emerald-100/45 hover:text-emerald-50'
                }`}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-gold-400/10' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
