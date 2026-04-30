import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const exercises = pgTable("exercises", {
  id:        serial("id").primaryKey(),
  name:      varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workouts = pgTable("workouts", {
  id:          serial("id").primaryKey(),
  userId:      varchar("user_id", { length: 255 }).notNull(),
  name:        varchar("name", { length: 255 }),
  startedAt:   timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workoutExercises = pgTable("workout_exercises", {
  id:         serial("id").primaryKey(),
  workoutId:  integer("workout_id")
                .notNull()
                .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
                .notNull()
                .references(() => exercises.id, { onDelete: "cascade" }),
  order:      integer("order").notNull().default(0),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const sets = pgTable("sets", {
  id:                serial("id").primaryKey(),
  workoutExerciseId: integer("workout_exercise_id")
                       .notNull()
                       .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber:         integer("set_number").notNull().default(1),
  reps:              integer("reps").notNull(),
  weight:            numeric("weight", { precision: 7, scale: 2 }),
  createdAt:         timestamp("created_at").defaultNow().notNull(),
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout:  one(workouts,  { fields: [workoutExercises.workoutId],  references: [workouts.id]  }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets:     many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields:     [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
