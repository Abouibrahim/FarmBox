export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FB-${timestamp}-${random}`;
}

export function calculateDeliveryFee(zone: string, subtotal: number): number {
  const feeStructure: Record<string, { fee: number; freeThreshold: number }> = {
    ZONE_A: { fee: 5, freeThreshold: 80 },
    ZONE_B: { fee: 8, freeThreshold: 120 },
    ZONE_C: { fee: 12, freeThreshold: 150 },
  };

  const zoneConfig = feeStructure[zone];
  if (!zoneConfig) return 0;

  return subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee;
}

export function isProductInSeason(
  seasonStart: number | null,
  seasonEnd: number | null
): boolean {
  if (!seasonStart || !seasonEnd) return true;

  const currentMonth = new Date().getMonth() + 1;

  if (seasonStart <= seasonEnd) {
    return currentMonth >= seasonStart && currentMonth <= seasonEnd;
  } else {
    // Season spans year boundary (e.g., Nov-Feb)
    return currentMonth >= seasonStart || currentMonth <= seasonEnd;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
