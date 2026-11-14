import { useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Meal } from '@/constants/brands';
import { db, isFirebaseConfigured } from '@/lib/firebase';

const LOCAL_MEALS_KEY = '@ideacomida_local_meals';

export const mealKeys = {
  all: ['meals'] as const,
  couple: (coupleId: string) => ['meals', coupleId] as const,
  brand: (coupleId: string, brandId: string) => ['meals', coupleId, brandId] as const,
};

async function fetchLocalMeals(brandId?: string): Promise<Meal[]> {
  try {
    const data = await AsyncStorage.getItem(LOCAL_MEALS_KEY);
    const meals: Meal[] = data ? JSON.parse(data) : [];
    if (brandId) {
      return meals.filter((m) => m.brand_id === brandId);
    }
    return meals.sort((a, b) => new Date(b.eaten_at).getTime() - new Date(a.eaten_at).getTime());
  } catch {
    return [];
  }
}

async function fetchMeals(coupleId: string, brandId?: string): Promise<Meal[]> {
  if (coupleId === 'local-couple' || coupleId === 'couple-shared' || !isFirebaseConfigured) {
    return fetchLocalMeals(brandId);
  }

  const mealsRef = collection(db, 'meals');
  // Sin orderBy en la consulta: evita requerir un índice compuesto en Firestore.
  const q = query(mealsRef, where('couple_id', '==', coupleId));

  const querySnapshot = await getDocs(q);
  const meals: Meal[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    meals.push({
      id: docSnap.id,
      couple_id: data.couple_id,
      brand_id: data.brand_id,
      item: data.item ?? null,
      rating: data.rating ?? null,
      notes: data.notes ?? null,
      eaten_at: data.eaten_at,
      created_at: data.created_at ?? new Date().toISOString(),
      added_by: data.added_by ?? null,
    });
  });

  meals.sort((a, b) => new Date(b.eaten_at).getTime() - new Date(a.eaten_at).getTime());
  if (brandId) {
    return meals.filter((m) => m.brand_id === brandId);
  }
  return meals;
}

export function useMeals(coupleId: string | null | undefined, brandId?: string) {
  const queryKey =
    coupleId && brandId ? mealKeys.brand(coupleId, brandId) : mealKeys.couple(coupleId ?? 'none');

  return useQuery({
    queryKey,
    queryFn: () => fetchMeals(coupleId as string, brandId),
    enabled: Boolean(coupleId),
  });
}

export type NewMeal = {
  couple_id: string;
  brand_id: string;
  item: string | null;
  rating: number | null;
  eaten_at: string;
  added_by?: string | null;
};

export function useAddMeal(coupleId: string | null | undefined) {
  const queryClient = useQueryClient();
  const isLocal = coupleId === 'local-couple' || coupleId === 'couple-shared' || !isFirebaseConfigured;

  return useMutation({
    mutationFn: async (meal: NewMeal): Promise<Meal> => {
      if (isLocal) {
        const newMeal: Meal = {
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          couple_id: coupleId ?? 'local-couple',
          brand_id: meal.brand_id,
          item: meal.item,
          rating: meal.rating,
          notes: null,
          eaten_at: meal.eaten_at,
          created_at: new Date().toISOString(),
          added_by: meal.added_by ?? null,
        };
        const current = await fetchLocalMeals();
        const updated = [newMeal, ...current];
        await AsyncStorage.setItem(LOCAL_MEALS_KEY, JSON.stringify(updated));
        return newMeal;
      }

      const docRef = await addDoc(collection(db, 'meals'), {
        ...meal,
        created_at: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        couple_id: meal.couple_id,
        brand_id: meal.brand_id,
        item: meal.item,
        rating: meal.rating,
        notes: null,
        eaten_at: meal.eaten_at,
        created_at: new Date().toISOString(),
        added_by: meal.added_by ?? null,
      };
    },
    onSuccess: (meal) => {
      if (!coupleId) return;

      const prepend = (key: readonly unknown[]) => {
        if (queryClient.getQueryData(key) === undefined) return;
        queryClient.setQueryData<Meal[]>(key, (current: Meal[] | undefined) =>
          current ? [meal, ...current] : current
        );
      };

      prepend(mealKeys.couple(coupleId));
      prepend(mealKeys.brand(coupleId, meal.brand_id));
      void queryClient.invalidateQueries({ queryKey: mealKeys.couple(coupleId) });
    },
  });
}

export function useDeleteMeal(coupleId: string | null | undefined) {
  const queryClient = useQueryClient();
  const isLocal = coupleId === 'local-couple' || coupleId === 'couple-shared' || !isFirebaseConfigured;

  return useMutation({
    mutationFn: async (mealId: string) => {
      if (isLocal) {
        const current = await fetchLocalMeals();
        const updated = current.filter((m) => m.id !== mealId);
        await AsyncStorage.setItem(LOCAL_MEALS_KEY, JSON.stringify(updated));
        return mealId;
      }

      await deleteDoc(doc(db, 'meals', mealId));
      return mealId;
    },
    onMutate: async (mealId) => {
      if (!coupleId) return undefined;

      await queryClient.cancelQueries({ queryKey: mealKeys.couple(coupleId) });
      const previous = queryClient.getQueriesData<Meal[]>({
        queryKey: mealKeys.couple(coupleId),
      });

      queryClient.setQueriesData<Meal[]>(
        { queryKey: mealKeys.couple(coupleId) },
        (current: Meal[] | undefined) =>
          current ? current.filter((meal: Meal) => meal.id !== mealId) : current
      );

      return { previous };
    },
    onError: (_error, _mealId, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!coupleId) return;
      void queryClient.invalidateQueries({ queryKey: mealKeys.couple(coupleId) });
    },
  });
}

/**
 * Suscripción Realtime en Firestore (`onSnapshot`) a las comidas de la pareja.
 */
export function useMealsRealtime(coupleId: string | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId || coupleId === 'local-couple' || coupleId === 'couple-shared' || !isFirebaseConfigured) return;

    const q = query(collection(db, 'meals'), where('couple_id', '==', coupleId));
    const unsubscribe = onSnapshot(q, () => {
      void queryClient.invalidateQueries({ queryKey: mealKeys.couple(coupleId) });
    });

    return () => {
      unsubscribe();
    };
  }, [coupleId, queryClient]);
}
