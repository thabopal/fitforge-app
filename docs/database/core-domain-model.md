# FitForge Core Domain Model

## Purpose

This document defines the v1 relational model for FitForge before implementation in Drizzle. It is intentionally normalized enough for a multi-user SaaS while avoiding speculative tables that do not serve the first release.

## Design principles

1. Every user-owned row carries a `user_id` directly or is reachable through a parent that does.
2. Shared catalogue data such as foods, recipes, exercises, muscle groups and equipment is separate from user plans and logs.
3. Content licensing is first-class data, not a note hidden in source code.
4. Historical logs are append-oriented. Plans can change without rewriting completed sessions.
5. Recommendations in v1 are deterministic and rule-based. AI-generated suggestions arrive later.
6. UUID primary keys are used throughout application-owned tables.
7. Dates representing a local calendar day use `date`; events use timezone-aware timestamps.
8. Soft deletion is used only where recovery or audit value justifies it.

## Domains

### Identity and onboarding

#### users
Authentication identity managed with Better Auth.

Core fields:
- `id uuid primary key`
- `name text`
- `email text unique not null`
- `email_verified boolean not null default false`
- `image text null`
- `role user_role not null default 'user'`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Better Auth will also require its standard session, account and verification tables. These tables remain authentication infrastructure and are not duplicated by the fitness profile.

#### profiles
One fitness profile per user.

Core fields:
- `id uuid primary key`
- `user_id uuid unique not null references users(id) on delete cascade`
- `date_of_birth date null`
- `sex biological_sex null`
- `height_cm numeric(5,2) null`
- `timezone text not null default 'Africa/Johannesburg'`
- `preferred_unit_system unit_system not null default 'metric'`
- `preferred_workout_time time null`
- `onboarding_completed_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### user_goals
Keeps goal history rather than overwriting one profile field.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `goal_type fitness_goal not null`
- `target_weight_kg numeric(5,2) null`
- `target_date date null`
- `is_primary boolean not null default false`
- `starts_on date not null`
- `ends_on date null`
- `created_at timestamptz not null`

Constraint: one active primary goal per user, enforced with a partial unique index.

#### user_targets
Versioned daily targets derived from onboarding or adjusted manually.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `effective_from date not null`
- `effective_to date null`
- `calorie_target_kcal integer null`
- `protein_target_min_g integer not null`
- `protein_target_max_g integer not null`
- `water_target_ml integer not null`
- `step_target integer not null`
- `creatine_target_g numeric(4,1) null`
- `workout_days_per_week integer not null`
- `created_at timestamptz not null`

#### dietary_preferences
Reference values such as omnivore, vegetarian, vegan, halal, lactose-free and gluten-free.

#### user_dietary_preferences
Many-to-many link between users and dietary preferences.

#### allergens
Reference catalogue.

#### user_allergens
Stores allergies and intolerances with severity and notes.

#### equipment
Shared exercise-equipment catalogue.

#### user_equipment
Equipment available to a user, optionally including quantity and maximum weight.

---

### Media and licensing

#### media_assets
One ledger for food photos, recipe photos, exercise illustrations and external video references.

Core fields:
- `id uuid primary key`
- `media_type media_type not null`
- `storage_provider media_provider not null`
- `url text not null`
- `thumbnail_url text null`
- `source_url text null`
- `creator_name text null`
- `creator_url text null`
- `license_name text null`
- `license_url text null`
- `attribution_text text null`
- `external_id text null`
- `is_approved boolean not null default false`
- `last_verified_at timestamptz null`
- `created_at timestamptz not null`

Indexes:
- unique `(storage_provider, external_id)` when external_id is present
- index on `(media_type, is_approved)`

---

### Nutrition catalogue

#### food_categories
Examples: protein, grains, vegetables, fruit, dairy, pantry, snacks.

#### foods
Canonical ingredient and food catalogue.

Core fields:
- `id uuid primary key`
- `category_id uuid null references food_categories(id)`
- `name text not null`
- `slug text unique not null`
- `description text null`
- `default_serving_quantity numeric(8,2) not null`
- `default_serving_unit serving_unit not null`
- `calories_kcal numeric(8,2) not null`
- `protein_g numeric(8,2) not null`
- `carbohydrate_g numeric(8,2) not null`
- `fat_g numeric(8,2) not null`
- `fibre_g numeric(8,2) null`
- `sodium_mg numeric(8,2) null`
- `is_active boolean not null default true`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Nutrition values are expressed per default serving. A future branded-food table can add barcode and manufacturer data without changing recipes.

#### food_allergens
Many-to-many catalogue link.

#### recipes
Shared and user-created recipes.

Core fields:
- `id uuid primary key`
- `owner_user_id uuid null references users(id) on delete set null`
- `name text not null`
- `slug text unique not null`
- `description text null`
- `meal_type meal_type not null`
- `difficulty recipe_difficulty not null`
- `prep_minutes integer not null default 0`
- `cook_minutes integer not null default 0`
- `servings numeric(6,2) not null default 1`
- `calories_kcal numeric(8,2) null`
- `protein_g numeric(8,2) null`
- `carbohydrate_g numeric(8,2) null`
- `fat_g numeric(8,2) null`
- `fibre_g numeric(8,2) null`
- `is_public boolean not null default false`
- `is_featured boolean not null default false`
- `status content_status not null default 'draft'`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Shared seed recipes have `owner_user_id = null`. User-created recipes are private by default.

#### recipe_ingredients
Ordered ingredient lines.

Core fields:
- `id uuid primary key`
- `recipe_id uuid not null references recipes(id) on delete cascade`
- `food_id uuid not null references foods(id)`
- `quantity numeric(8,2) not null`
- `unit serving_unit not null`
- `preparation_note text null`
- `sort_order integer not null`

Unique: `(recipe_id, sort_order)`.

#### recipe_steps
Ordered preparation instructions.

#### recipe_media
Links recipes to media assets with role `cover`, `gallery` or `video`.

#### recipe_tags
Reference tags such as high-protein, budget-friendly, post-workout, quick and high-fibre.

#### recipe_tag_links
Many-to-many link.

#### recipe_dietary_preferences
Many-to-many compatibility link.

---

### Meal planning and nutrition tracking

#### meal_plans
A plan belongs to a user and spans a date range.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `name text not null`
- `starts_on date not null`
- `ends_on date not null`
- `status plan_status not null default 'draft'`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### meal_plan_entries
One planned meal slot.

Core fields:
- `id uuid primary key`
- `meal_plan_id uuid not null references meal_plans(id) on delete cascade`
- `planned_date date not null`
- `meal_type meal_type not null`
- `recipe_id uuid null references recipes(id)`
- `custom_name text null`
- `servings numeric(6,2) not null default 1`
- `sort_order integer not null default 0`

Constraint: recipe_id or custom_name must be present.

#### meal_logs
Actual consumed meal records, independent of future plan edits.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `meal_plan_entry_id uuid null references meal_plan_entries(id) on delete set null`
- `recipe_id uuid null references recipes(id) on delete set null`
- `logged_at timestamptz not null`
- `meal_type meal_type not null`
- `name_snapshot text not null`
- `servings numeric(6,2) not null default 1`
- `calories_kcal numeric(8,2) null`
- `protein_g numeric(8,2) null`
- `carbohydrate_g numeric(8,2) null`
- `fat_g numeric(8,2) null`
- `notes text null`

Nutrition is snapshotted so historical totals remain stable if a recipe changes.

#### shopping_lists
Generated or manually created lists tied optionally to a meal plan.

#### shopping_list_items
Supports food-linked and free-text items, quantity, unit, category and checked state.

---

### Exercise catalogue

#### muscle_groups
Hierarchical catalogue with optional parent group.

#### exercise_categories
Examples: strength, mobility, core, cardio and recovery.

#### exercises
Shared exercise catalogue.

Core fields:
- `id uuid primary key`
- `category_id uuid not null references exercise_categories(id)`
- `name text not null`
- `slug text unique not null`
- `description text null`
- `instructions text not null`
- `common_mistakes text null`
- `difficulty exercise_difficulty not null`
- `movement_pattern movement_pattern null`
- `is_unilateral boolean not null default false`
- `is_active boolean not null default true`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### exercise_muscle_groups
Many-to-many with `role` primary or secondary.

#### exercise_equipment
Many-to-many link.

#### exercise_media
Links approved illustration and video assets.

---

### Workout planning and execution

#### workout_plans
User-owned reusable programme.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `name text not null`
- `description text null`
- `goal_type fitness_goal null`
- `days_per_week integer not null`
- `status plan_status not null default 'draft'`
- `starts_on date null`
- `ends_on date null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### workout_days
Ordered days within a plan. `day_number` is sequence-based rather than tied to Monday, allowing missed sessions to roll forward.

Core fields:
- `id uuid primary key`
- `workout_plan_id uuid not null references workout_plans(id) on delete cascade`
- `day_number integer not null`
- `name text not null`
- `description text null`
- `estimated_minutes integer null`

Unique `(workout_plan_id, day_number)`.

#### workout_day_exercises
Ordered exercise prescription.

Core fields:
- `id uuid primary key`
- `workout_day_id uuid not null references workout_days(id) on delete cascade`
- `exercise_id uuid not null references exercises(id)`
- `sort_order integer not null`
- `target_sets integer not null`
- `target_reps_min integer null`
- `target_reps_max integer null`
- `target_duration_seconds integer null`
- `rest_seconds integer null`
- `tempo text null`
- `notes text null`

#### workout_sessions
Historical execution record.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `workout_plan_id uuid null references workout_plans(id) on delete set null`
- `workout_day_id uuid null references workout_days(id) on delete set null`
- `name_snapshot text not null`
- `started_at timestamptz not null`
- `completed_at timestamptz null`
- `status workout_session_status not null`
- `notes text null`

#### workout_session_exercises
Snapshot of exercises performed in a session.

#### exercise_sets
One logged set.

Core fields:
- `id uuid primary key`
- `session_exercise_id uuid not null references workout_session_exercises(id) on delete cascade`
- `set_number integer not null`
- `set_type set_type not null default 'working'`
- `repetitions integer null`
- `weight_kg numeric(7,2) null`
- `duration_seconds integer null`
- `distance_metres numeric(9,2) null`
- `rpe numeric(3,1) null`
- `completed boolean not null default true`

Unique `(session_exercise_id, set_number)`.

---

### Progress and daily habits

#### body_measurements
Append-only measurements.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `measured_at timestamptz not null`
- `weight_kg numeric(5,2) null`
- `waist_cm numeric(5,2) null`
- `chest_cm numeric(5,2) null`
- `left_arm_cm numeric(5,2) null`
- `right_arm_cm numeric(5,2) null`
- `body_fat_percentage numeric(5,2) null`
- `source measurement_source not null default 'manual'`
- `notes text null`

Index `(user_id, measured_at desc)`.

#### progress_photos
Private user media with pose and capture date. The media asset record must use private storage, never a public stock-media provider.

#### daily_habit_logs
One row per user and local date.

Core fields:
- `id uuid primary key`
- `user_id uuid not null references users(id) on delete cascade`
- `log_date date not null`
- `water_ml integer not null default 0`
- `steps integer not null default 0`
- `creatine_g numeric(4,1) not null default 0`
- `sleep_minutes integer null`
- `active_energy_kcal integer null`
- `notes text null`
- `source measurement_source not null default 'manual'`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Unique `(user_id, log_date)`.

#### personal_records
Stores notable achievements such as maximum push-ups or best lift while remaining derivable from session data.

---

### Future health integrations

These tables are excluded from the first migration but the identifiers and source fields above prepare for them.

#### integration_connections
Provider, encrypted token reference, scopes, status and sync cursor.

#### health_sync_jobs
Provider sync audit with time window, status, counts and errors.

#### external_health_records
Optional deduplication ledger keyed by provider and external record ID.

Apple Health generally requires a native application to read HealthKit data. Samsung Health and Android integrations may flow through supported mobile APIs or Health Connect. The web application should therefore remain provider-neutral and accept normalized data from a future companion app or integration service.

## Enums

- `user_role`: user, admin
- `biological_sex`: female, male, intersex, prefer_not_to_say
- `unit_system`: metric, imperial
- `fitness_goal`: body_recomposition, fat_loss, muscle_gain, general_fitness, strength, endurance
- `meal_type`: breakfast, snack, lunch, pre_workout, post_workout, dinner
- `serving_unit`: g, kg, ml, l, tsp, tbsp, cup, item, slice, scoop, serving
- `recipe_difficulty`: easy, moderate, advanced
- `content_status`: draft, published, archived
- `plan_status`: draft, active, completed, archived
- `exercise_difficulty`: beginner, intermediate, advanced
- `movement_pattern`: push, pull, squat, hinge, lunge, carry, rotation, anti_rotation, locomotion
- `muscle_role`: primary, secondary
- `workout_session_status`: planned, in_progress, completed, skipped, cancelled
- `set_type`: warmup, working, drop, failure, cooldown
- `media_type`: food_photo, recipe_photo, exercise_illustration, exercise_video, progress_photo
- `media_provider`: local, vercel_blob, cloudinary, unsplash, pexels, wikimedia, youtube
- `measurement_source`: manual, apple_health, samsung_health, health_connect, imported

## Critical indexes and constraints

1. Every user-owned list query needs an index beginning with `user_id`.
2. Slugs are unique for public catalogue entities.
3. Ordered child tables use unique parent-plus-order constraints.
4. Meal and workout historical records snapshot names and numeric values.
5. Public recipe queries index `(status, is_public, is_featured)`.
6. Active plans index `(user_id, status)`.
7. Daily logs enforce one record per user and date.
8. User content is never fetched by identifier alone; queries include the authenticated `user_id`.

## V1 migration boundary

Migration 0001 should include:
- Better Auth tables
- profiles, user_goals, user_targets
- dietary preferences, allergens and equipment links
- media_assets
- foods and recipe catalogue
- meal plans and meal logs
- exercise catalogue
- workout plans and workout sessions
- body measurements and daily habit logs

Deferred until later:
- coach/client relationships
- subscriptions and billing
- social/community features
- wearable integration tables
- barcode-branded food catalogue
- AI generation audit tables
