# Routing Coding Standards

## Route Structure

All application routes live under `/dashboard`. There are no feature routes outside of this prefix.

```
/                          → public landing page (src/app/page.tsx)
/dashboard                 → protected: main dashboard (src/app/dashboard/page.tsx)
/dashboard/workout/new     → protected: create workout
/dashboard/workout/[id]    → protected: view/edit workout
```

Do not create top-level routes for app features. New pages go under `src/app/dashboard/`.

---

## Route Protection

All `/dashboard` routes are protected — they must only be accessible to signed-in users.

**Protection is enforced exclusively via Next.js middleware**, not inside page components or layouts. Do not add auth checks inside `src/app/dashboard/layout.tsx` or individual pages as a substitute for middleware.

The middleware lives at `src/middleware.ts` and uses Clerk's `clerkMiddleware`. The `/dashboard` prefix must be covered by the matcher.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

`auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically. Do not manually redirect inside the middleware.

---

## Public vs Protected Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/dashboard` | Protected (auth required) |
| `/dashboard/**` | Protected (auth required) |

If a new public route is needed (e.g. a marketing page), it belongs at the top level outside `/dashboard` and requires no middleware changes. If a new protected route is needed, place it under `src/app/dashboard/` — it is automatically covered by the existing middleware rule.

---

## Navigation Between Routes

Use Next.js `<Link>` for all client-side navigation. Do not use `<a>` tags for internal routes.

```tsx
import Link from 'next/link'

<Link href="/dashboard/workout/new">New Workout</Link>
```

For programmatic navigation in Server Actions or after mutations, use `redirect` from `next/navigation`:

```ts
import { redirect } from 'next/navigation'

redirect('/dashboard')
```

---

## Why These Rules Exist

| Rule | Reason |
|---|---|
| All features under `/dashboard` | Single prefix makes the middleware matcher simple and airtight — no risk of accidentally leaving a route unprotected |
| Middleware-only protection | Centralised enforcement; page-level checks are easy to forget and don't cover API routes or edge cases |
| No auth checks in layouts/pages | Avoids duplicated logic that can fall out of sync with the middleware |
