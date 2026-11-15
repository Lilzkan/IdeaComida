import { BRAND_COLORS } from './colors';

export type Brand = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  treat: string;
  items: string[];
};

export const BRANDS: Brand[] = [
  {
    id: 'mcdonalds',
    name: "McDonald's",
    color: BRAND_COLORS.mcdonalds,
    emoji: '🍔',
    treat: '🍔',
    items: ['Big Mac', 'Cuarto de Libra', 'McPollo', 'McNuggets', 'McFlurry Oreo', 'Papas Fritas'],
  },
  {
    id: 'burgerking',
    name: 'Burger King',
    color: BRAND_COLORS.burgerking,
    emoji: '👑',
    treat: '🍟',
    items: ['Whopper', 'Whopper Jr.', 'King Bacon', 'Aros de Cebolla', 'Papas BK'],
  },
  {
    id: 'wendys',
    name: "Wendy's",
    color: BRAND_COLORS.wendys,
    emoji: '🐷',
    treat: '🥓',
    items: ["Dave's Single", 'Baconator', 'Pollo Crispy', 'Papas Cheddar Tocino', 'Frosty'],
  },
  {
    id: 'subway',
    name: 'Subway',
    color: BRAND_COLORS.subway,
    emoji: '🥪',
    treat: '🥪',
    items: ['Sub Pollo Teriyaki', 'Sub Atún', 'Sub Italiano BMT', 'Sub del Día', 'Galletas'],
  },
  {
    id: 'papajohns',
    name: "Papa John's",
    color: BRAND_COLORS.papajohns,
    emoji: '🍕',
    treat: '🍕',
    items: ['Pizza Pepperoni', 'Pizza BBQ Chicken', 'Pizza All The Meats', 'Nudos de Ajo', 'Alitas'],
  },
  {
    id: 'kfc',
    name: 'KFC',
    color: BRAND_COLORS.kfc,
    emoji: '🍗',
    treat: '🍗',
    items: ['Kentucky Burger', 'Zinger', 'Bucket de Pollo', 'Tenders Crujientes', 'Puré con Salsa'],
  },
  {
    id: 'tacobell',
    name: 'Taco Bell',
    color: BRAND_COLORS.tacobell,
    emoji: '🌮',
    treat: '🌮',
    items: ['Crunchwrap Supreme', 'Quesadilla de Pollo', 'Tacos Supreme', 'Nachos BellGrande'],
  },
  {
    id: 'dominos',
    name: "Domino's",
    color: BRAND_COLORS.dominos,
    emoji: '🍕',
    treat: '🍕',
    items: ['Pizza Pepperoni', 'Pizza Carnívora', 'Pizza Italiana', 'Alitas BBQ', 'Pan con Ajo'],
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    color: '#006241',
    emoji: '☕',
    treat: '☕',
    items: ['Frappuccino Caramel', 'Latte Macchiato', 'Iced Americano', 'Muffin de Arándanos', 'Croissant'],
  },
  {
    id: 'dunkin',
    name: "Dunkin'",
    color: '#FF6600',
    emoji: '🍩',
    treat: '🍩',
    items: ['Donas Rellenas', 'Boston Kreme', 'Café Helado', 'Iced Latte', 'Munchkins'],
  },
  {
    id: 'juanvaldez',
    name: 'Juan Valdez',
    color: '#5C2D91',
    emoji: '☕',
    treat: '☕',
    items: ['Nevado de Arequipe', 'Tinto Campesino', 'Latte Arequipe', 'Almojábana', 'Empanada'],
  },
  {
    id: 'castano',
    name: 'Castaño',
    color: '#8B4513',
    emoji: '🥐',
    treat: '🥐',
    items: ['Empanada de Pino', 'Medialuna', 'Sándwich Ave Mayo', 'Marrraqueta con Jamón', 'Café'],
  },
  {
    id: 'thecoffee',
    name: 'The Coffee',
    color: '#1A1A1A',
    emoji: '☕',
    treat: '☕',
    items: ['Matcha Latte', 'Flat White', 'Espresso', 'Iced Vanilla', 'Cookies'],
  },
  {
    id: 'doggis',
    name: "Doggi's",
    color: '#D32F2F',
    emoji: '🌭',
    treat: '🌭',
    items: ['Completo Italiano', 'Completo Dinámico', 'As de Carne', 'Papas Fritas', 'Empanadas'],
  },
  {
    id: 'juanmaestro',
    name: 'Juan Maestro',
    color: '#C62828',
    emoji: '🥪',
    treat: '🥩',
    items: ['Chacarero', 'Barros Luco', 'Lomito Italiano', 'Lomito Completo', 'Papas Rústicas'],
  },
  {
    id: 'tommybeans',
    name: 'Tommy Beans',
    color: '#2E7D32',
    emoji: '🌯',
    treat: '🌯',
    items: ['Burrito de Carne', 'Burrito de Pollo', 'Tacos Crujientes', 'Nachos con Guacamole'],
  },
  {
    id: 'pedrojuan',
    name: 'Pedro, Juan & Diego',
    color: '#E65100',
    emoji: '🍔',
    treat: '🍔',
    items: ['Hamburguesa Italiana', 'Hamburguesa BBQ', 'Chorrillana', 'Papas Chorrillana'],
  },
  {
    id: 'tarragona',
    name: 'Tarragona',
    color: '#B71C1C',
    emoji: '🍗',
    treat: '🍗',
    items: ['Caja de Pollo', 'Sándwich de Pollo Crispy', 'Empanadas de Queso', 'Papas Fritas'],
  },
  {
    id: 'littlecaesars',
    name: 'Little Caesars',
    color: '#FF6F00',
    emoji: '🍕',
    treat: '🍕',
    items: ['Pizza Pepperoni HOT-N-READY', 'Pizza 3 Quesos', 'Crazy Bread', 'Wings BBQ'],
  },
  {
    id: 'savory',
    name: 'Emporio La Rosa / Savory',
    color: '#EC407A',
    emoji: '🍦',
    treat: '🍦',
    items: ['Helado de Rosas', 'Helado de Chocolate Belga', 'Copa Helada', 'Waffle con Helado'],
  },
];

export const BRANDS_BY_ID: Record<string, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.id, b])
);

export type Meal = {
  id: string;
  couple_id: string;
  brand_id: string;
  item: string | null;
  price?: number | null;
  rating: number | null;
  notes: string | null;
  eaten_at: string;
  created_at: string;
  added_by?: string | null;
};
