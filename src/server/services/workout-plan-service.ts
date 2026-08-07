import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  equipment,
  exerciseCategories,
  exerciseEquipment,
  exercises,
  userEquipment,
  workoutDayExercises,
  workoutDays,
  workoutPlans,
} from "@/db/schema";
import { getWorkoutTemplate, starterExercises } from "@/lib/workout-catalog";
import type { OnboardingInput } from "@/validation/onboarding";

const focusExercises: Record<string, string[]> = {
  push: ["push-up", "dumbbell-floor-press", "shoulder-press", "lateral-raise"],
  pull: ["dumbbell-row", "reverse-fly"],
  arms: ["biceps-curl"],
  legs: [
    "goblet-squat",
    "bodyweight-squat",
    "romanian-deadlift",
    "reverse-lunge",
    "calf-raise",
  ],
  core: ["plank", "bicycle-crunch"],
};

function prescription(
  goalType: OnboardingInput["goalType"],
  exerciseSlug: string,
) {
  if (exerciseSlug === "plank") {
    return {
      targetSets: 3,
      targetRepsMin: null,
      targetRepsMax: null,
      targetDurationSeconds: 30,
      restSeconds: 60,
    };
  }

  if (goalType === "strength") {
    return {
      targetSets: 3,
      targetRepsMin: 5,
      targetRepsMax: 8,
      targetDurationSeconds: null,
      restSeconds: 120,
    };
  }

  if (goalType === "muscle_gain" || goalType === "body_recomposition") {
    return {
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      targetDurationSeconds: null,
      restSeconds: 90,
    };
  }

  return {
    targetSets: 3,
    targetRepsMin: 10,
    targetRepsMax: 15,
    targetDurationSeconds: null,
    restSeconds: 60,
  };
}

export async function ensureStarterExerciseCatalog() {
  const categories = Array.from(
    new Map(
      starterExercises.map((item) => [item.category, item.categoryLabel]),
    ).entries(),
  );

  await db
    .insert(exerciseCategories)
    .values(categories.map(([slug, name]) => ({ slug, name })))
    .onConflictDoNothing({ target: exerciseCategories.slug });

  const categoryRows = await db
    .select({ id: exerciseCategories.id, slug: exerciseCategories.slug })
    .from(exerciseCategories)
    .where(
      inArray(
        exerciseCategories.slug,
        categories.map(([slug]) => slug),
      ),
    );

  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const equipmentSlugs = Array.from(
    new Set(starterExercises.flatMap((item) => item.equipment)),
  );

  await db
    .insert(equipment)
    .values(
      equipmentSlugs.map((slug) => ({
        slug,
        name: slug
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      })),
    )
    .onConflictDoNothing({ target: equipment.slug });

  for (const item of starterExercises) {
    const categoryId = categoryIds.get(item.category);
    if (!categoryId) continue;

    await db
      .insert(exercises)
      .values({
        categoryId,
        name: item.name,
        slug: item.slug,
        instructions: item.instructions,
        difficulty: item.difficulty,
        movementPattern: item.movementPattern,
      })
      .onConflictDoNothing({ target: exercises.slug });
  }

  const exerciseRows = await db
    .select({ id: exercises.id, slug: exercises.slug })
    .from(exercises)
    .where(
      inArray(
        exercises.slug,
        starterExercises.map((item) => item.slug),
      ),
    );

  const equipmentRows = await db
    .select({ id: equipment.id, slug: equipment.slug })
    .from(equipment)
    .where(inArray(equipment.slug, equipmentSlugs));

  const exerciseIds = new Map(exerciseRows.map((row) => [row.slug, row.id]));
  const equipmentIds = new Map(equipmentRows.map((row) => [row.slug, row.id]));

  const links = starterExercises.flatMap((item) => {
    const exerciseId = exerciseIds.get(item.slug);
    if (!exerciseId) return [];

    return item.equipment.flatMap((slug) => {
      const equipmentId = equipmentIds.get(slug);
      return equipmentId ? [{ exerciseId, equipmentId }] : [];
    });
  });

  if (links.length > 0) {
    await db.insert(exerciseEquipment).values(links).onConflictDoNothing();
  }

  return exerciseIds;
}

export async function generateStarterWorkoutPlan({
  userId,
  goalType,
  daysPerWeek,
}: {
  userId: string;
  goalType: OnboardingInput["goalType"];
  daysPerWeek: number;
}) {
  const exerciseIds = await ensureStarterExerciseCatalog();

  const ownedEquipmentRows = await db
    .select({ slug: equipment.slug })
    .from(userEquipment)
    .innerJoin(equipment, eq(userEquipment.equipmentId, equipment.id))
    .where(eq(userEquipment.userId, userId));

  const availableEquipment = new Set([
    "bodyweight",
    ...ownedEquipmentRows.map((row) => row.slug),
  ]);
  const availableExercises = starterExercises.filter((item) =>
    item.equipment.some((slug) => availableEquipment.has(slug)),
  );
  const availableSlugs = new Set(availableExercises.map((item) => item.slug));

  await db
    .update(workoutPlans)
    .set({ status: "archived", endsOn: new Date(), updatedAt: new Date() })
    .where(
      and(eq(workoutPlans.userId, userId), eq(workoutPlans.status, "active")),
    );

  const [plan] = await db
    .insert(workoutPlans)
    .values({
      userId,
      name: `${daysPerWeek}-Day ${goalType.replaceAll("_", " ")} Plan`,
      description:
        "Starter plan generated from onboarding goal, training frequency and available equipment.",
      goalType,
      daysPerWeek,
      status: "active",
      startsOn: new Date(),
    })
    .returning({ id: workoutPlans.id });

  if (!plan) throw new Error("Unable to create workout plan");

  const template = getWorkoutTemplate(daysPerWeek);

  for (const [dayIndex, day] of template.entries()) {
    const [workoutDay] = await db
      .insert(workoutDays)
      .values({
        workoutPlanId: plan.id,
        dayNumber: dayIndex + 1,
        name: day.name,
        description: `Focus: ${day.focus.join(", ")}`,
        estimatedMinutes: 45,
      })
      .returning({ id: workoutDays.id });

    if (!workoutDay) continue;

    const requestedSlugs = Array.from(
      new Set(day.focus.flatMap((focus) => focusExercises[focus] ?? [])),
    ).filter((slug) => availableSlugs.has(slug));

    const selectedSlugs = requestedSlugs.slice(0, 6);

    if (selectedSlugs.length === 0) {
      selectedSlugs.push("push-up", "bodyweight-squat", "plank");
    }

    const rows = selectedSlugs.flatMap((slug, index) => {
      const exerciseId = exerciseIds.get(slug);
      if (!exerciseId) return [];
      return [
        {
          workoutDayId: workoutDay.id,
          exerciseId,
          sortOrder: index + 1,
          ...prescription(goalType, slug),
        },
      ];
    });

    if (rows.length > 0) {
      await db.insert(workoutDayExercises).values(rows);
    }
  }

  return plan.id;
}
