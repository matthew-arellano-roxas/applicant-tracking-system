import { LOCALE, TIME_ZONE } from '@/constants';

export const formatDate = (date: Date, timeZone: string = TIME_ZONE): string => {
  return date.toLocaleDateString(LOCALE, {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date, timeZone: string = TIME_ZONE): string =>
  date.toLocaleTimeString(LOCALE, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  });
