import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import {
  workoutDayExercises,
  workoutSessionExercises,
  workoutSessions,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { completeWorkoutSession } from "@/server/workout-session";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { sessionId } = await params;

  const [workoutSession] = await db
    .select({
      id: workoutSessions.id,
      workoutDayId: workoutSessions.workoutDayId,
      name: workoutSessions.nameSnapshot,
      startedAt: workoutSessions.startedAt,
      status: workoutSessions.status,
    })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!workoutSession) notFound();
  if (workoutSession.status === "completed") redirect("/dashboard");

  const exercises = await db
    .select({
      id: workoutSessionExercises.id,
      name: workoutSessionExercises.nameSnapshot,
      sortOrder: workoutSessionExercises.sortOrder,
      targetSets: workoutDayExercises.targetSets,
      targetRepsMin: workoutDayExercises.targetRepsMin,
      targetRepsMax: workoutDayExercises.targetRepsMax,
      targetDurationSeconds: workoutDayExercises.targetDurationSeconds,
    })
    .from(workoutSessionExercises)
    .leftJoin(
      workoutDayExercises,
      and(
        eq(workoutDayExercises.workoutDayId, workoutSession.workoutDayId ?? ""),
        eq(workoutDayExercises.exerciseId, workoutSessionExercises.exerciseId),
      ),
    )
    .where(eq(workoutSessionExercises.workoutSessionId, workoutSession.id))
    .orderBy(asc(workoutSessionExercises.sortOrder));

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Workout in progress
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {workoutSession.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Started {workoutSession.startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </header>

        <form action={completeWorkoutSession} className="space-y-5">
          <input type="hidden" name="workoutSessionId" value={workoutSession.id} />

          {exercises.map((exercise, exerciseIndex) => {
            const targetSets = exercise.targetSets ?? 3;
            const isTimed = Boolean(exercise.targetDurationSeconds);

            return (
              <section key={exercise.id} className="rounded-3xl border bg-background p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Exercise {exerciseIndex + 1}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{exercise.name}</h2>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {isTimed
                      ? `${targetSets} × ${exercise.targetDurationSeconds}s`
                      : `${targetSets} × ${exercise.targetRepsMin ?? "?"}-${exercise.targetRepsMax ?? "?"}`}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {Array.from({ length: targetSets }, (_, index) => {
                    const setNumber = index + 1;
                    return (
                      <div key={setNumber} className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[70px_1fr_1fr] sm:items-end">
                        <div className="text-sm font-semibold">Set {setNumber}</div>

                        {isTimed ? (
                          <label className="space-y-1 text-sm font-medium">
                            Seconds
                            <input
                              name={`${exercise.id}-set-${setNumber}-duration`}
                              type="number"
                              min="0"
                              defaultValue={exercise.targetDurationSeconds ?? undefined}
                              className="w-full rounded-xl border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
                            />
                          </label>
                        ) : (
                          <label className="space-y-1 text-sm font-medium">
                            Reps
                            <input
                              name={`${exercise.id}-set-${setNumber}-reps`}
                              type="number"
                              min="0"
                              defaultValue={exercise.targetRepsMin ?? undefined}
                              className="w-full rounded-xl border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
                            />
                          </label>
                        )}

                        <label className="space-y-1 text-sm font-medium">
                          Weight (kg)
                          <input
                            name={`${exercise.id}-set-${setNumber}-weight`}
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Optional"
                            className="w-full rounded-xl border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="sticky bottom-4 flex justify-end rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Finish workout
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
