import { useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { db, isFirebaseConfigured } from '@/lib/firebase';

export type DealRow = {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  code?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  created_at: string;
};

export const dealKeys = {
  all: ['deals'] as const,
};

async function fetchDeals(): Promise<DealRow[]> {
  if (!isFirebaseConfigured) return [];

  try {
    const dealsRef = collection(db, 'deals');
    const q = query(dealsRef, where('is_active', '==', true));
    const querySnapshot = await getDocs(q);

    const deals: DealRow[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      deals.push({
        id: docSnap.id,
        brand_id: data.brand_id,
        title: data.title,
        description: data.description,
        code: data.code ?? null,
        price: data.price ?? null,
        imageUrl: data.imageUrl ?? null,
        valid_until: data.valid_until ?? null,
        is_active: data.is_active ?? true,
        created_at: data.created_at ?? new Date().toISOString(),
      });
    });

    return deals;
  } catch {
    return [];
  }
}

export function useDeals() {
  return useQuery({
    queryKey: dealKeys.all,
    queryFn: fetchDeals,
    enabled: isFirebaseConfigured,
    staleTime: 5 * 60_000,
  });
}

export function useAddDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: Omit<DealRow, 'id' | 'created_at' | 'is_active'>) => {
      if (!isFirebaseConfigured) return;
      await addDoc(collection(db, 'deals'), {
        ...deal,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

/**
 * Realtime para ofertas en Firestore.
 */
export function useDealsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isFirebaseConfigured || !enabled) return;

    const q = query(collection(db, 'deals'), where('is_active', '==', true));
    const unsubscribe = onSnapshot(q, () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.all });
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, queryClient]);
}
