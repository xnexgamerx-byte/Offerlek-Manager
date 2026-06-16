---
name: Offerlek Admin App
description: Architecture decisions for the أوفرلك - الإدارة Expo app; external backend, role-based routing, RTL Arabic.
---

## External Backend
- All API calls go to `https://TalabatOfferlek.replit.app`
- No local backend or database in this project
- Token and role stored in AsyncStorage keys `@offerlek:token` and `@offerlek:role`

## Role-based routing
- Login response: role extracted from `response.role`, `response.user.role`, or decoded from JWT payload (atob)
- After login: redirects to `/(restaurant)/orders` or `/(driver)/available`
- Auth guard lives in `app/(tabs)/index.tsx` — entry point of the app

## RTL & Font
- `I18nManager.forceRTL(true)` set at module level in `app/_layout.tsx`
- Font: `@expo-google-fonts/cairo` (Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold)
- Font constants in `constants/fonts.ts`

## API endpoints (assumed, may need adjustment)
- POST `/api/auth/login` — login
- GET/PATCH `/api/orders` — restaurant order management
- GET/POST/PUT/DELETE `/api/menu` — menu management
- GET `/api/restaurant/stats` — today's stats
- GET `/api/driver/orders/available` — driver available orders
- GET `/api/driver/current` — driver current order
- GET `/api/driver/history` — driver history

**Why:** endpoints are assumed RESTful — if backend uses different paths, update `services/api.ts`.
