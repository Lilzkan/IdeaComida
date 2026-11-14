import { BRAND_COLORS } from './colors';

export type Brand = {
  id: string;
  name: string;
  color: string;
  /** Mascota/emoji de la marca. */
  emoji: string;
  /** Emoji del antojo, para stickers del calendario y tarjetas. */
  treat: string;
  appUrl?: string;
  packageName?: string;
  // Opciones típicas del menú (para sugerencias y búsqueda en común)
  items: string[];
  // Ofertas/cupones destacados por defecto (se pueden editar desde la app)
  defaultDeals: {
    title: string;
    description: string;
    code?: string;
    price?: string;
    imageUrl?: string;
  }[];
};

export const BRANDS: Brand[] = [
  {
    id: 'mcdonalds',
    name: "McDonald's",
    color: BRAND_COLORS.mcdonalds,
    emoji: '🍔',
    treat: '🍔',
    packageName: 'com.mcdo.mcdonalds',
    appUrl: 'https://play.google.com/store/apps/details?id=com.mcdo.mcdonalds',
    items: [
      'Big Mac (Combo $6.490)',
      'Cuarto de Libra con Queso (Combo $6.790)',
      'McPollo / McFiesta (Combo $4.990)',
      'McNuggets (10 unidades $5.290)',
      'McFlurry Oreo / M&M ($2.190)',
      'Papas Fritas Medianas ($2.290)',
      'Desayuno McMuffin Huevo-Queso ($2.490)',
    ],
    defaultDeals: [
      {
        title: 'McFiesta o McPollo + Papas + Bebida',
        description: 'Combo completo con papas medianas y bebida refrescante.',
        code: 'MCAPP3990',
        price: '$3.990',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: '2x1 en McFlurry Oreo / M&M',
        description: 'Lunes a jueves en tu helado favorito escaneando en tótem o caja.',
        code: 'MCFLURRY2X1',
        price: '$2.190',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'burgerking',
    name: 'Burger King',
    color: BRAND_COLORS.burgerking,
    emoji: '👑',
    treat: '🍟',
    packageName: 'com.lingo.burgerking.cl',
    appUrl: 'https://play.google.com/store/apps/details?id=com.lingo.burgerking.cl',
    items: [
      'Whopper (Combo $6.590)',
      'Whopper Jr. ($2.890)',
      'King Bacon Doble (Combo $6.990)',
      'Aros de Cebolla Medianos ($2.490)',
      'Papas BK Grandes ($2.390)',
      'King Sabor (Desde $3.490)',
      'Pie de Manzana ($1.690)',
    ],
    defaultDeals: [
      {
        title: 'King Ahorro: 2 Whopper Jr. o King Bacon',
        description: 'Lleva 2 sándwiches seleccionados a precio especial.',
        code: 'KINGAHORRO',
        price: '$4.990',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Combo Whopper Mediano App',
        description: 'Whopper clásico + papas medianas + bebida.',
        code: 'WHOPPERBK',
        price: '$4.590',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'wendys',
    name: "Wendy's",
    color: BRAND_COLORS.wendys,
    emoji: '🐷',
    treat: '🥓',
    packageName: 'com.wendys.wendys',
    appUrl: 'https://wendys.cl',
    items: [
      "Dave's Single (Combo $6.890)",
      'Baconator Doble (Combo $7.990)',
      'Pollo Crispy (Combo $6.290)',
      'Papas con queso cheddar y tocino ($3.290)',
      'Frosty de Chocolate Chico ($1.990)',
      'Nuggets de Pollo (10 un. $4.990)',
    ],
    defaultDeals: [
      {
        title: 'Combo Baconator Doble con Descuento',
        description: 'Doble carne 100% vacuno con queso cheddar y abundante tocino.',
        code: 'BACONATOR20',
        price: '$6.990',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Frosty Chico Chocolate o Vainilla',
        description: 'El clásico postre batido frío ideal para acompañar tu menú.',
        code: 'FROSTY1490',
        price: '$1.490',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'subway',
    name: 'Subway',
    color: BRAND_COLORS.subway,
    emoji: '🥪',
    treat: '🥪',
    packageName: 'com.subway.subway',
    appUrl: 'https://subway.cl',
    items: [
      'Sub 15cm Pollo Teriyaki ($5.490)',
      'Sub 15cm Atún ($4.990)',
      'Sub 15cm Italiano BMT ($5.290)',
      'Sub del Día 15cm ($3.490)',
      'Wrap de Pollo César ($5.190)',
      'Galleta con Chispas de Chocolate ($1.190)',
    ],
    defaultDeals: [
      {
        title: 'Sub del Día de 15 cm',
        description: 'El sabor del día rebajado en todos los locales de Chile.',
        code: 'SUBDELDIA',
        price: '$3.490',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Combo Sub 15cm + Bebida + Galleta',
        description: 'Tu sándwich favorito en combo con bebida en lata y galleta horneada.',
        code: 'COMBOSUB',
        price: '$5.290',
        imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'papajohns',
    name: "Papa John's",
    color: BRAND_COLORS.papajohns,
    emoji: '🍕',
    treat: '🍕',
    packageName: 'cl.papajohns.app',
    appUrl: 'https://www.papajohns.cl',
    items: [
      'Pizza Familiar Pepperoni ($12.990)',
      'Pizza Familiar BBQ Chicken ($13.990)',
      'Pizza Familiar All The Meats ($14.990)',
      'Nudos de Ajo (6 un. $2.990)',
      'Alitas BBQ o Buffalo (8 un. $5.990)',
      'Papotas / Cheese Bread ($3.990)',
    ],
    defaultDeals: [
      {
        title: 'Lunes y Martes 50% OFF Online',
        description: 'Mitad de precio en pizzas familiares y medianas pidiendo por la web.',
        code: '50OFFLUNES',
        price: '50% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Combo Mediana + Acompañamiento',
        description: 'Pizza mediana + Nudos de ajo o Papotas para compartir.',
        code: 'DUO7990',
        price: '$7.990',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'kfc',
    name: 'KFC',
    color: BRAND_COLORS.kfc,
    emoji: '🍗',
    treat: '🍗',
    packageName: 'cl.kfc.app',
    appUrl: 'https://www.kfc.cl',
    items: [
      'Kentucky Burger (Combo $6.290)',
      'Sándwich Zinger (Combo $6.490)',
      'Bucket 8 Piezas de Pollo ($13.990)',
      'Tenders Crujientes (6 un. $5.490)',
      'Puré con Salsa de Pollo ($1.890)',
      'Papas Fritas Familiares ($3.490)',
    ],
    defaultDeals: [
      {
        title: 'Bucket 6 Piezas + 2 Papas + 2 Bebidas',
        description: 'Pollo crujiente recien hecho con acompañamientos.',
        code: 'BUCKET11990',
        price: '$11.990',
        imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Sándwich Zinger Individual Promo',
        description: 'Sándwich de pechuga crujiente de pollo picante o tradicional.',
        code: 'ZINGER3990',
        price: '$3.990',
        imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'tacobell',
    name: 'Taco Bell',
    color: BRAND_COLORS.tacobell,
    emoji: '🌮',
    treat: '🌮',
    packageName: 'com.tacobell.tacobell',
    appUrl: 'https://tacobell.cl',
    items: [
      'Crunchwrap Supreme (Combo $6.590)',
      'Quesadilla de Pollo (Combo $6.290)',
      'Taco Supreme (2 un. $4.290)',
      'Nachos BellGrande ($4.990)',
      'Baja Blast Mediano ($2.190)',
      'Cinnabon Delights (4 un. $2.490)',
    ],
    defaultDeals: [
      {
        title: 'Box Antojo Chileno Completo',
        description: 'Crunchwrap Supreme + Taco Crujiente + Papas + Bebida.',
        code: 'BOX5990',
        price: '$5.990',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: '2 Tacos Supreme de Carne o Pollo',
        description: '2 tacos con crema agria, tomate, lechuga y queso.',
        code: '2TACOSSUP',
        price: '$3.990',
        imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'dominos',
    name: "Domino's",
    color: BRAND_COLORS.dominos,
    emoji: '🍕',
    treat: '🍕',
    packageName: 'cl.dominos.app',
    appUrl: 'https://www.dominos.cl',
    items: [
      'Pizza Mediana Pepperoni ($9.990)',
      'Pizza Mediana Carnívora ($10.990)',
      'Pizza Mediana Italiana ($10.490)',
      'Alitas Horneadas BBQ (8 un. $5.490)',
      'Pan con Ajo y Queso ($3.290)',
      'Chocman / Brownie ($1.890)',
    ],
    defaultDeals: [
      {
        title: '2x1 en Pizzas Medianas y Familiares',
        description: 'Lleva 2 pizzas pagando solo una todos los días de la semana.',
        code: 'DOMINOS2X1',
        price: '2x1',
        imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Combo Personal Pizza + Bebida',
        description: 'Pizza personal a elección con bebida helada en lata.',
        code: 'PERSONAL4290',
        price: '$4.290',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
      },
    ],
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
  rating: number | null;
  notes: string | null;
  eaten_at: string;
  created_at: string;
  added_by?: string | null;
};

export type Deal = {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  code?: string;
  price?: string;
  imageUrl?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
};
