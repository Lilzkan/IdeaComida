# IdeaComida 🍔💑

App para parejas que nunca se ponen de acuerdo en qué comer. Incluye cadenas de comida rápida (McDonald's, Burger King, Wendy's, Subway, Papa John's, KFC, Taco Bell y Domino's), historial compartido, sugerencias inteligentes para no repetir y un apartado de ofertas y cupones por marca.

## ✨ Funcionalidades

- **Decidir qué comer:** elige una marca visualmente o deja que la app te sorprenda con una elección aleatoria ponderada.
- **Sugerencia inteligente:** evita las marcas comidas en los últimos 3 días y prioriza las mejor calificadas y las que hace más tiempo no prueban.
- **Historial compartido:** calendario/listado de comidas con marca, platillo, fecha, hora y calificación; con estadísticas y eliminación confirmada.
- **Calificaciones:** estrellas de 1 a 5 por comida, con promedio por marca.
- **Ofertas y cupones:** catálogo local de respaldo y ofertas administradas desde Firestore; toca un código para copiarlo.
- **Cuenta en pareja:** autenticación con Firebase y vinculación por código de invitación de 6 caracteres.
- **Sincronización en tiempo real:** si tu pareja registra, califica o borra una comida, tu historial se actualiza al instante (Firestore).
- **Datos cacheados:** React Query mantiene comidas, ofertas y pareja en caché, evita peticiones repetidas y revalida al volver a la app.
- **Perfil editable:** cambia tu nombre y gestiona tu pareja desde la app.
- **Modo offline parcial:** la sesión y el perfil se cachean con AsyncStorage.

## 🛠 Stack

- [Expo](https://expo.dev) (React Native + TypeScript) y [Expo Router](https://docs.expo.dev/router/)
- [Firebase](https://firebase.google.com) Auth + Firestore (cuentas, pareja, comidas, ofertas, tiempo real)
- React Query, Zustand, Zod, date-fns, Lucide

## 📱 Cómo abrir la app desde cualquier lugar

La app se publica como **web app** en Railway (`npm run build` genera `dist/`, `npm run serve` lo sirve). Abre la URL pública del servicio en el navegador del teléfono, sin PC ni Expo Go.

- **iPhone:** Safari > Compartir > *Añadir a pantalla de inicio*.
- **Android:** Chrome > menú > *Instalar app* / *Añadir a pantalla de inicio*.

Para desarrollo con Expo Go sigue valiendo `npm start`.

## ⚙️ Configuración

1. Copia `.env.example` a `.env` y completa las variables `EXPO_PUBLIC_FIREBASE_*` (en Railway van como variables del servicio; se incrustan al construir).
2. Firebase console > Authentication: activa *Correo electrónico/Contraseña* y agrega el dominio de Railway en *Dominios autorizados*.
3. Firestore: publica las reglas de `firestore.rules` (consola de Firebase o `firebase deploy --only firestore:rules`).

## 🗄️ Datos (Firestore)

| Colección | Descripción |
| --- | --- |
| `users` | Perfil (nombre, correo, `couple_id`). |
| `couples` | Pareja con `invite_code` de 6 caracteres. |
| `meals` | Comidas: marca, platillo, calificación, fecha. |
| `deals` | Ofertas opcionales. Si está vacía se usa el catálogo local. |

## 🧪 Scripts

```bash
npm start         # Expo dev server (QR para Expo Go)
npm run web       # Dev en navegador
npm run build     # Exporta la web a dist/
npm run serve     # Sirve dist/ (usa $PORT)
npm run typecheck # TypeScript
```

## 📄 Licencia

MIT. Ver [LICENSE](./LICENSE).
