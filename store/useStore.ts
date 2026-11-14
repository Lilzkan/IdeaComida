import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { translateAuthError, translateDbError } from '../lib/errors';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

export type UserProfile = {
  id: string;
  email: string | null;
  name: string | null;
  couple_id: string | null;
  avatar_url: string | null;
};

type ActionResult = {
  error: string | null;
  needsConfirmation?: boolean;
  inviteCode?: string;
};

type AuthState = {
  profile: UserProfile | null;
  initialized: boolean;
  isLoading: boolean;

  savedDeals: string[];
  toggleSavedDeal: (dealId: string) => void;

  signIn: (email: string, password: string) => Promise<ActionResult>;
  signUp: (email: string, password: string, name: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;

  updateName: (name: string) => Promise<ActionResult>;
  createCouple: (name: string) => Promise<ActionResult>;
  joinCouple: (code: string) => Promise<ActionResult>;
  leaveCouple: () => Promise<ActionResult>;
  loginAsLocal: () => void;
  loginAsUser: (name: string, avatar: string) => void;
};

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      initialized: false,
      isLoading: true,
      savedDeals: [],

      setProfile: (profile) => set({ profile }),

      toggleSavedDeal: (dealId) =>
        set((state) => ({
          savedDeals: state.savedDeals.includes(dealId)
            ? state.savedDeals.filter((id) => id !== dealId)
            : [...state.savedDeals, dealId],
        })),

      signIn: async (email, password) => {
        if (!isFirebaseConfigured) {
          return { error: 'Falta configurar Firebase. Revisa el archivo .env.' };
        }
        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          await get().fetchProfile();
          if (!get().profile && cred.user) {
            const fallback: UserProfile = {
              id: cred.user.uid,
              email: cred.user.email,
              name: cred.user.displayName || email.split('@')[0] || 'Usuario',
              couple_id: null,
              avatar_url: null,
            };
            try {
              await setDoc(doc(db, 'users', cred.user.uid), fallback);
            } catch {}
            set({ profile: fallback });
          }
          return { error: null };
        } catch (err: any) {
          return { error: translateAuthError(err.message ?? '') };
        }
      },

      signUp: async (email, password, name) => {
        if (!isFirebaseConfigured) {
          return { error: 'Falta configurar Firebase. Revisa el archivo .env.' };
        }
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          const userRef = doc(db, 'users', cred.user.uid);
          const newProfile: UserProfile = {
            id: cred.user.uid,
            email: cred.user.email,
            name: name.trim(),
            couple_id: null,
            avatar_url: null,
          };
          await setDoc(userRef, newProfile);
          set({ profile: newProfile });
          return { error: null };
        } catch (err: any) {
          return { error: translateAuthError(err.message ?? '') };
        }
      },

      signOut: async () => {
        try {
          if (isFirebaseConfigured) {
            await fbSignOut(auth);
          }
        } finally {
          set({ profile: null });
        }
      },

      fetchProfile: async () => {
        if (!isFirebaseConfigured) {
          set({ isLoading: false, initialized: true });
          return;
        }
        set({ isLoading: true });
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            set({ profile: null });
            return;
          }

          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            set({ profile: userSnap.data() as UserProfile });
          } else {
            const fallback: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName ?? 'Usuario',
              couple_id: null,
              avatar_url: null,
            };
            await setDoc(userRef, fallback);
            set({ profile: fallback });
          }
        } catch {
          // Mantener caché si falla la red
        } finally {
          set({ isLoading: false, initialized: true });
        }
      },

      updateName: async (name) => {
        const profile = get().profile;
        if (!profile) return { error: 'No hay una sesión activa.' };

        const trimmed = name.trim();
        if (isFirebaseConfigured) {
          const userRef = doc(db, 'users', profile.id);
          await updateDoc(userRef, { name: trimmed });
        }

        set({ profile: { ...profile, name: trimmed } });
        return { error: null };
      },

      createCouple: async (name) => {
        const profile = get().profile;
        if (!profile) return { error: 'No hay una sesión activa.' };
        if (profile.couple_id) return { error: 'Ya estás en una pareja.' };

        try {
          const inviteCode = generateInviteCode();
          const coupleRef = doc(collection(db, 'couples'));
          const coupleData = {
            id: coupleRef.id,
            name: name.trim() || 'Nuestra Pareja',
            invite_code: inviteCode,
            created_by: profile.id,
            created_at: new Date().toISOString(),
          };

          await setDoc(coupleRef, coupleData);

          const userRef = doc(db, 'users', profile.id);
          await updateDoc(userRef, { couple_id: coupleRef.id });

          set({ profile: { ...profile, couple_id: coupleRef.id } });
          return { error: null, inviteCode };
        } catch (err: any) {
          return { error: translateDbError(err.message ?? '') };
        }
      },

      joinCouple: async (code) => {
        const profile = get().profile;
        if (!profile) return { error: 'No hay una sesión activa.' };
        if (profile.couple_id) return { error: 'Ya estás en una pareja.' };

        try {
          const q = query(collection(db, 'couples'), where('invite_code', '==', code.trim().toUpperCase()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            return { error: 'Ese código de invitación no existe.' };
          }

          const coupleDoc = querySnapshot.docs[0]!;
          const coupleId = coupleDoc.id;

          const userRef = doc(db, 'users', profile.id);
          await updateDoc(userRef, { couple_id: coupleId });

          set({ profile: { ...profile, couple_id: coupleId } });
          return { error: null };
        } catch (err: any) {
          return { error: translateDbError(err.message ?? '') };
        }
      },

      leaveCouple: async () => {
        const profile = get().profile;
        if (!profile) return { error: 'No hay una sesión activa.' };

        try {
          const userRef = doc(db, 'users', profile.id);
          await updateDoc(userRef, { couple_id: null });

          set({ profile: { ...profile, couple_id: null } });
          return { error: null };
        } catch (err: any) {
          return { error: translateDbError(err.message ?? '') };
        }
      },

      loginAsLocal: () => {
        set({
          profile: {
            id: 'local-user',
            email: null,
            name: 'Nuestra Pareja',
            couple_id: 'local-couple',
            avatar_url: null,
          },
          initialized: true,
          isLoading: false,
        });
      },

      loginAsUser: (name, avatar) => {
        set({
          profile: {
            id: name.toLowerCase(),
            email: null,
            name,
            couple_id: 'local-couple',
            avatar_url: avatar,
          },
          initialized: true,
          isLoading: false,
        });
      },
    }),
    {
      name: 'ideacomida-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile, savedDeals: state.savedDeals }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialized = true;
          state.isLoading = false;
        }
      },
    }
  )
);
