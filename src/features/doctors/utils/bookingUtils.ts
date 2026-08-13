import type { ConsultOption } from './consultOptions';

export function formatBookingDate(dateStr: string) {
  if (!dateStr) return dateStr;
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortSlot(dateStr: string, slot: string) {
  if (!dateStr || !slot) return '';
  const date = new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
  });
  return `${date}, ${slot}`;
}

export function buildAppointmentIso(selectedDate: string, selectedSlot: string) {
  const match = String(selectedSlot).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(`${selectedDate}T09:00:00`).toISOString();

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const date = new Date(`${selectedDate}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function buildSlotParams(option: ConsultOption | null) {
  if (!option || option.type === 'online') return { consult: 'online' };
  return {
    consult: 'in_person',
    ...(option.hospitalId ? { hospital_id: option.hospitalId } : {}),
    ...(option.practiceLocationId
      ? { practice_location_id: option.practiceLocationId }
      : {}),
  };
}

export function toLocalDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseSlotMinutes(slot: string) {
  const match = String(slot).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function sortSlots(slots: string[]) {
  return [...slots].sort((a, b) => parseSlotMinutes(a) - parseSlotMinutes(b));
}

export function buildQuickDates(count = 14) {
  const dates: Array<{
    value: string;
    label: string;
    dayLabel: string;
    dayNum: number;
  }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const value = toLocalDateValue(date);
    const dayLabel =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-PK', { weekday: 'short' });
    const label =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-PK', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
    dates.push({ value, label, dayLabel, dayNum: date.getDate() });
  }

  return dates;
}

export function formatLongBookingDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
