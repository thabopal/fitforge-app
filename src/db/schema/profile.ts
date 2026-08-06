import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";
import {
  allergySeverityEnum,
  biologicalSexEnum,
  fitnessGoalEnum,
  unitSystemEnum,
} from "@/db/schema/enums";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  sex: biologicalSexEnum("sex"),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  timezone: text("timezone").default("Africa/Johannesburg").notNull(),
  preferredUnitSystem: unitSystemEnum("preferred_unit_system").default("metric").notNull(),
  preferredWorkoutTime: time("preferred_workout_time"),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userGoals = pgTable(
  "user_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    goalType: fitnessGoalEnum("goal_type").notNull(),
    targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 2 }),
    targetDate: date("target_date"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_goals_user_id_idx").on(table.userId),
    uniqueIndex("user_goals_active_primary_unique")
      .on(table.userId)
      .where(sql`${table.isPrimary} = true and ${table.endsOn} is null`),
  ],
);

export const userTargets = pgTable(
  "user_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    calorieTargetKcal: integer("calorie_target_kcal"),
    proteinTargetMinG: integer("protein_target_min_g").notNull(),
    proteinTargetMaxG: integer("protein_target_max_g").notNull(),
    waterTargetMl: integer("water_target_ml").notNull(),
    stepTarget: integer("step_target").notNull(),
    creatineTargetG: numeric("creatine_target_g", { precision: 4, scale: 1 }),
    workoutDaysPerWeek: integer("workout_days_per_week").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("user_targets_user_effective_idx").on(table.userId, table.effectiveFrom)],
);

export const dietaryPreferences = pgTable("dietary_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const userDietaryPreferences = pgTable(
  "user_dietary_preferences",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dietaryPreferenceId: uuid("dietary_preference_id")
      .notNull()
      .references(() => dietaryPreferences.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("user_dietary_preferences_unique").on(table.userId, table.dietaryPreferenceId)],
);

export const allergens = pgTable("allergens", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const userAllergens = pgTable(
  "user_allergens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    allergenId: uuid("allergen_id")
      .notNull()
      .references(() => allergens.id, { onDelete: "cascade" }),
    severity: allergySeverityEnum("severity").default("mild").notNull(),
    notes: text("notes"),
  },
  (table) => [uniqueIndex("user_allergens_unique").on(table.userId, table.allergenId)],
);

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const userEquipment = pgTable(
  "user_equipment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    equipmentId: uuid("equipment_id")
      .notNull()
      .references(() => equipment.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(1).notNull(),
    maximumWeightKg: numeric("maximum_weight_kg", { precision: 7, scale: 2 }),
  },
  (table) => [uniqueIndex("user_equipment_unique").on(table.userId, table.equipmentId)],
);
