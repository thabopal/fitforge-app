import "dotenv/config";

import { ensureStarterExerciseCatalog } from "@/server/services/workout-plan-service";

async function main() {
  await ensureStarterExerciseCatalog();
  console.log("FitForge starter exercise catalogue seeded.");
}

main().catch((error) => {
  console.error("Failed to seed FitForge catalogue", error);
  process.exitCode = 1;
});
