import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';

/** "hace 3 días", "hace 2 horas"... */
export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

/** "lun, 3 nov 2025" */
export function formatMealDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "20:45" */
export function formatMealTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysSince(isoDate: string): number {
  const date = new Date(isoDate).getTime();
  if (Number.isNaN(date)) return Number.POSITIVE_INFINITY;
  return (Date.now() - date) / (1000 * 60 * 60 * 24);
}

export function daysUntil(isoDate: string): number {
  const date = new Date(isoDate).getTime();
  if (Number.isNaN(date)) return Number.POSITIVE_INFINITY;
  return (date - Date.now()) / (1000 * 60 * 60 * 24);
}
