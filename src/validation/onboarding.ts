import { z } from "zod";

export const fitnessGoals = [
  { value: "body_recomposition", label: "Body recomposition" },
  { value: "fat_loss", label: "Fat loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "general_fitness", label: "General fitness" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
] as const;

export const dietaryOptions = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "lactose-free", label: "Lactose-free" },
  { value: "gluten-free", label: "Gluten-free" },
] as const;

export const equipmentOptions = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "resistance-bands", label: "Resistance bands" },
  { value: "bench", label: "Bench" },
  { value: "pull-up-bar", label: "Pull-up bar" },
  { value: "stationary-bike", label: "Stationary bike" },
] as const;

const goalValues = fitnessGoals.map((goal) => goal.value) as [
  (typeof fitnessGoals)[number]["value"],
  ...(typeof fitnessGoals)[number]["value"][],
];

const dietaryValues = dietaryOptions.map((option) => option.value) as [
  (typeof dietaryOptions)[number]["value"],
  ...(typeof dietaryOptions)[number]["value"][],
];

const equipmentValues = equipmentOptions.map((option) => option.value) as [
  (typeof equipmentOptions)[number]["value"],
  ...(typeof equipmentOptions)[number]["value"][],
];

export const onboardingSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  heightCm: z.coerce.number().min(100).max(250),
  currentWeightKg: z.coerce.number().min(25).max(350),
  targetWeightKg: z.coerce.number().min(25).max(350).optional(),
  goalType: z.enum(goalValues),
  workoutDaysPerWeek: z.coerce.number().int().min(1).max(7),
  dietaryPreferences: z.array(z.enum(dietaryValues)).default([]),
  equipment: z.array(z.enum(equipmentValues)).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
