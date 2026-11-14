/**
 * Paleta "cute & warm" de IdeaComida.
 * Fondo crema, tarjetas rosa pastel, acentos coral y texto café chocolate.
 */
export const COLORS = {
  // Marca
  primary: '#FF8FA3',
  primaryDark: '#F2738B',
  primarySoft: '#FFD3DC',
  secondary: '#FFB7C5',
  accent: '#F6BD60',

  // Superficies
  background: '#FFF8F0',
  surface: '#FFE5EC',
  surfaceAlt: '#FFF1F4',
  surfaceWarm: '#FFF0E6',
  white: '#FFFFFF',
  muted: '#FFF0E6',

  // Texto
  textPrimary: '#4A3531',
  textSecondary: '#8A6F68',
  textOnPrimary: '#FFFFFF',

  // Bordes y estados
  border: '#F3D7D9',
  success: '#7BBF8E',
  warning: '#F4A261',
  danger: '#E76F8A',

  // Pasteles auxiliares para ilustraciones
  peach: '#FFD8C2',
  butter: '#FFEFC2',
  sky: '#DCEFF7',
  mint: '#DCEFE2',
  lilac: '#E8DFF5',
} as const;

export const BRAND_COLORS: Record<string, string> = {
  mcdonalds: '#E8A300',
  burgerking: '#D9583B',
  wendys: '#A94A4A',
  subway: '#2E9E63',
  papajohns: '#5C4A45',
  kfc: '#D94A4A',
  tacobell: '#8A5AA8',
  dominos: '#4C7DD9',
  starbucks: '#2E8B6A',
  churchs: '#D9583B',
} as const;
