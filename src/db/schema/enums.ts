import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const biologicalSexEnum = pgEnum("biological_sex", [
  "female",
  "male",
  "intersex",
  "prefer_not_to_say",
]);
export const unitSystemEnum = pgEnum("unit_system", ["metric", "imperial"]);
export const fitnessGoalEnum = pgEnum("fitness_goal", [
  "body_recomposition",
  "fat_loss",
  "muscle_gain",
  "general_fitness",
  "strength",
  "endurance",
]);
export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "snack",
  "lunch",
  "pre_workout",
  "post_workout",
  "dinner",
]);
export const servingUnitEnum = pgEnum("serving_unit", [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "item",
  "slice",
  "scoop",
  "serving",
]);
export const recipeDifficultyEnum = pgEnum("recipe_difficulty", [
  "easy",
  "moderate",
  "advanced",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);
export const planStatusEnum = pgEnum("plan_status", [
  "draft",
  "active",
  "completed",
  "archived",
]);
export const exerciseDifficultyEnum = pgEnum("exercise_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const movementPatternEnum = pgEnum("movement_pattern", [
  "push",
  "pull",
  "squat",
  "hinge",
  "lunge",
  "carry",
  "rotation",
  "anti_rotation",
  "locomotion",
  "isolation",
]);
export const muscleRoleEnum = pgEnum("muscle_role", ["primary", "secondary"]);
export const workoutSessionStatusEnum = pgEnum("workout_session_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);
export const setTypeEnum = pgEnum("set_type", [
  "warmup",
  "working",
  "drop",
  "failure",
]);
export const measurementSourceEnum = pgEnum("measurement_source", [
  "manual",
  "apple_health",
  "samsung_health",
  "health_connect",
  "import",
]);
export const mediaTypeEnum = pgEnum("media_type", [
  "food_photo",
  "recipe_photo",
  "exercise_illustration",
  "exercise_video",
  "progress_photo",
]);
export const mediaProviderEnum = pgEnum("media_provider", [
  "vercel_blob",
  "cloudinary",
  "unsplash",
  "pexels",
  "wikimedia",
  "youtube",
  "external",
]);
export const mediaRoleEnum = pgEnum("media_role", [
  "cover",
  "gallery",
  "video",
]);
export const allergySeverityEnum = pgEnum("allergy_severity", [
  "mild",
  "moderate",
  "severe",
]);
export const photoPoseEnum = pgEnum("photo_pose", [
  "front",
  "side",
  "back",
  "other",
]);
