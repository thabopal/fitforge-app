import { config } from "dotenv";

config({ path: ".env.local" });

async function seed() {
  const { ensureStarterFoodCatalog } = await import(
    "@/server/services/nutrition-catalog-service"
  );

  const { ensureStarterExerciseCatalog } = await import(
    "@/server/services/workout-plan-service"
  );

  console.log("Seeding FitForge...");

  await ensureStarterExerciseCatalog();
  await ensureStarterFoodCatalog();

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
