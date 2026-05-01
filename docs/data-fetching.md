# Data Fetching

## The One Rule: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

This is non-negotiable. Do not fetch data in:
- Route Handlers (`app/api/*/route.ts`)
- Client Components (`"use client"`)
- Middleware
- Any other mechanism

If you find yourself reaching for `useEffect` + `fetch`, a Route Handler, or `getServerSideProps` patterns — stop. The answer is a Server Component.

## Database Access: The `/data` Directory

All database queries MUST go through helper functions in the `/data` directory.

**Rules:**
1. Every database query lives in a `/data` helper function — never inline queries in components or pages.
2. All queries MUST use Drizzle ORM. **Never write raw SQL.**
3. Every query MUST scope results to the currently authenticated user. A logged-in user must never be able to read or modify another user's data.

## User Data Isolation

This is a hard security requirement. Every `/data` helper that returns user-owned data must filter by the authenticated user's ID.

**Always do this:**
```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getWorkouts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

**Never do this:**
```ts
// WRONG — no user scoping
export async function getWorkouts() {
  return db.select().from(workouts); // returns ALL users' data
}
```

**Also wrong — raw SQL:**
```ts
// WRONG — raw SQL is forbidden
export async function getWorkouts(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
}
```

## Calling `/data` Helpers from Server Components

```ts
// app/dashboard/page.tsx
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts(); // auth check happens inside

  return <WorkoutList workouts={workouts} />;
}
```

The Server Component calls the helper; the helper owns auth enforcement. Never pass `userId` as a parameter from a component — the helper must resolve it internally from the session.

## Why These Rules Exist

| Concern | Why it matters |
|---|---|
| Server Components only | Keeps secrets (DB credentials, session tokens) off the client; no client/server waterfalls |
| `/data` helpers | Single place to audit all DB access; easy to enforce security invariants |
| Drizzle ORM, no raw SQL | Type-safety, query composability, protection against SQL injection |
| Always scope to auth user | Prevents horizontal privilege escalation (IDOR) — one of the most common web vulnerabilities |
