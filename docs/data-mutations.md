# Data Mutations

## The Rules

1. **All data mutations go through `/data` helper functions** that wrap Drizzle ORM calls — never inline db writes in components or actions.
2. **All mutations are triggered via Server Actions** defined in colocated `actions.ts` files.
3. **Server Action params must be typed** — never use `FormData` as a parameter type.
4. **All Server Actions must validate their arguments with Zod** before touching the database.

---

## `/data` Mutation Helpers

Every insert, update, or delete lives in a `/data` helper — the same directory that owns query helpers (see `docs/data-fetching.md`).

**Rules:**
- Use Drizzle ORM. Never write raw SQL.
- Always resolve the current user via `auth()` from Clerk and scope the operation to that user (see `docs/auth.md`).
- Never accept `userId` as a parameter — resolve it internally.

```ts
// data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();

  return workout;
}
```

The `userId` guard on mutations is a hard security requirement — it prevents one user from modifying another user's data.

---

## Server Actions

All mutations triggered from the UI go through Server Actions. Every Server Action lives in an `actions.ts` file colocated with the route or feature it belongs to.

```
src/app/dashboard/actions.ts     ← actions for the dashboard route
src/app/workouts/[id]/actions.ts ← actions for the workout detail route
```

### Structure

```ts
// app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: Date;
}) {
  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  return createWorkout(parsed.data.name, parsed.data.startedAt);
}
```

### Rules

- The file must have `"use server"` at the top.
- Every exported function is a Server Action — name them with an `Action` suffix to distinguish them from `/data` helpers.
- Parameters must be a typed object — **never `FormData`**.
- Validate with Zod **before** calling any `/data` helper. Do not trust the caller.
- The Server Action calls the `/data` helper; it does not call `db` directly.
- Do not put business logic in actions — keep them thin. Logic belongs in `/data` helpers.
- **Never call `redirect()` inside a Server Action.** Return the result to the caller and let the client component handle navigation (e.g. `router.push(...)` after the action resolves).

---

## The Correct Flow

```
UI Component (client or server)
  └─▶ Server Action (app/**/actions.ts)   — validates input with Zod
        └─▶ /data helper (data/*.ts)      — enforces auth, calls Drizzle
              └─▶ Database
```

Each layer has one job. Nothing skips a layer.

---

## What Not to Do

```ts
// WRONG — db call directly in a Server Action
"use server";
export async function deleteWorkoutAction(id: number) {
  await db.delete(workouts).where(eq(workouts.id, id)); // skips /data layer
}
```

```ts
// WRONG — FormData param
export async function createWorkoutAction(data: FormData) { ... }
```

```ts
// WRONG — no Zod validation
export async function createWorkoutAction(params: { name: string }) {
  return createWorkout(params.name); // trusting unvalidated input
}
```

```ts
// WRONG — mutation inlined in a component
export default function Page() {
  async function handleSubmit() {
    "use server";
    await db.insert(workouts).values({ ... }); // must go through /data
  }
}
```

```ts
// WRONG — redirect inside a Server Action
"use server";
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  // ...
  redirect("/dashboard"); // never redirect from a Server Action
}

// CORRECT — return from the action, redirect client-side
// actions.ts
export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");
  return createWorkout(parsed.data.name, parsed.data.startedAt);
}

// MyForm.tsx (client component)
const router = useRouter();
startTransition(async () => {
  await createWorkoutAction({ name, startedAt });
  router.push("/dashboard");
});
```

---

## Why These Rules Exist

| Concern | Why it matters |
|---|---|
| `/data` helpers own all db calls | Single place to audit all writes; auth scoping is enforced consistently |
| Server Actions only | Mutations never hit the client bundle; no API routes to secure separately |
| No `FormData` params | Typed params are statically checked by TypeScript; `FormData` bypasses the type system |
| Zod validation on every action | Server Actions are public endpoints — any client can call them; always validate at the boundary |
| Colocated `actions.ts` files | Easy to find which actions belong to which route; avoids a sprawling global actions directory |
| No `redirect()` in actions | Keeps actions predictable and reusable; callers control navigation flow |
