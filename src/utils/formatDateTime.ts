import { LOCALE, TIME_ZONE } from '@/constants';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string =>
  date.toLocaleTimeString(LOCALE, {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  });
