"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().max(255).optional(),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name?: string;
  startedAt: Date;
}) {
  const parsed = updateWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  return updateWorkout(
    parsed.data.workoutId,
    parsed.data.name ?? null,
    parsed.data.startedAt
  );
}
