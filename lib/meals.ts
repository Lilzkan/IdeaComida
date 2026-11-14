import type { Meal } from '@/constants/brands';

export type RecentRepeat = {
  brandId: string;
  /** Días entre la comida anterior y la repetición. */
  days: number;
  /** Fecha ISO de la repetición más reciente. */
  latest: string;
};

/**
 * Detecta marcas que se repitieron con menos de `maxDays` de diferencia.
 * Devuelve una entrada por marca, con la repetición más reciente.
 */
export function findRecentRepeats(meals: Meal[], maxDays = 7): RecentRepeat[] {
  const sorted = [...meals].sort(
    (a, b) => new Date(a.eaten_at).getTime() - new Date(b.eaten_at).getTime()
  );

  const lastSeen = new Map<string, number>();
  const repeats = new Map<string, RecentRepeat>();

  for (const meal of sorted) {
    const time = new Date(meal.eaten_at).getTime();
    if (Number.isNaN(time)) continue;

    const previous = lastSeen.get(meal.brand_id);
    if (previous !== undefined) {
      const days = Math.round((time - previous) / (1000 * 60 * 60 * 24));
      if (days <= maxDays) {
        repeats.set(meal.brand_id, {
          brandId: meal.brand_id,
          days: Math.max(days, 0),
          latest: meal.eaten_at,
        });
      }
    }

    lastSeen.set(meal.brand_id, time);
  }

  return [...repeats.values()].sort(
    (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime()
  );
}
