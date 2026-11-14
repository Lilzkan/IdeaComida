import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const rawKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

const isValidUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
const isPlaceholderUrl = rawUrl.includes('tu-proyecto') || !isValidUrl;

const supabaseUrl = isPlaceholderUrl ? 'https://placeholder.supabase.co' : rawUrl;
const supabaseAnonKey = rawKey && !rawKey.includes('tu-anon-key') ? rawKey : 'placeholder-anon-key';

/**
 * Permite mostrar una pantalla de configuración clara o usar Modo Local
 * cuando faltan las variables de entorno válidas.
 */
export const isSupabaseConfigured = Boolean(
  !isPlaceholderUrl && supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key'
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          couple_id: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          couple_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          couple_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      couples: {
        Row: {
          id: string;
          name: string | null;
          invite_code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          invite_code?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          invite_code?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          couple_id: string;
          brand_id: string;
          item: string | null;
          rating: number | null;
          notes: string | null;
          eaten_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          brand_id: string;
          item?: string | null;
          rating?: number | null;
          notes?: string | null;
          eaten_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          brand_id?: string;
          item?: string | null;
          rating?: number | null;
          notes?: string | null;
          eaten_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          brand_id: string;
          title: string;
          description: string;
          code: string | null;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          title: string;
          description: string;
          code?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          title?: string;
          description?: string;
          code?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_couple: {
        Args: { p_name?: string };
        Returns: { id: string; name: string | null; invite_code: string }[];
      };
      join_couple_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
      leave_couple: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
};

// En web el storage por defecto (localStorage) funciona; en nativo usamos AsyncStorage.
const authStorage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      // En React Native no hay URL de callback para OAuth por defecto.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

export type SupabaseType = SupabaseClient<Database>;
