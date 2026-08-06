CREATE TYPE "public"."allergy_severity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."biological_sex" AS ENUM('female', 'male', 'intersex', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."exercise_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal" AS ENUM('body_recomposition', 'fat_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'snack', 'lunch', 'pre_workout', 'post_workout', 'dinner');--> statement-breakpoint
CREATE TYPE "public"."measurement_source" AS ENUM('manual', 'apple_health', 'samsung_health', 'health_connect', 'import');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('vercel_blob', 'cloudinary', 'unsplash', 'pexels', 'wikimedia', 'youtube', 'external');--> statement-breakpoint
CREATE TYPE "public"."media_role" AS ENUM('cover', 'gallery', 'video');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('food_photo', 'recipe_photo', 'exercise_illustration', 'exercise_video', 'progress_photo');--> statement-breakpoint
CREATE TYPE "public"."movement_pattern" AS ENUM('push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'anti_rotation', 'locomotion', 'isolation');--> statement-breakpoint
CREATE TYPE "public"."muscle_role" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."photo_pose" AS ENUM('front', 'side', 'back', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."recipe_difficulty" AS ENUM('easy', 'moderate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."serving_unit" AS ENUM('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'item', 'slice', 'scoop', 'serving');--> statement-breakpoint
CREATE TYPE "public"."set_type" AS ENUM('warmup', 'working', 'drop', 'failure');--> statement-breakpoint
CREATE TYPE "public"."unit_system" AS ENUM('metric', 'imperial');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."workout_session_status" AS ENUM('planned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_type" "media_type" NOT NULL,
	"storage_provider" "media_provider" NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"source_url" text,
	"creator_name" text,
	"creator_url" text,
	"license_name" text,
	"license_url" text,
	"attribution_text" text,
	"external_id" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_allergens" (
	"food_id" uuid NOT NULL,
	"allergen_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "food_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"default_serving_quantity" numeric(8, 2) NOT NULL,
	"default_serving_unit" "serving_unit" NOT NULL,
	"calories_kcal" numeric(8, 2) NOT NULL,
	"protein_g" numeric(8, 2) NOT NULL,
	"carbohydrate_g" numeric(8, 2) NOT NULL,
	"fat_g" numeric(8, 2) NOT NULL,
	"fibre_g" numeric(8, 2),
	"sodium_mg" numeric(8, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "meal_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_plan_entry_id" uuid,
	"recipe_id" uuid,
	"logged_at" timestamp with time zone NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"name_snapshot" text NOT NULL,
	"servings" numeric(6, 2) DEFAULT '1' NOT NULL,
	"calories_kcal" numeric(8, 2),
	"protein_g" numeric(8, 2),
	"carbohydrate_g" numeric(8, 2),
	"fat_g" numeric(8, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "meal_plan_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"planned_date" date NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"recipe_id" uuid,
	"custom_name" text,
	"servings" numeric(6, 2) DEFAULT '1' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "meal_plan_entry_content_check" CHECK ("meal_plan_entries"."recipe_id" is not null or "meal_plan_entries"."custom_name" is not null)
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"status" "plan_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_dietary_preferences" (
	"recipe_id" uuid NOT NULL,
	"dietary_preference_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"quantity" numeric(8, 2) NOT NULL,
	"unit" "serving_unit" NOT NULL,
	"preparation_note" text,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_media" (
	"recipe_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"role" "media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"instruction" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_tag_links" (
	"recipe_id" uuid NOT NULL,
	"recipe_tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "recipe_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"meal_type" "meal_type" NOT NULL,
	"difficulty" "recipe_difficulty" NOT NULL,
	"prep_minutes" integer DEFAULT 0 NOT NULL,
	"cook_minutes" integer DEFAULT 0 NOT NULL,
	"servings" numeric(6, 2) DEFAULT '1' NOT NULL,
	"calories_kcal" numeric(8, 2),
	"protein_g" numeric(8, 2),
	"carbohydrate_g" numeric(8, 2),
	"fat_g" numeric(8, 2),
	"fibre_g" numeric(8, 2),
	"is_public" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "allergens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "allergens_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dietary_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "dietary_preferences_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "equipment_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date_of_birth" date,
	"sex" "biological_sex",
	"height_cm" numeric(5, 2),
	"timezone" text DEFAULT 'Africa/Johannesburg' NOT NULL,
	"preferred_unit_system" "unit_system" DEFAULT 'metric' NOT NULL,
	"preferred_workout_time" time,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_allergens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"allergen_id" uuid NOT NULL,
	"severity" "allergy_severity" DEFAULT 'mild' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_dietary_preferences" (
	"user_id" uuid NOT NULL,
	"dietary_preference_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"maximum_weight_kg" numeric(7, 2)
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_type" "fitness_goal" NOT NULL,
	"target_weight_kg" numeric(5, 2),
	"target_date" date,
	"is_primary" boolean DEFAULT false NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"calorie_target_kcal" integer,
	"protein_target_min_g" integer NOT NULL,
	"protein_target_max_g" integer NOT NULL,
	"water_target_ml" integer NOT NULL,
	"step_target" integer NOT NULL,
	"creatine_target_g" numeric(4, 1),
	"workout_days_per_week" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"weight_kg" numeric(5, 2),
	"waist_cm" numeric(5, 2),
	"chest_cm" numeric(5, 2),
	"left_arm_cm" numeric(5, 2),
	"right_arm_cm" numeric(5, 2),
	"body_fat_percentage" numeric(5, 2),
	"source" "measurement_source" DEFAULT 'manual' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "daily_habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"water_ml" integer DEFAULT 0 NOT NULL,
	"steps" integer DEFAULT 0 NOT NULL,
	"creatine_g" numeric(4, 1) DEFAULT '0' NOT NULL,
	"sleep_minutes" integer,
	"active_energy_kcal" integer,
	"notes" text,
	"source" "measurement_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"record_type" text NOT NULL,
	"label" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"achieved_at" timestamp with time zone NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "progress_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"pose" "photo_pose" NOT NULL,
	"captured_on" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "exercise_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exercise_equipment" (
	"exercise_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_media" (
	"exercise_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"role" "media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_muscle_groups" (
	"exercise_id" uuid NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"role" "muscle_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"set_type" "set_type" DEFAULT 'working' NOT NULL,
	"repetitions" integer,
	"weight_kg" numeric(7, 2),
	"duration_seconds" integer,
	"distance_metres" numeric(9, 2),
	"rpe" numeric(3, 1),
	"completed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"instructions" text NOT NULL,
	"common_mistakes" text,
	"difficulty" "exercise_difficulty" NOT NULL,
	"movement_pattern" "movement_pattern",
	"is_unilateral" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "muscle_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "muscle_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "workout_day_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"target_sets" integer NOT NULL,
	"target_reps_min" integer,
	"target_reps_max" integer,
	"target_duration_seconds" integer,
	"rest_seconds" integer,
	"tempo" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"estimated_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"goal_type" "fitness_goal",
	"days_per_week" integer NOT NULL,
	"status" "plan_status" DEFAULT 'draft' NOT NULL,
	"starts_on" timestamp with time zone,
	"ends_on" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_session_id" uuid NOT NULL,
	"exercise_id" uuid,
	"name_snapshot" text NOT NULL,
	"sort_order" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_plan_id" uuid,
	"workout_day_id" uuid,
	"name_snapshot" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"status" "workout_session_status" NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_allergens" ADD CONSTRAINT "food_allergens_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_allergens" ADD CONSTRAINT "food_allergens_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_category_id_food_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."food_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_meal_plan_entry_id_meal_plan_entries_id_fk" FOREIGN KEY ("meal_plan_entry_id") REFERENCES "public"."meal_plan_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_dietary_preferences" ADD CONSTRAINT "recipe_dietary_preferences_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_dietary_preferences" ADD CONSTRAINT "recipe_dietary_preferences_dietary_preference_id_dietary_preferences_id_fk" FOREIGN KEY ("dietary_preference_id") REFERENCES "public"."dietary_preferences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_media" ADD CONSTRAINT "recipe_media_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_media" ADD CONSTRAINT "recipe_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tag_links" ADD CONSTRAINT "recipe_tag_links_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tag_links" ADD CONSTRAINT "recipe_tag_links_recipe_tag_id_recipe_tags_id_fk" FOREIGN KEY ("recipe_tag_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_allergens" ADD CONSTRAINT "user_allergens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_allergens" ADD CONSTRAINT "user_allergens_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dietary_preferences" ADD CONSTRAINT "user_dietary_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dietary_preferences" ADD CONSTRAINT "user_dietary_preferences_dietary_preference_id_dietary_preferences_id_fk" FOREIGN KEY ("dietary_preference_id") REFERENCES "public"."dietary_preferences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_equipment" ADD CONSTRAINT "user_equipment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_equipment" ADD CONSTRAINT "user_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_targets" ADD CONSTRAINT "user_targets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_habit_logs" ADD CONSTRAINT "daily_habit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_media" ADD CONSTRAINT "exercise_media_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_media" ADD CONSTRAINT "exercise_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscle_groups" ADD CONSTRAINT "exercise_muscle_groups_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscle_groups" ADD CONSTRAINT "exercise_muscle_groups_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_session_exercise_id_workout_session_exercises_id_fk" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."workout_session_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_category_id_exercise_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."exercise_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_unique" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_provider_external_unique" ON "media_assets" USING btree ("storage_provider","external_id");--> statement-breakpoint
CREATE INDEX "media_assets_type_approved_idx" ON "media_assets" USING btree ("media_type","is_approved");--> statement-breakpoint
CREATE UNIQUE INDEX "food_allergens_unique" ON "food_allergens" USING btree ("food_id","allergen_id");--> statement-breakpoint
CREATE INDEX "foods_category_active_idx" ON "foods" USING btree ("category_id","is_active");--> statement-breakpoint
CREATE INDEX "meal_logs_user_time_idx" ON "meal_logs" USING btree ("user_id","logged_at");--> statement-breakpoint
CREATE INDEX "meal_plan_entries_day_idx" ON "meal_plan_entries" USING btree ("meal_plan_id","planned_date");--> statement-breakpoint
CREATE INDEX "meal_plans_user_dates_idx" ON "meal_plans" USING btree ("user_id","starts_on","ends_on");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_dietary_preferences_unique" ON "recipe_dietary_preferences" USING btree ("recipe_id","dietary_preference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_ingredients_order_unique" ON "recipe_ingredients" USING btree ("recipe_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_media_unique" ON "recipe_media" USING btree ("recipe_id","media_asset_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_steps_order_unique" ON "recipe_steps" USING btree ("recipe_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_tag_links_unique" ON "recipe_tag_links" USING btree ("recipe_id","recipe_tag_id");--> statement-breakpoint
CREATE INDEX "recipes_discovery_idx" ON "recipes" USING btree ("status","is_public","meal_type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_allergens_unique" ON "user_allergens" USING btree ("user_id","allergen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_dietary_preferences_unique" ON "user_dietary_preferences" USING btree ("user_id","dietary_preference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_equipment_unique" ON "user_equipment" USING btree ("user_id","equipment_id");--> statement-breakpoint
CREATE INDEX "user_goals_user_id_idx" ON "user_goals" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_goals_active_primary_unique" ON "user_goals" USING btree ("user_id") WHERE "user_goals"."is_primary" = true and "user_goals"."ends_on" is null;--> statement-breakpoint
CREATE INDEX "user_targets_user_effective_idx" ON "user_targets" USING btree ("user_id","effective_from");--> statement-breakpoint
CREATE INDEX "body_measurements_user_time_idx" ON "body_measurements" USING btree ("user_id","measured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_habit_logs_user_date_unique" ON "daily_habit_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "daily_habit_logs_user_date_idx" ON "daily_habit_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "personal_records_user_type_idx" ON "personal_records" USING btree ("user_id","record_type");--> statement-breakpoint
CREATE INDEX "progress_photos_user_date_idx" ON "progress_photos" USING btree ("user_id","captured_on");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_equipment_unique" ON "exercise_equipment" USING btree ("exercise_id","equipment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_media_unique" ON "exercise_media" USING btree ("exercise_id","media_asset_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_muscle_groups_unique" ON "exercise_muscle_groups" USING btree ("exercise_id","muscle_group_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_sets_number_unique" ON "exercise_sets" USING btree ("session_exercise_id","set_number");--> statement-breakpoint
CREATE INDEX "exercises_category_active_idx" ON "exercises" USING btree ("category_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_day_exercises_order_unique" ON "workout_day_exercises" USING btree ("workout_day_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_days_plan_day_unique" ON "workout_days" USING btree ("workout_plan_id","day_number");--> statement-breakpoint
CREATE INDEX "workout_plans_user_status_idx" ON "workout_plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_session_exercises_order_unique" ON "workout_session_exercises" USING btree ("workout_session_id","sort_order");--> statement-breakpoint
CREATE INDEX "workout_sessions_user_started_idx" ON "workout_sessions" USING btree ("user_id","started_at");