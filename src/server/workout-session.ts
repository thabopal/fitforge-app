"use server";

import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  exerciseSets,
  exercises,
  workoutDayExercises,
  workoutDays,
  workoutPlans,
  workoutSessionExercises,
  workoutSessions,
} from "@/db/schema";
import { auth } from "@/server/auth";

export async function startWorkoutSession(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const workoutDayId = String(formData.get("workoutDayId") ?? "");
  if (!workoutDayId) throw new Error("Workout day is required");

  const [day] = await db
    .select({
      dayId: workoutDays.id,
      dayName: workoutDays.name,
      planId: workoutPlans.id,
    })
    .from(workoutDays)
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.workoutPlanId))
    .where(
      and(
        eq(workoutDays.id, workoutDayId),
        eq(workoutPlans.userId, session.user.id),
        eq(workoutPlans.status, "active"),
      ),
    )
    .limit(1);

  if (!day) throw new Error("Workout day not found");

  const plannedExercises = await db
    .select({
      exerciseId: workoutDayExercises.exerciseId,
      exerciseName: exercises.name,
      sortOrder: workoutDayExercises.sortOrder,
    })
    .from(workoutDayExercises)
    .innerJoin(exercises, eq(exercises.id, workoutDayExercises.exerciseId))
    .where(eq(workoutDayExercises.workoutDayId, workoutDayId))
    .orderBy(asc(workoutDayExercises.sortOrder));

  const [workoutSession] = await db
    .insert(workoutSessions)
    .values({
      userId: session.user.id,
      workoutPlanId: day.planId,
      workoutDayId: day.dayId,
      nameSnapshot: day.dayName,
      startedAt: new Date(),
      status: "in_progress",
    })
    .returning({ id: workoutSessions.id });

  if (!workoutSession) throw new Error("Unable to start workout");

  if (plannedExercises.length > 0) {
    await db.insert(workoutSessionExercises).values(
      plannedExercises.map((exercise) => ({
        workoutSessionId: workoutSession.id,
        exerciseId: exercise.exerciseId,
        nameSnapshot: exercise.exerciseName,
        sortOrder: exercise.sortOrder,
      })),
    );
  }

  redirect(`/workouts/session/${workoutSession.id}`);
}

export async function completeWorkoutSession(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const workoutSessionId = String(formData.get("workoutSessionId") ?? "");
  if (!workoutSessionId) throw new Error("Workout session is required");

  const [ownedSession] = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.id, workoutSessionId),
        eq(workoutSessions.userId, session.user.id),
        eq(workoutSessions.status, "in_progress"),
      ),
    )
    .limit(1);

  if (!ownedSession) throw new Error("Workout session not found");

  const sessionExercises = await db
    .select({ id: workoutSessionExercises.id })
    .from(workoutSessionExercises)
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSessionId));

  for (const exercise of sessionExercises) {
    for (let setNumber = 1; setNumber <= 10; setNumber += 1) {
      const repsRaw = formData.get(`${exercise.id}-set-${setNumber}-reps`);
      const weightRaw = formData.get(`${exercise.id}-set-${setNumber}-weight`);
      const durationRaw = formData.get(`${exercise.id}-set-${setNumber}-duration`);

      if (repsRaw === null && weightRaw === null && durationRaw === null) continue;

      const repetitions = repsRaw ? Number(repsRaw) : null;
      const weightKg = weightRaw ? Number(weightRaw).toFixed(2) : null;
      const durationSeconds = durationRaw ? Number(durationRaw) : null;

      if (repetitions === null && weightKg === null && durationSeconds === null) continue;

      await db.insert(exerciseSets).values({
        sessionExerciseId: exercise.id,
        setNumber,
        setType: "working",
        repetitions: Number.isFinite(repetitions) ? repetitions : null,
        weightKg,
        durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
        completed: true,
      });
    }
  }

  await db
    .update(workoutSessions)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(workoutSessions.id, workoutSessionId));

  redirect("/dashboard");
}
