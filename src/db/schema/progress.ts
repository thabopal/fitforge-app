import {
  date,
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
import { measurementSourceEnum, photoPoseEnum } from "@/db/schema/enums";
import { mediaAssets } from "@/db/schema/media";

export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    waistCm: numeric("waist_cm", { precision: 5, scale: 2 }),
    chestCm: numeric("chest_cm", { precision: 5, scale: 2 }),
    leftArmCm: numeric("left_arm_cm", { precision: 5, scale: 2 }),
    rightArmCm: numeric("right_arm_cm", { precision: 5, scale: 2 }),
    bodyFatPercentage: numeric("body_fat_percentage", { precision: 5, scale: 2 }),
    source: measurementSourceEnum("source").default("manual").notNull(),
    notes: text("notes"),
  },
  (table) => [index("body_measurements_user_time_idx").on(table.userId, table.measuredAt)],
);

export const progressPhotos = pgTable(
  "progress_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    pose: photoPoseEnum("pose").notNull(),
    capturedOn: date("captured_on").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("progress_photos_user_date_idx").on(table.userId, table.capturedOn)],
);

export const dailyHabitLogs = pgTable(
  "daily_habit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    waterMl: integer("water_ml").default(0).notNull(),
    steps: integer("steps").default(0).notNull(),
    creatineG: numeric("creatine_g", { precision: 4, scale: 1 }).default("0").notNull(),
    sleepMinutes: integer("sleep_minutes"),
    activeEnergyKcal: integer("active_energy_kcal"),
    notes: text("notes"),
    source: measurementSourceEnum("source").default("manual").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("daily_habit_logs_user_date_unique").on(table.userId, table.logDate),
    index("daily_habit_logs_user_date_idx").on(table.userId, table.logDate),
  ],
);

export const personalRecords = pgTable(
  "personal_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordType: text("record_type").notNull(),
    label: text("label").notNull(),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(),
    unit: text("unit").notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
  },
  (table) => [index("personal_records_user_type_idx").on(table.userId, table.recordType)],
);
