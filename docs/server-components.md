# Server Component Coding Standards

## Async Page Props Are Promises

**In Next.js 15, `params` and `searchParams` are Promises — they MUST be awaited.**

This is a breaking change from Next.js 14. Both props arrive as `Promise<...>` and accessing them without `await` will give you the Promise object itself, not the values.

```ts
// CORRECT — await params before use
type PageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  // ...
}
```

```ts
// WRONG — params is a Promise, not the object
type PageProps = {
  params: { workoutId: string };
};

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = params; // params is still a Promise here — this is a bug
}
```

This applies to both `params` and `searchParams`:

```ts
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { date } = await searchParams;
}
```

---

## All Page and Layout Components Must Be Async

Server components that receive `params` or `searchParams` must be declared `async` so the props can be awaited. There is no synchronous way to read them.

```ts
// CORRECT
export default async function Page({ params }: PageProps) {
  const { id } = await params;
}

// WRONG — can't await inside a non-async function
export default function Page({ params }: PageProps) {
  const { id } = params; // broken — params is a Promise
}
```

---

## Validating Route Params

After awaiting `params`, always validate the values before using them in a query. For numeric IDs, check that the parsed value is a valid integer before hitting the database, and call `notFound()` if it isn't.

```ts
import { notFound } from "next/navigation";

export default async function Page({ params }: PageProps) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  // ...
}
```

---

## What Not to Do

```ts
// WRONG — destructuring params without await
export default async function Page({ params }: { params: { id: string } }) {
  const workout = await getWorkoutById(Number(params.id)); // params is a Promise
}
```

```ts
// WRONG — using searchParams synchronously
export default async function Page({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date; // searchParams is a Promise
}
```

```ts
// WRONG — typing params as a plain object (will cause a TypeScript error in Next.js 15)
type PageProps = {
  params: { id: string }; // should be Promise<{ id: string }>
};
```

---

## Why These Rules Exist

| Concern | Why it matters |
|---|---|
| `params` is a Promise | Next.js 15 made page props async to support streaming and concurrent rendering — they can only be read asynchronously |
| Always type as `Promise<...>` | TypeScript will catch incorrect usage at compile time if the type is correct |
| Validate before querying | Route params come from the URL — they are untrusted user input and must be validated before reaching the database |
| `notFound()` on bad params | Returns a proper 404 rather than an unhandled error or empty state |
