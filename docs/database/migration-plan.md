# FitForge Migration Plan

## Migration policy

- Development may use `drizzle-kit push` only during disposable early exploration.
- Once the first schema is approved, all shared environments use generated, committed SQL migrations.
- Applied migrations are immutable. Corrections are new migrations.
- Production migration execution is a distinct deployment step, not an accidental side effect of page rendering.
- Database changes and application changes must remain backward-compatible during deployment where practical.

## Migration sequence

### 0001_auth_and_profile

- Better Auth core tables
- users role extension if required by the selected Better Auth schema
- profiles
- user_goals
- user_targets
- dietary_preferences
- user_dietary_preferences
- allergens
- user_allergens
- equipment
- user_equipment

### 0002_media_and_nutrition_catalogue

- media_assets
- food_categories
- foods
- food_allergens
- recipe_tags
- recipes
- recipe_ingredients
- recipe_steps
- recipe_media
- recipe_tag_links
- recipe_dietary_preferences

### 0003_meal_planning_and_logs

- meal_plans
- meal_plan_entries
- meal_logs
- shopping_lists
- shopping_list_items

### 0004_exercise_catalogue

- muscle_groups
- exercise_categories
- exercises
- exercise_muscle_groups
- exercise_equipment
- exercise_media

### 0005_workout_planning_and_sessions

- workout_plans
- workout_days
- workout_day_exercises
- workout_sessions
- workout_session_exercises
- exercise_sets

### 0006_progress_tracking

- body_measurements
- progress_photos
- daily_habit_logs
- personal_records

## Implementation order

1. Translate each domain into separate Drizzle schema modules.
2. Export all tables and relations through `src/db/schema/index.ts`.
3. Generate SQL and inspect every foreign key, enum, index and delete rule.
4. Apply migrations to a fresh Neon development branch.
5. Run catalogue seed and validation.
6. Run application typecheck, Biome and production build.
7. Test a clean database from zero through all migrations.

## Schema module layout

```text
src/db/schema/
├── auth.ts
├── profile.ts
├── media.ts
├── nutrition.ts
├── meal-planning.ts
├── exercise.ts
├── workout.ts
├── progress.ts
├── enums.ts
├── relations.ts
└── index.ts
```

## Rollback strategy

Drizzle migrations move forward by default. Before destructive production changes:

1. Take or confirm a Neon restore point or branch.
2. Deploy additive schema first.
3. Backfill data with a controlled script.
4. Deploy application code that reads the new shape.
5. Remove obsolete columns only in a later release.

Emergency rollback should normally restore application code while keeping additive database changes. Destructive rollback SQL is used only when tested and necessary.

## Environment separation

- Local: developer `.env.local`, development Neon branch.
- GitHub Actions: isolated test database or migration-only ephemeral branch.
- Vercel Preview: preview Neon branch, never production data.
- Vercel Production: production Neon branch with protected credentials.

## Definition of done for the first database PR

- all six migration groups generated or intentionally staged
- no use of `process.env.DATABASE_URL!` outside validated configuration
- migrations apply to an empty database
- catalogue seeds are idempotent
- demo seed is blocked in production
- critical indexes and ownership constraints exist
- Biome, typecheck and build pass
- schema decisions and deliberate deferrals are documented
