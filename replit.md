# أوفرلك - الإدارة

تطبيق Expo React Native لإدارة المطاعم والسواق، يتصل بـ Backend خارجي (TalabatOfferlek.replit.app).

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — تشغيل تطبيق Expo (المنفذ من workflow)
- `pnpm run typecheck` — فحص TypeScript لجميع الحزم
- `pnpm run build` — بناء جميع الحزم

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK + Expo Router (file-based routing)
- State: React Query (@tanstack/react-query)
- Font: Cairo Arabic (RTL)
- Auth: JWT stored in AsyncStorage
- Backend: TalabatOfferlek.replit.app (external)

## Where things live

- `artifacts/mobile/` — تطبيق Expo الرئيسي
- `artifacts/mobile/app/` — شاشات التطبيق (Expo Router)
- `artifacts/mobile/app/(auth)/` — شاشات تسجيل الدخول
- `artifacts/mobile/app/(restaurant)/` — واجهة المطعم (الطلبات، القائمة، الإحصائيات)
- `artifacts/mobile/app/(driver)/` — واجهة السائق (المتاحة، الحالي، السجل)
- `artifacts/mobile/app/(tabs)/index.tsx` — Auth guard & redirect
- `artifacts/mobile/context/AuthContext.tsx` — JWT auth state
- `artifacts/mobile/services/api.ts` — API client for TalabatOfferlek
- `artifacts/mobile/constants/colors.ts` — Design tokens (orange #FF6B35)
- `artifacts/mobile/constants/fonts.ts` — Cairo font family constants

## Architecture decisions

- **External Backend Only**: التطبيق يتصل مباشرة بـ TalabatOfferlek.replit.app، لا يوجد backend محلي
- **Role-based routing**: بعد Login، يُحلَّل الـ JWT للحصول على الـ role، ثم يتم التوجيه التلقائي
- **RTL**: I18nManager.forceRTL(true) مُفعَّل في _layout.tsx
- **Cairo font**: خط عربي مُحمَّل عبر @expo-google-fonts/cairo
- **Polling**: الطلبات تُحدَّث تلقائياً كل 15 ثانية عبر React Query refetchInterval

## Product

- شاشة تسجيل دخول مشتركة (رقم هاتف + كلمة مرور)
- واجهة المطعم: إدارة الطلبات (قبول/رفض/جاهز)، إدارة القائمة (إضافة/تعديل/حذف/تفعيل)، إحصائيات اليوم
- واجهة السائق: الطلبات المتاحة (استلام)، طلبي الحالي (تسليم)، سجل التوصيلات اليوم

## User preferences

_يُضاف حسب طلب المستخدم_

## Gotchas

- `I18nManager.forceRTL(true)` يتطلب reload ليطبَّق على الجلسة الأولى
- API endpoints في `services/api.ts` تعتمد على هيكل TalabatOfferlek — قد تحتاج تعديل حسب ردود الـ backend الفعلية
- لا تستخدم `npx expo start` مباشرة — استخدم `restart_workflow` بدلاً من ذلك

## Test Credentials

- مطعم: 07701000001 / password123
- سائق: 07702000001 / password123

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific guidelines
