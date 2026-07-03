import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isAfter } from 'date-fns';
import { CheckCircle2, XCircle, Clock3, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../store/useSettingsStore';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type Status = 'done' | 'missed' | 'qada';

const STATUS_CYCLE: (Status | undefined)[] = [undefined, 'done', 'missed', 'qada'];

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-emerald-500 text-white border-emerald-500',
  missed: 'bg-rose-100 text-rose-600 border-rose-300',
  qada: 'bg-amber-100 text-amber-700 border-amber-300',
};

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function PrayerTracker() {
  const { prayerLog, setPrayerStatus } = useSettingsStore();
  const [month, setMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end }).filter((d) => !isAfter(d, new Date()) || isSameMonth(d, new Date()));
  }, [month]);

  const cycleStatus = (date: Date, prayer: string) => {
    const key = dateKey(date);
    const current = prayerLog[key]?.[prayer];
    const idx = STATUS_CYCLE.indexOf(current as Status | undefined);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setPrayerStatus(key, prayer, next);
  };

  const streak = useMemo(() => {
    let count = 0;
    let cursor = new Date();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const key = dateKey(cursor);
      const log = prayerLog[key];
      const allDone = log && PRAYERS.every((p) => log[p] === 'done');
      if (!allDone) break;
      count++;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    }
    return count;
  }, [prayerLog]);

  const monthStats = useMemo(() => {
    let done = 0;
    let missed = 0;
    let qada = 0;
    let total = 0;
    for (const day of days) {
      const log = prayerLog[dateKey(day)];
      for (const p of PRAYERS) {
        total++;
        const status = log?.[p];
        if (status === 'done') done++;
        else if (status === 'missed') missed++;
        else if (status === 'qada') qada++;
      }
    }
    return { done, missed, qada, total };
  }, [days, prayerLog]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow-gold mb-2">Consistency in Worship</p>
          <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Prayer Tracker</h1>
        </div>
        <div className="surface px-6 py-4 rounded-2xl flex items-center gap-3">
          <Flame className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-2xl font-bold text-stone-800 leading-none">{streak}</p>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between surface p-4 rounded-2xl">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-500" />
        </button>
        <p className="font-bold text-stone-800 text-lg">{format(month, 'MMMM yyyy')}</p>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          disabled={isSameMonth(month, new Date())}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="surface p-5 rounded-2xl text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-stone-800">{monthStats.done}</p>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Prayed</p>
        </div>
        <div className="surface p-5 rounded-2xl text-center">
          <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-stone-800">{monthStats.missed}</p>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Missed</p>
        </div>
        <div className="surface p-5 rounded-2xl text-center">
          <Clock3 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-stone-800">{monthStats.qada}</p>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Qada</p>
        </div>
      </div>

      <div className="surface rounded-[2rem] overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-gold-400/15">
              <th className="text-left p-4 text-xs font-bold text-stone-500 uppercase tracking-wide sticky left-0 bg-inherit">Date</th>
              {PRAYERS.map((p) => (
                <th key={p} className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wide">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const isToday = dateKey(day) === dateKey(new Date());
              return (
                <tr key={dateKey(day)} className={`border-b border-stone-100/70 last:border-0 ${isToday ? 'bg-gold-50/40' : ''}`}>
                  <td className="p-4 text-sm font-semibold text-stone-700 whitespace-nowrap sticky left-0 bg-inherit">
                    {format(day, 'EEE d')}
                  </td>
                  {PRAYERS.map((p) => {
                    const status = prayerLog[dateKey(day)]?.[p];
                    return (
                      <td key={p} className="p-3 text-center">
                        <button
                          onClick={() => cycleStatus(day, p)}
                          className={`w-9 h-9 rounded-full border-2 transition-all mx-auto flex items-center justify-center text-xs font-bold ${
                            status ? STATUS_STYLES[status] : 'border-stone-200 text-stone-300 hover:border-gold-300'
                          }`}
                          title={status || 'Not marked — tap to cycle'}
                        >
                          {status === 'done' ? '✓' : status === 'missed' ? '✕' : status === 'qada' ? 'Q' : ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-stone-400 text-center">Tap a circle to cycle: unmarked &rarr; prayed &rarr; missed &rarr; qada.</p>
    </motion.div>
  );
}
