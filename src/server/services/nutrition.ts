"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { foods, mealLogs } from "@/db/schema";
import { auth } from "@/server/auth";

export async function logFood(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const foodId = String(formData.get("foodId") ?? "");
  const mealType = String(formData.get("mealType") ?? "");
  const servings = Number(formData.get("servings") ?? 1);

  if (!foodId || !mealType || !Number.isFinite(servings) || servings <= 0) {
    throw new Error("Invalid meal entry");
  }

  const allowedMealTypes = [
    "breakfast",
    "snack",
    "lunch",
    "pre_workout",
    "post_workout",
    "dinner",
  ] as const;

  if (
    !allowedMealTypes.includes(mealType as (typeof allowedMealTypes)[number])
  ) {
    throw new Error("Invalid meal type");
  }

  const [food] = await db
    .select({
      id: foods.id,
      name: foods.name,
      caloriesKcal: foods.caloriesKcal,
      proteinG: foods.proteinG,
      carbohydrateG: foods.carbohydrateG,
      fatG: foods.fatG,
    })
    .from(foods)
    .where(and(eq(foods.id, foodId), eq(foods.isActive, true)))
    .limit(1);

  if (!food) {
    throw new Error("Food not found");
  }

  const multiply = (value: string) => (Number(value) * servings).toFixed(2);

  await db.insert(mealLogs).values({
    userId: session.user.id,
    loggedAt: new Date(),
    mealType: mealType as (typeof allowedMealTypes)[number],
    nameSnapshot: food.name,
    servings: servings.toFixed(2),
    caloriesKcal: multiply(food.caloriesKcal),
    proteinG: multiply(food.proteinG),
    carbohydrateG: multiply(food.carbohydrateG),
    fatG: multiply(food.fatG),
  });

  redirect("/nutrition");
}
