"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name?: string;
  startedAt: Date;
}) {
  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  await createWorkout(parsed.data.name ?? null, parsed.data.startedAt);
  redirect("/dashboard");
}
