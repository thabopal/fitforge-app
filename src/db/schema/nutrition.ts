import { sql } from "drizzle-orm";
import {
  boolean,
  check,
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
import {
  contentStatusEnum,
  mealTypeEnum,
  mediaRoleEnum,
  planStatusEnum,
  recipeDifficultyEnum,
  servingUnitEnum,
} from "@/db/schema/enums";
import { mediaAssets } from "@/db/schema/media";
import { allergens, dietaryPreferences } from "@/db/schema/profile";

export const foodCategories = pgTable("food_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => foodCategories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    defaultServingQuantity: numeric("default_serving_quantity", {
      precision: 8,
      scale: 2,
    }).notNull(),
    defaultServingUnit: servingUnitEnum("default_serving_unit").notNull(),
    caloriesKcal: numeric("calories_kcal", {
      precision: 8,
      scale: 2,
    }).notNull(),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }).notNull(),
    carbohydrateG: numeric("carbohydrate_g", {
      precision: 8,
      scale: 2,
    }).notNull(),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }).notNull(),
    fibreG: numeric("fibre_g", { precision: 8, scale: 2 }),
    sodiumMg: numeric("sodium_mg", { precision: 8, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("foods_category_active_idx").on(table.categoryId, table.isActive),
  ],
);

export const foodAllergens = pgTable(
  "food_allergens",
  {
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    allergenId: uuid("allergen_id")
      .notNull()
      .references(() => allergens.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("food_allergens_unique").on(table.foodId, table.allergenId),
  ],
);

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    mealType: mealTypeEnum("meal_type").notNull(),
    difficulty: recipeDifficultyEnum("difficulty").notNull(),
    prepMinutes: integer("prep_minutes").default(0).notNull(),
    cookMinutes: integer("cook_minutes").default(0).notNull(),
    servings: numeric("servings", { precision: 6, scale: 2 })
      .default("1")
      .notNull(),
    caloriesKcal: numeric("calories_kcal", { precision: 8, scale: 2 }),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }),
    carbohydrateG: numeric("carbohydrate_g", { precision: 8, scale: 2 }),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }),
    fibreG: numeric("fibre_g", { precision: 8, scale: 2 }),
    isPublic: boolean("is_public").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    status: contentStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("recipes_discovery_idx").on(
      table.status,
      table.isPublic,
      table.mealType,
    ),
  ],
);

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id),
    quantity: numeric("quantity", { precision: 8, scale: 2 }).notNull(),
    unit: servingUnitEnum("unit").notNull(),
    preparationNote: text("preparation_note"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("recipe_ingredients_order_unique").on(
      table.recipeId,
      table.sortOrder,
    ),
  ],
);

export const recipeSteps = pgTable(
  "recipe_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    instruction: text("instruction").notNull(),
  },
  (table) => [
    uniqueIndex("recipe_steps_order_unique").on(
      table.recipeId,
      table.sortOrder,
    ),
  ],
);

export const recipeMedia = pgTable(
  "recipe_media",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    role: mediaRoleEnum("role").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("recipe_media_unique").on(
      table.recipeId,
      table.mediaAssetId,
      table.role,
    ),
  ],
);

export const recipeTags = pgTable("recipe_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const recipeTagLinks = pgTable(
  "recipe_tag_links",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    recipeTagId: uuid("recipe_tag_id")
      .notNull()
      .references(() => recipeTags.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("recipe_tag_links_unique").on(
      table.recipeId,
      table.recipeTagId,
    ),
  ],
);

export const recipeDietaryPreferences = pgTable(
  "recipe_dietary_preferences",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    dietaryPreferenceId: uuid("dietary_preference_id")
      .notNull()
      .references(() => dietaryPreferences.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("recipe_dietary_preferences_unique").on(
      table.recipeId,
      table.dietaryPreferenceId,
    ),
  ],
);

export const mealPlans = pgTable(
  "meal_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on").notNull(),
    status: planStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("meal_plans_user_dates_idx").on(
      table.userId,
      table.startsOn,
      table.endsOn,
    ),
  ],
);

export const mealPlanEntries = pgTable(
  "meal_plan_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mealPlanId: uuid("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    plannedDate: date("planned_date").notNull(),
    mealType: mealTypeEnum("meal_type").notNull(),
    recipeId: uuid("recipe_id").references(() => recipes.id, {
      onDelete: "set null",
    }),
    customName: text("custom_name"),
    servings: numeric("servings", { precision: 6, scale: 2 })
      .default("1")
      .notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("meal_plan_entries_day_idx").on(table.mealPlanId, table.plannedDate),
    check(
      "meal_plan_entry_content_check",
      sql`${table.recipeId} is not null or ${table.customName} is not null`,
    ),
  ],
);

export const mealLogs = pgTable(
  "meal_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mealPlanEntryId: uuid("meal_plan_entry_id").references(
      () => mealPlanEntries.id,
      { onDelete: "set null" },
    ),
    recipeId: uuid("recipe_id").references(() => recipes.id, {
      onDelete: "set null",
    }),
    loggedAt: timestamp("logged_at", { withTimezone: true }).notNull(),
    mealType: mealTypeEnum("meal_type").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    servings: numeric("servings", { precision: 6, scale: 2 })
      .default("1")
      .notNull(),
    caloriesKcal: numeric("calories_kcal", { precision: 8, scale: 2 }),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }),
    carbohydrateG: numeric("carbohydrate_g", { precision: 8, scale: 2 }),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }),
    notes: text("notes"),
  },
  (table) => [
    index("meal_logs_user_time_idx").on(table.userId, table.loggedAt),
  ],
);
