import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

import { db, isFirebaseConfigured } from '@/lib/firebase';

export type Couple = {
  id: string;
  name: string | null;
  invite_code: string;
};

export const coupleKeys = {
  all: ['couple'] as const,
  detail: (coupleId: string) => ['couple', coupleId] as const,
};

async function fetchCouple(coupleId: string): Promise<Couple | null> {
  if (!isFirebaseConfigured || !coupleId) return null;

  try {
    const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
    if (coupleSnap.exists()) {
      const data = coupleSnap.data();
      return {
        id: coupleSnap.id,
        name: data.name ?? null,
        invite_code: data.invite_code ?? '',
      };
    }
  } catch {
    // Si falla la red, retorna null
  }
  return null;
}

export function useCouple(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: coupleKeys.detail(coupleId ?? 'none'),
    queryFn: () => fetchCouple(coupleId as string),
    enabled: Boolean(coupleId && isFirebaseConfigured),
    staleTime: 60_000,
  });
}
