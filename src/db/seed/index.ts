import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { ensureStarterExerciseCatalog } = await import(
    "@/server/services/workout-plan-service"
  );

  await ensureStarterExerciseCatalog();
  console.log("FitForge starter exercise catalogue seeded.");
}

main().catch((error) => {
  console.error("Failed to seed FitForge catalogue", error);
  process.exitCode = 1;
});
