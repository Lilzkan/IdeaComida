# IdeaComida 🍔💑

App para parejas que nunca se ponen de acuerdo en qué comer. Incluye cadenas de comida rápida (McDonald's, Burger King, Wendy's, Subway, Papa John's, KFC, Taco Bell y Domino's), historial compartido, sugerencias inteligentes para no repetir y un apartado de ofertas y cupones por marca.

## ✨ Funcionalidades

- **Decidir qué comer:** elige una marca visualmente o deja que la app te sorprenda con una elección aleatoria ponderada.
- **Sugerencia inteligente:** evita las marcas comidas en los últimos 3 días y prioriza las mejor calificadas y las que hace más tiempo no prueban.
- **Historial compartido:** calendario/listado de comidas con marca, platillo, fecha, hora y calificación; con estadísticas y eliminación confirmada.
- **Calificaciones:** estrellas de 1 a 5 por comida, con promedio por marca.
- **Ofertas y cupones:** catálogo local de respaldo y soporte para ofertas administradas desde Supabase; toca un código para copiarlo.
- **Cuenta en pareja:** autenticación con Supabase y vinculación por código de invitación de 6 caracteres.
- **Sincronización en tiempo real:** si tu pareja registra, califica o borra una comida, tu historial se actualiza al instante (Supabase Realtime).
- **Datos cacheados:** React Query mantiene comidas, ofertas y pareja en caché, evita peticiones repetidas y revalida al volver a la app.
- **Perfil editable:** cambia tu nombre y gestiona tu pareja desde la app.
- **Modo offline parcial:** la sesión y el perfil se cachean con AsyncStorage.

## 🛠 Stack

- [Expo](https://expo.dev) (React Native + TypeScript)
- [Expo Router](https://docs.expo.dev/router/) (navegación por archivos)
- [Supabase](https://supabase.com) (auth, base de datos, RLS y Realtime)
- [React Query](https://tanstack.com/query) (caché, refetch y mutaciones)
- [Zustand](https://zustand-demo.pmnd.rs/) (estado global + persistencia)
- [Zod](https://zod.dev/) (validación de formularios)
- [date-fns](https://date-fns.org/) (fechas en español)
- [Lucide React Native](https://lucide.dev/) (iconos)

## 🚀 Primeros pasos

### 1. Requisitos

- **Node.js 20 LTS** (recomendado; evita versiones muy nuevas con Expo SDK 51).
- Una cuenta en [Supabase](https://supabase.com).
- Expo Go en tu teléfono (opcional) o un emulador.

### 2. Instalar dependencias

```bash
cd ideacomida
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [app.supabase.com](https://app.supabase.com).
2. Ve a **Settings > API** y copia la **Project URL** y la **anon public key**.
3. Copia el archivo de entorno:

```bash
cp .env.example .env
```

4. Edita `.env` con tus valores:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

5. Abre el **SQL Editor** de Supabase, pega el contenido completo de `SUPABASE_SCHEMA.sql` y ejecútalo.

   El script es **idempotente**: se puede volver a ejecutar para actualizar un proyecto existente sin borrar datos. Crea tablas, índices, RLS, el trigger de perfil automático y las funciones seguras para crear/unirse/salir de una pareja.

6. (Opcional) En **Authentication > Providers > Email** puedes desactivar “Confirm email” mientras desarrollas. Si lo dejas activo, la app mostrará la pantalla “Revisa tu correo” después del registro.

### 4. Ejecutar la app

```bash
npx expo start
```

- Presiona **a** para Android, **i** para iOS (simulador) o **w** para web.
- En un Android físico, escanea el QR con **Expo Go**.

> Si cambiaste `.env` y no se refleja, reinicia con `npx expo start --clear`.

## 📁 Estructura del proyecto

```
app/
  _layout.tsx            # Providers, restauración de sesión y guard de navegación
  login.tsx              # Inicio de sesión (validación con Zod)
  register.tsx           # Registro + confirmación de correo
  pareja.tsx             # Crear/unirse a una pareja por código
  +not-found.tsx         # Pantalla 404
  (tabs)/
    _layout.tsx          # Pestañas inferiores
    index.tsx            # Decidir qué comer + sugerencia + últimas comidas
    historial.tsx        # Historial compartido con estadísticas
    ofertas.tsx          # Ofertas y cupones por marca
    perfil.tsx           # Perfil, edición de nombre y pareja
  marca/[id].tsx         # Detalle de marca: platillos, cupones e historial
components/
  StarRating.tsx         # Estrellas reutilizables (lectura y edición)
constants/
  colors.ts              # Paleta de colores
  brands.ts              # Catálogo de marcas, platillos y ofertas locales
hooks/
  useMeals.ts            # Queries/mutaciones de comidas + suscripción Realtime
  useDeals.ts            # Ofertas cacheadas + Realtime
  useCouple.ts           # Datos de la pareja
lib/
  supabase.ts            # Cliente tipado + persistencia de sesión nativa
  queryClient.ts         # Configuración global de React Query
  errors.ts              # Traducción de errores de Supabase al español
  validation.ts          # Esquemas Zod para formularios
  format.ts              # Fechas relativas y utilidades
store/
  useStore.ts            # Auth, perfil y acciones de pareja (Zustand)
SUPABASE_SCHEMA.sql      # Esquema SQL idempotente para Supabase
.env.example             # Plantilla de variables de entorno
```

## 🔐 Cómo funciona la cuenta en pareja

1. Una persona entra a **Perfil > Pareja**, escribe un nombre opcional y toca **Crear pareja**.
2. La app genera un **código de invitación de 6 caracteres** (ej. `A1B2C3`).
3. La otra persona inicia sesión, entra a **Perfil > Pareja > Unirme** y escribe el código.
4. Desde ese momento ambas cuentas comparten el mismo `couple_id`: historial, calificaciones y comidas.

Detalles técnicos:

- El `couple_id` **no se puede modificar directamente** desde el cliente (se revocó el permiso de actualización de esa columna).
- Los cambios de pareja pasan por funciones `security definer`: `create_couple`, `join_couple_by_code` y `leave_couple`.
- Las políticas RLS solo permiten leer/escribir comidas de la pareja a la que pertenece el usuario.

## 🗄️ Base de datos

Tablas principales:

| Tabla      | Descripción                                                        |
| ---------- | ------------------------------------------------------------------ |
| `profiles` | Perfil de cada usuario (nombre, correo, `couple_id`, avatar).       |
| `couples`  | Parejas con `invite_code` único.                                   |
| `meals`    | Comidas registradas: marca, platillo, calificación y fecha.        |
| `deals`    | Ofertas/cupones opcionales administrados desde Supabase.           |

`meals` y `deals` tienen índices para las consultas de la app. `deals` es opcional: si está vacía, la app usa el catálogo local de `constants/brands.ts`.

La sección 10 de `SUPABASE_SCHEMA.sql` agrega `meals` y `deals` a la publicación `supabase_realtime` y activa `replica identity full` en `meals` (necesario para que los eventos DELETE se filtren por pareja). Si actualizas un proyecto existente, vuelve a ejecutar el script completo.

Para poblar ofertas desde Supabase, inserta filas con `brand_id` igual a los ids del catálogo (`mcdonalds`, `burgerking`, `wendys`, `subway`, `papajohns`, `kfc`, `tacobell`, `dominos`).

## 🧪 Scripts

```bash
npm start        # Expo dev server
npm run android  # Abrir en Android
npm run ios      # Abrir en iOS
npm run web      # Abrir en web
npm run lint     # ESLint (expo lint)
npm run typecheck# TypeScript sin emitir
```

## 🧭 Decisiones y correcciones de esta revisión

Esta versión corrige problemas que impedían que la app funcionara de forma confiable:

- Se agregó `main: "expo-router/entry"` (sin esto Expo Router no arranca).
- Se corrigió el import de `AsyncStorage` (era named import y quedaba `undefined`).
- Se configuró el cliente de Supabase con almacenamiento nativo, `react-native-url-polyfill` y tipos de la base.
- Se corrigió el evento de auth (`SIGNED_IN`/`SIGNED_OUT`, antes con espacio) y se agregó un guard de navegación real.
- Se añadieron rutas y alias `@/*` en `tsconfig.json`; Metro y TypeScript los resuelven.
- Se corrigieron iconos inexistentes (`Couple`), imports faltantes (`ChevronRight`) y variables sin usar.
- Se reemplazaron las listas anidadas del detalle de marca por un solo `ScrollView` funcional.
- Se arregló la animación de “Sorpréndeme” (antes no se animaba).
- El botón flotante de marca ahora permite guardar sin platillo; antes era imposible.
- Se agregó política RLS de **DELETE** para comidas (antes borrar fallaba silenciosamente).
- Se agregó confirmación al borrar comidas y al cerrar sesión.
- Se agregó la pantalla de pareja con código de invitación.
- Se agregó **React Query** para cachear comidas/ofertas/pareja, con refetch al recuperar el foco y mutaciones optimistas al borrar.
- Se agregó **Realtime**: las comidas y ofertas se sincronizan entre dispositivos sin recargar la app.
- Se movieron estilos repartidos a `StyleSheet` y se agregó `SafeAreaView` en todas las pantallas.
- Se agregó `.gitignore`, `.eslintrc.js`, `babel.config.js` y `LICENSE`.

## 🚧 Siguientes pasos sugeridos

- **Notificaciones push** (“¿Ya eligieron qué cenar?”) con `expo-notifications`.
- **Fotos de los platos** y reseñas cortas por comida.
- **Filtro de ofertas por ciudad/sucursal** y enlaces a las apps de cada marca.
- **Modo oscuro completo** (la paleta actual es clara; conviene centralizar un tema).
- **Tests automatizados** de las funciones de la pareja y del cálculo de sugerencias.
- **Internacionalización** (hoy los textos están en español y los precios en MXN).

## 🐛 Solución de problemas

| Problema | Solución |
| --- | --- |
| “Falta configurar Supabase” | Crea `.env` con las dos variables y reinicia con `--clear`. |
| No aparece el código de invitación | Ejecuta de nuevo `SUPABASE_SCHEMA.sql` para crear las funciones y la columna `invite_code`. |
| El registro no inicia sesión | Revisa si “Confirm email” está activo en Supabase. |
| Errores de permisos al guardar | Verifica que ejecutaste el SQL y que ambos usuarios están en la misma pareja. |
| No carga el historial | Revisa tu conexión y que `profile.couple_id` no sea `null`. |
| El historial no se actualiza solo | Vuelve a ejecutar `SUPABASE_SCHEMA.sql` (sección 10) y confirma en **Database > Replication** que `meals` y `deals` están en `supabase_realtime`. |

## 📄 Licencia

MIT — usa y modifica el proyecto como quieras. Ver [LICENSE](./LICENSE).
#   I d e a C o m i d a  
 