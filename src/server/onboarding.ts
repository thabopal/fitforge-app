"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  bodyMeasurements,
  dietaryPreferences,
  equipment,
  profiles,
  userDietaryPreferences,
  userEquipment,
  userGoals,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { generateStarterWorkoutPlan } from "@/server/services/workout-plan-service";
import {
  dietaryOptions,
  equipmentOptions,
  onboardingSchema,
} from "@/validation/onboarding";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function completeOnboarding(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const parsed = onboardingSchema.safeParse({
    dateOfBirth: formData.get("dateOfBirth"),
    heightCm: formData.get("heightCm"),
    currentWeightKg: formData.get("currentWeightKg"),
    targetWeightKg: formData.get("targetWeightKg") || undefined,
    goalType: formData.get("goalType"),
    workoutDaysPerWeek: formData.get("workoutDaysPerWeek"),
    dietaryPreferences: formData.getAll("dietaryPreferences"),
    equipment: formData.getAll("equipment"),
  });

  if (!parsed.success) {
    throw new Error("Please check the onboarding form and try again.");
  }

  const input = parsed.data;
  const userId = session.user.id;
  const today = todayIsoDate();

  await db
    .insert(profiles)
    .values({
      userId,
      dateOfBirth: input.dateOfBirth,
      heightCm: input.heightCm.toFixed(2),
      onboardingCompletedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        dateOfBirth: input.dateOfBirth,
        heightCm: input.heightCm.toFixed(2),
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  await db.insert(bodyMeasurements).values({
    userId,
    measuredAt: new Date(),
    weightKg: input.currentWeightKg.toFixed(2),
    source: "manual",
    notes: "Initial onboarding measurement",
  });

  const [existingPrimaryGoal] = await db
    .select({ id: userGoals.id })
    .from(userGoals)
    .where(
      and(
        eq(userGoals.userId, userId),
        eq(userGoals.isPrimary, true),
        isNull(userGoals.endsOn),
      ),
    )
    .limit(1);

  if (existingPrimaryGoal) {
    await db
      .update(userGoals)
      .set({
        goalType: input.goalType,
        targetWeightKg: input.targetWeightKg?.toFixed(2) ?? null,
        startsOn: today,
      })
      .where(eq(userGoals.id, existingPrimaryGoal.id));
  } else {
    await db.insert(userGoals).values({
      userId,
      goalType: input.goalType,
      targetWeightKg: input.targetWeightKg?.toFixed(2),
      isPrimary: true,
      startsOn: today,
    });
  }

  const allowedDietary = new Map(
    dietaryOptions.map((option) => [option.value, option.label]),
  );
  const selectedDietary = input.dietaryPreferences.filter((slug) =>
    allowedDietary.has(slug),
  );

  if (selectedDietary.length > 0) {
    await db
      .insert(dietaryPreferences)
      .values(
        selectedDietary.map((slug) => ({
          slug,
          name: allowedDietary.get(slug) ?? slug,
        })),
      )
      .onConflictDoNothing({ target: dietaryPreferences.slug });

    const preferenceRows = await db
      .select({ id: dietaryPreferences.id })
      .from(dietaryPreferences)
      .where(inArray(dietaryPreferences.slug, selectedDietary));

    await db
      .delete(userDietaryPreferences)
      .where(eq(userDietaryPreferences.userId, userId));

    if (preferenceRows.length > 0) {
      await db.insert(userDietaryPreferences).values(
        preferenceRows.map((preference) => ({
          userId,
          dietaryPreferenceId: preference.id,
        })),
      );
    }
  }

  const allowedEquipment = new Map(
    equipmentOptions.map((option) => [option.value, option.label]),
  );
  const selectedEquipment = input.equipment.filter((slug) =>
    allowedEquipment.has(slug),
  );

  if (selectedEquipment.length > 0) {
    await db
      .insert(equipment)
      .values(
        selectedEquipment.map((slug) => ({
          slug,
          name: allowedEquipment.get(slug) ?? slug,
        })),
      )
      .onConflictDoNothing({ target: equipment.slug });

    const equipmentRows = await db
      .select({ id: equipment.id })
      .from(equipment)
      .where(inArray(equipment.slug, selectedEquipment));

    await db.delete(userEquipment).where(eq(userEquipment.userId, userId));

    if (equipmentRows.length > 0) {
      await db.insert(userEquipment).values(
        equipmentRows.map((item) => ({
          userId,
          equipmentId: item.id,
        })),
      );
    }
  }

  await generateStarterWorkoutPlan({
    userId,
    goalType: input.goalType,
    daysPerWeek: input.workoutDaysPerWeek,
  });

  redirect("/dashboard");
}
