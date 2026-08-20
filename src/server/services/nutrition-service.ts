export type NutritionTargetInput = {
  weightKg: number;
  goalType: string | null;
};

export type NutritionTargets = {
  caloriesKcal: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
};

export function calculateNutritionTargets({
  weightKg,
  goalType,
}: NutritionTargetInput): NutritionTargets {
  const maintenanceCalories = weightKg * 30;

  let calorieMultiplier = 1;

  switch (goalType) {
    case "fat_loss":
      calorieMultiplier = 0.85;
      break;
    case "muscle_gain":
      calorieMultiplier = 1.1;
      break;
    default:
      calorieMultiplier = 1;
  }

  const caloriesKcal = Math.round(maintenanceCalories * calorieMultiplier);

  const proteinG = Math.round(weightKg * 1.8);
  const fatG = Math.round(weightKg * 0.8);

  const proteinCalories = proteinG * 4;
  const fatCalories = fatG * 9;

  const carbohydrateG = Math.max(
    0,
    Math.round((caloriesKcal - proteinCalories - fatCalories) / 4),
  );

  return {
    caloriesKcal,
    proteinG,
    carbohydrateG,
    fatG,
  };
}

import { and, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { mealLogs } from "@/db/schema";

export async function getDailyNutritionSummary(
  userId: string,
  date = new Date(),
) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const logs = await db
    .select({
      id: mealLogs.id,
      mealType: mealLogs.mealType,
      name: mealLogs.nameSnapshot,
      servings: mealLogs.servings,
      caloriesKcal: mealLogs.caloriesKcal,
      proteinG: mealLogs.proteinG,
      carbohydrateG: mealLogs.carbohydrateG,
      fatG: mealLogs.fatG,
      loggedAt: mealLogs.loggedAt,
    })
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, start),
        lt(mealLogs.loggedAt, end),
      ),
    );

  const numberValue = (value: string | null) =>
    value === null ? 0 : Number(value);

  const totals = logs.reduce(
    (total, log) => ({
      caloriesKcal: total.caloriesKcal + numberValue(log.caloriesKcal),
      proteinG: total.proteinG + numberValue(log.proteinG),
      carbohydrateG: total.carbohydrateG + numberValue(log.carbohydrateG),
      fatG: total.fatG + numberValue(log.fatG),
    }),
    {
      caloriesKcal: 0,
      proteinG: 0,
      carbohydrateG: 0,
      fatG: 0,
    },
  );

  return {
    logs,
    totals: {
      caloriesKcal: Math.round(totals.caloriesKcal),
      proteinG: Math.round(totals.proteinG),
      carbohydrateG: Math.round(totals.carbohydrateG),
      fatG: Math.round(totals.fatG),
    },
  };
}
