import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { Calendar as CalendarIcon, Moon, Star, Info, ChevronLeft, ChevronRight, Sparkles, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getHijriDate,
  ISLAMIC_EVENTS,
  getUpcomingEvents,
  isWhiteDay,
  isSunnahFastWeekday,
  type IslamicEvent,
} from '../lib/hijriEvents';

const MONTH_IMAGES = [
  '1565552645632-d725f8bfc19a', // Muharram (Kaaba)
  '1584551246679-0daf3d275d0f', // Safar (Mosque interior)
  '1519817650390-2a99bf26e2e2', // Rabi al-Awwal (Sunset mosque)
  '1542816417-0983c9c9ad53', // Rabi al-Thani (Sheikh Zayed Mosque)
  '1580418827493-f2b232e4007b', // Jumada al-Awwal (Blue Mosque)
  '1564121017-769415c10207', // Jumada al-Thani (Dome of the Rock)
  '1572889613149-a2123f202353', // Rajab (Quran)
  '1590076214991-831140994519', // Sha'ban (Lantern)
  '1604871000636-074fa5117945', // Ramadan (Architecture)
  '1551041777-ed277b8dd348', // Shawwal (Prayer beads)
  '1537800534-75016503b418', // Dhu al-Qadah (Mosque silhouette)
  '1584551246679-0daf3d275d0f', // Dhu al-Hijjah (Mosque)
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  // Find all events in the current view
  const eventsInView: { date: Date, hijri: ReturnType<typeof getHijriDate>, event: IslamicEvent }[] = [];
  let tempDay = startDate;
  while (tempDay <= endDate) {
    const hijri = getHijriDate(tempDay);
    const event = ISLAMIC_EVENTS.find(e => e.month === hijri.month && e.day === hijri.day);
    if (event && isSameMonth(tempDay, monthStart)) {
      eventsInView.push({ date: tempDay, hijri, event });
    }
    tempDay = addDays(tempDay, 1);
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'festival': return <Star className="w-4 h-4 text-amber-400" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'historical': return <Info className="w-4 h-4 text-emerald-400" />;
      default: return <CalendarIcon className="w-4 h-4 text-stone-400" />;
    }
  };

  const currentHijriMonthIndex = getHijriDate(monthStart).month - 1;
  const currentImageId = MONTH_IMAGES[currentHijriMonthIndex] || MONTH_IMAGES[0];
  const nextEvent = getUpcomingEvents(new Date(), 366)[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Hero Header with Dynamic Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-950/20 h-64 md:h-80 flex items-end border border-gold-400/25"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-105"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-${currentImageId}?auto=format&fit=crop&q=80&w=1920)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06231A]/95 via-[#06231A]/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
        
        <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-4 py-1.5 bg-gold-400/15 text-gold-100 border border-gold-400/40 rounded-full text-sm font-medium backdrop-blur-md shadow-sm">
                {getHijriDate(monthStart).monthName} - {getHijriDate(monthEnd).monthName} {getHijriDate(monthStart).year}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-1 tracking-tight drop-shadow-md">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <p className="text-emerald-100/80 font-medium text-lg drop-shadow-sm">Islamic Calendar</p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-md p-1.5 rounded-full border border-gold-400/30 shadow-lg">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="px-5 py-2 text-sm font-bold text-gold-100 hover:bg-white/10 rounded-full transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Next Sacred Date + Sunnah Fasting */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="surface p-6 rounded-[2rem] flex items-center gap-5"
        >
          <div className="icon-badge p-3 rounded-2xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="eyebrow-gold mb-1">Next Sacred Date</p>
            <p className="font-bold text-stone-800 text-lg">
              {nextEvent.event.name} &middot; {nextEvent.daysAway === 0 ? 'Today' : `in ${nextEvent.daysAway} day${nextEvent.daysAway === 1 ? '' : 's'}`}
            </p>
            <p className="text-sm text-stone-500 mt-0.5">
              {format(nextEvent.date, 'EEEE, MMMM d')} &middot; {nextEvent.hijri.day} {nextEvent.hijri.monthName} {nextEvent.hijri.year}H
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="surface rounded-[2.5rem] overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />
        
        {/* Days of Week */}
        <div className="grid grid-cols-7 bg-emerald-950/[0.04] border-b border-gold-400/15 relative z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-gold-400/10 gap-px relative z-10">
          {rows.map((row) => (
            row.map((day) => {
              const hijri = getHijriDate(day);
              const event = ISLAMIC_EVENTS.find(e => e.month === hijri.month && e.day === hijri.day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[100px] md:min-h-[120px] p-3 transition-all duration-300 cursor-pointer relative group flex flex-col
                    ${!isCurrentMonth ? 'bg-stone-50/40 text-stone-400' : 'bg-white'}
                    ${isToday ? 'bg-gold-50/60' : ''}
                    ${isSelected ? 'ring-2 ring-inset ring-gold-400/60 bg-gold-50/80' : 'hover:bg-stone-50'}
                  `}
                >
                  {isToday && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-300" />
                  )}

                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold flex items-center gap-1 ${isToday ? 'text-gold-600' : isCurrentMonth ? 'text-stone-400' : 'text-stone-300'}`}>
                      {format(day, 'd')}
                      {(isWhiteDay(day) || isSunnahFastWeekday(day)) && isCurrentMonth && (
                        <span title="Recommended Sunnah fast day">
                          <Utensils className="w-3 h-3 text-teal-500" />
                        </span>
                      )}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl md:text-2xl font-serif ${isToday ? 'text-emerald-700' : isCurrentMonth ? 'text-stone-800' : 'text-stone-400'}`}>
                        {hijri.day}
                      </span>
                      {hijri.day === 1 && (
                        <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest whitespace-nowrap mt-0.5">
                          {hijri.monthName}
                        </span>
                      )}
                    </div>
                  </div>

                  {event && (
                    <div className={`
                      mt-auto p-1.5 rounded-xl text-xs font-medium leading-tight border backdrop-blur-sm shadow-sm
                      ${event.type === 'festival' ? 'bg-amber-50 border-amber-200/60 text-amber-700' :
                        event.type === 'night' ? 'bg-indigo-50 border-indigo-200/60 text-indigo-700' :
                        'bg-emerald-50 border-emerald-200/60 text-emerald-700'}
                    `}>
                      <div className="hidden md:block truncate" title={event.name}>{event.name}</div>
                      <div className="md:hidden flex justify-center">
                        {event.type === 'festival' ? '⭐' : event.type === 'night' ? '🌙' : '🕌'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </motion.div>

      {/* Events List for Current Month */}
      <AnimatePresence>
        {eventsInView.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="surface rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-16 -mr-16 text-gold-400/[0.06] pointer-events-none">
              <Moon className="w-64 h-64" />
            </div>
            
            <h3 className="text-2xl font-serif text-stone-800 mb-8 flex items-center gap-3 relative z-10 tracking-tight">
              <div className="icon-badge p-3 rounded-2xl">
                <Star className="w-6 h-6" />
              </div>
              Sacred Dates in {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 relative z-10">
              {eventsInView.map(({ date, hijri, event }, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDate(date)}
                  className="flex gap-5 p-5 rounded-3xl border border-stone-200/60 bg-white hover:bg-gold-50/40 hover:border-gold-300/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-stone-50 rounded-2xl w-16 h-16 border border-stone-200/60 group-hover:border-gold-300/50 transition-colors shadow-sm">
                    <div className="text-2xl font-serif text-emerald-700 leading-none">{format(date, 'd')}</div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">{format(date, 'MMM')}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getIcon(event.type)}
                      <h4 className="font-bold text-stone-800 text-lg tracking-tight">{event.name}</h4>
                    </div>
                    <div className="text-xs font-bold text-gold-700 mb-2 tracking-wide uppercase">
                      {hijri.day} {hijri.monthName} {hijri.year}
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
