import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price.toFixed(3)} TND`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDeliveryFee(zone: string, subtotal: number): number {
  const fees: Record<string, { fee: number; freeThreshold: number }> = {
    ZONE_A: { fee: 5, freeThreshold: 80 },
    ZONE_B: { fee: 8, freeThreshold: 120 },
    ZONE_C: { fee: 12, freeThreshold: 150 },
  };

  const config = fees[zone];
  if (!config) return 0;

  return subtotal >= config.freeThreshold ? 0 : config.fee;
}

export function getDayName(dayNumber: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayNumber] || '';
}

export function isInSeason(seasonStart?: number, seasonEnd?: number): boolean {
  if (!seasonStart || !seasonEnd) return true;

  const currentMonth = new Date().getMonth() + 1;

  if (seasonStart <= seasonEnd) {
    return currentMonth >= seasonStart && currentMonth <= seasonEnd;
  } else {
    return currentMonth >= seasonStart || currentMonth <= seasonEnd;
  }
}

export function getNextDeliveryDate(zone: string): Date {
  const deliveryDays: Record<string, number> = {
    ZONE_A: 3, // Wednesday
    ZONE_B: 4, // Thursday
    ZONE_C: 4, // Thursday
  };

  const targetDay = deliveryDays[zone] || 3;
  const today = new Date();
  const currentDay = today.getDay();

  let daysUntilDelivery = targetDay - currentDay;
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7;
  }

  // If it's the delivery day but past cutoff (Sunday), push to next week
  if (daysUntilDelivery < 3) {
    daysUntilDelivery += 7;
  }

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysUntilDelivery);
  return deliveryDate;
}
