# Auth Coding Standards

## The One Rule: Clerk Only

**This app uses [Clerk](https://clerk.com/) exclusively for authentication.**

Do NOT use:
- NextAuth / Auth.js
- Supabase Auth
- custom JWT/session logic
- any other authentication library or mechanism

Every auth concern — sign-in, sign-out, session management, user identity — is handled by Clerk. Do not build anything that duplicates or bypasses it.

---

## Middleware

All routes are protected at the middleware layer via `clerkMiddleware` from `@clerk/nextjs/server`.

The middleware is configured in `src/middleware.ts` and runs on every non-static route. Do not remove or weaken the matcher config — it must continue to cover all page and API routes.

```ts
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Getting the Current User

Always use the `auth()` helper from `@clerk/nextjs/server` to get the authenticated user's ID. This is the only approved way to resolve user identity server-side.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

- `auth()` is async — always `await` it.
- Always check that `userId` is non-null before proceeding. Throw or redirect if not.
- Never pass `userId` in from a component as a prop or query param — always resolve it server-side inside the function that needs it.

---

## Auth in `/data` Helpers

Every `/data` helper that touches user-owned data **must** call `auth()` internally and guard with the returned `userId`. This is how data isolation is enforced — see `docs/data-fetching.md` for the full data rules.

```ts
// data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

Never skip the auth check. Never accept `userId` as a parameter from outside — the helper owns it.

---

## Client-Side Auth

For client components that need to read the current user (e.g. to display an avatar or name), use Clerk's React hooks:

```ts
import { useUser, useAuth } from "@clerk/nextjs";

const { user } = useUser();       // full user object
const { userId, isLoaded } = useAuth(); // lightweight id + loading state
```

Client-side hooks are for **display only**. Never use them to make access control decisions — those must happen server-side via `auth()`.

---

## Sign In / Sign Up UI

Use Clerk's hosted components. Do not build custom login forms.

```ts
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
```

- `<SignIn />` — renders the sign-in flow
- `<SignUp />` — renders the sign-up flow
- `<UserButton />` — renders the user avatar/menu with sign-out

---

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe to expose to the client.
- `CLERK_SECRET_KEY` is a server-only secret — never reference it in client components or expose it in API responses.

---

## Why These Rules Exist

| Concern | Why it matters |
|---|---|
| Clerk only | Single auth system means one place to audit, configure, and rotate credentials |
| `auth()` server-side only for access control | Client-side state can be spoofed; only server-side resolution is trustworthy |
| Auth checked inside `/data` helpers | Prevents accidental data leaks if a helper is called from an unprotected path |
| No custom session logic | Rolling your own auth is error-prone and a common source of critical vulnerabilities |
