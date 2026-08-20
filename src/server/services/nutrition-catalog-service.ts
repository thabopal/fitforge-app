import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { foodCategories, foods } from "@/db/schema";
import { starterFoods } from "@/lib/nutrition-catalog";

export async function ensureStarterFoodCatalog() {
  const categories = Array.from(
    new Map(
      starterFoods.map((food) => [food.category, food.categoryLabel]),
    ).entries(),
  );

  await db
    .insert(foodCategories)
    .values(
      categories.map(([slug, name]) => ({
        slug,
        name,
      })),
    )
    .onConflictDoNothing();

  const categoryRows = await db
    .select({
      id: foodCategories.id,
      slug: foodCategories.slug,
    })
    .from(foodCategories)
    .where(
      inArray(
        foodCategories.slug,
        categories.map(([slug]) => slug),
      ),
    );

  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  await db
    .insert(foods)
    .values(
      starterFoods.map((food) => ({
        categoryId: categoryIds.get(food.category),
        name: food.name,
        slug: food.slug,
        defaultServingQuantity: food.servingQuantity,
        defaultServingUnit: food.servingUnit,
        caloriesKcal: food.caloriesKcal,
        proteinG: food.proteinG,
        carbohydrateG: food.carbohydrateG,
        fatG: food.fatG,
      })),
    )
    .onConflictDoNothing();
}
