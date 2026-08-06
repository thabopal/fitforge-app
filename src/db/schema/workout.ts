import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";
import {
  exerciseDifficultyEnum,
  fitnessGoalEnum,
  mediaRoleEnum,
  movementPatternEnum,
  muscleRoleEnum,
  planStatusEnum,
  setTypeEnum,
  workoutSessionStatusEnum,
} from "@/db/schema/enums";
import { mediaAssets } from "@/db/schema/media";
import { equipment } from "@/db/schema/profile";

export const muscleGroups = pgTable("muscle_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const exerciseCategories = pgTable("exercise_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => exerciseCategories.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    instructions: text("instructions").notNull(),
    commonMistakes: text("common_mistakes"),
    difficulty: exerciseDifficultyEnum("difficulty").notNull(),
    movementPattern: movementPatternEnum("movement_pattern"),
    isUnilateral: boolean("is_unilateral").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("exercises_category_active_idx").on(table.categoryId, table.isActive)],
);

export const exerciseMuscleGroups = pgTable(
  "exercise_muscle_groups",
  {
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
    muscleGroupId: uuid("muscle_group_id")
      .notNull()
      .references(() => muscleGroups.id, { onDelete: "cascade" }),
    role: muscleRoleEnum("role").notNull(),
  },
  (table) => [uniqueIndex("exercise_muscle_groups_unique").on(table.exerciseId, table.muscleGroupId, table.role)],
);

export const exerciseEquipment = pgTable(
  "exercise_equipment",
  {
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
    equipmentId: uuid("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("exercise_equipment_unique").on(table.exerciseId, table.equipmentId)],
);

export const exerciseMedia = pgTable(
  "exercise_media",
  {
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    role: mediaRoleEnum("role").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [uniqueIndex("exercise_media_unique").on(table.exerciseId, table.mediaAssetId, table.role)],
);

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    goalType: fitnessGoalEnum("goal_type"),
    daysPerWeek: integer("days_per_week").notNull(),
    status: planStatusEnum("status").default("draft").notNull(),
    startsOn: timestamp("starts_on", { withTimezone: true }),
    endsOn: timestamp("ends_on", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("workout_plans_user_status_idx").on(table.userId, table.status)],
);

export const workoutDays = pgTable(
  "workout_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutPlanId: uuid("workout_plan_id")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    estimatedMinutes: integer("estimated_minutes"),
  },
  (table) => [uniqueIndex("workout_days_plan_day_unique").on(table.workoutPlanId, table.dayNumber)],
);

export const workoutDayExercises = pgTable(
  "workout_day_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutDayId: uuid("workout_day_id")
      .notNull()
      .references(() => workoutDays.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
    sortOrder: integer("sort_order").notNull(),
    targetSets: integer("target_sets").notNull(),
    targetRepsMin: integer("target_reps_min"),
    targetRepsMax: integer("target_reps_max"),
    targetDurationSeconds: integer("target_duration_seconds"),
    restSeconds: integer("rest_seconds"),
    tempo: text("tempo"),
    notes: text("notes"),
  },
  (table) => [uniqueIndex("workout_day_exercises_order_unique").on(table.workoutDayId, table.sortOrder)],
);

export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    workoutPlanId: uuid("workout_plan_id").references(() => workoutPlans.id, { onDelete: "set null" }),
    workoutDayId: uuid("workout_day_id").references(() => workoutDays.id, { onDelete: "set null" }),
    nameSnapshot: text("name_snapshot").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: workoutSessionStatusEnum("status").notNull(),
    notes: text("notes"),
  },
  (table) => [index("workout_sessions_user_started_idx").on(table.userId, table.startedAt)],
);

export const workoutSessionExercises = pgTable(
  "workout_session_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutSessionId: uuid("workout_session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "set null" }),
    nameSnapshot: text("name_snapshot").notNull(),
    sortOrder: integer("sort_order").notNull(),
    notes: text("notes"),
  },
  (table) => [uniqueIndex("workout_session_exercises_order_unique").on(table.workoutSessionId, table.sortOrder)],
);

export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionExerciseId: uuid("session_exercise_id")
      .notNull()
      .references(() => workoutSessionExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    setType: setTypeEnum("set_type").default("working").notNull(),
    repetitions: integer("repetitions"),
    weightKg: numeric("weight_kg", { precision: 7, scale: 2 }),
    durationSeconds: integer("duration_seconds"),
    distanceMetres: numeric("distance_metres", { precision: 9, scale: 2 }),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    completed: boolean("completed").default(true).notNull(),
  },
  (table) => [uniqueIndex("exercise_sets_number_unique").on(table.sessionExerciseId, table.setNumber)],
);
