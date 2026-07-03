import { addDays } from 'date-fns';

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

export function getHijriDate(date: Date): HijriDate {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);

  const dayStr = parts.find((p) => p.type === 'day')?.value;
  const monthStr = parts.find((p) => p.type === 'month')?.value;
  const yearStr = parts.find((p) => p.type === 'year')?.value;

  const day = dayStr ? parseInt(dayStr, 10) : 1;
  const month = monthStr ? parseInt(monthStr, 10) : 1;
  const year = yearStr ? parseInt(yearStr, 10) : 1445;

  return { day, month, year, monthName: HIJRI_MONTHS[month - 1] || 'Unknown' };
}

export interface IslamicEvent {
  name: string;
  month: number;
  day: number;
  description: string;
  type: 'festival' | 'night' | 'historical';
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: 'Islamic New Year', month: 1, day: 1, description: 'Marks the beginning of the new Islamic calendar year.', type: 'historical' },
  { name: 'Day of Ashura', month: 1, day: 10, description: 'A day of fasting and reflection.', type: 'historical' },
  { name: 'Mawlid an-Nabi', month: 3, day: 12, description: 'The observance of the birthday of the Islamic prophet Muhammad (PBUH).', type: 'festival' },
  { name: "Isra and Mi'raj", month: 7, day: 27, description: 'The night journey and ascension of Prophet Muhammad (PBUH).', type: 'night' },
  { name: "Mid-Sha'ban (Shab-e-Barat)", month: 8, day: 15, description: 'The Night of Records or Night of Forgiveness.', type: 'night' },
  { name: 'First Day of Ramadan', month: 9, day: 1, description: 'The beginning of the holy month of fasting.', type: 'festival' },
  { name: 'Battle of Badr', month: 9, day: 17, description: 'Commemorates the first major battle of Islam.', type: 'historical' },
  { name: 'Laylat al-Qadr', month: 9, day: 27, description: 'The Night of Decree. (Observed on 27th, though it can be any odd night in the last 10 days).', type: 'night' },
  { name: 'Eid al-Fitr', month: 10, day: 1, description: 'The Festival of Breaking the Fast.', type: 'festival' },
  { name: 'Day of Arafah', month: 12, day: 9, description: 'The holiest day in the Islamic calendar.', type: 'historical' },
  { name: 'Eid al-Adha', month: 12, day: 10, description: 'The Festival of Sacrifice.', type: 'festival' },
];

export interface UpcomingEvent {
  event: IslamicEvent;
  date: Date;
  hijri: HijriDate;
  daysAway: number;
}

/** Scans forward day-by-day to find the next occurrence of each fixed Hijri event. */
export function getUpcomingEvents(from: Date = new Date(), withinDays = 366): UpcomingEvent[] {
  const results: UpcomingEvent[] = [];
  const found = new Set<string>();
  let cursor = from;

  for (let i = 0; i <= withinDays && found.size < ISLAMIC_EVENTS.length; i++) {
    const hijri = getHijriDate(cursor);
    const event = ISLAMIC_EVENTS.find((e) => e.month === hijri.month && e.day === hijri.day);
    if (event && !found.has(event.name)) {
      found.add(event.name);
      results.push({ event, date: cursor, hijri, daysAway: i });
    }
    cursor = addDays(cursor, 1);
  }

  return results.sort((a, b) => a.daysAway - b.daysAway);
}

export function isRamadan(date: Date = new Date()): boolean {
  return getHijriDate(date).month === 9;
}

/** "White Days" — the 13th, 14th, and 15th of every Hijri month, a well-known Sunnah fast. */
export function isWhiteDay(date: Date = new Date()): boolean {
  const day = getHijriDate(date).day;
  return day === 13 || day === 14 || day === 15;
}

/** Monday/Thursday voluntary fasting, per Sunnah. */
export function isSunnahFastWeekday(date: Date = new Date()): boolean {
  const dow = date.getDay();
  return dow === 1 || dow === 4;
}
