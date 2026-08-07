import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  exerciseSets,
  workoutSessionExercises,
  workoutSessions,
} from "@/db/schema";
import { auth } from "@/server/auth";

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const completedSessions = await db
    .select({
      id: workoutSessions.id,
      name: workoutSessions.nameSnapshot,
      startedAt: workoutSessions.startedAt,
      completedAt: workoutSessions.completedAt,
    })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, session.user.id),
        eq(workoutSessions.status, "completed"),
      ),
    )
    .orderBy(desc(workoutSessions.startedAt))
    .limit(30);

  const setRows = await db
    .select({
      exerciseName: workoutSessionExercises.nameSnapshot,
      sessionStartedAt: workoutSessions.startedAt,
      setNumber: exerciseSets.setNumber,
      repetitions: exerciseSets.repetitions,
      weightKg: exerciseSets.weightKg,
      durationSeconds: exerciseSets.durationSeconds,
    })
    .from(exerciseSets)
    .innerJoin(
      workoutSessionExercises,
      eq(exerciseSets.sessionExerciseId, workoutSessionExercises.id),
    )
    .innerJoin(
      workoutSessions,
      eq(workoutSessionExercises.workoutSessionId, workoutSessions.id),
    )
    .where(
      and(
        eq(workoutSessions.userId, session.user.id),
        eq(workoutSessions.status, "completed"),
      ),
    )
    .orderBy(desc(workoutSessions.startedAt), desc(exerciseSets.setNumber));

  const thisWeekSessions = completedSessions.filter(
    (item) => item.startedAt >= startOfWeek(),
  );

  const totalSets = setRows.length;
  const totalVolumeKg = setRows.reduce((sum, row) => {
    const weight = row.weightKg ? Number(row.weightKg) : 0;
    const reps = row.repetitions ?? 0;
    return sum + weight * reps;
  }, 0);

  const exerciseHistory = new Map<
    string,
    Array<{
      date: Date;
      setNumber: number;
      repetitions: number | null;
      weightKg: string | null;
      durationSeconds: number | null;
    }>
  >();

  for (const row of setRows) {
    const history = exerciseHistory.get(row.exerciseName) ?? [];
    if (history.length < 6) {
      history.push({
        date: row.sessionStartedAt,
        setNumber: row.setNumber,
        repetitions: row.repetitions,
        weightKg: row.weightKg,
        durationSeconds: row.durationSeconds,
      });
      exerciseHistory.set(row.exerciseName, history);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Training analytics
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Your progress
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              A simple view of what you have actually completed and logged.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border bg-background px-4 py-2.5 text-sm font-medium"
          >
            Back to dashboard
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="This week"
            value={`${thisWeekSessions.length} workouts`}
          />
          <Metric
            label="Completed"
            value={`${completedSessions.length} sessions`}
          />
          <Metric label="Logged sets" value={String(totalSets)} />
          <Metric
            label="Training volume"
            value={
              totalVolumeKg > 0
                ? `${Math.round(totalVolumeKg).toLocaleString()} kg`
                : "No weighted sets yet"
            }
          />
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Exercise history
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Recent performance</h2>

          {exerciseHistory.size === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Complete workouts and log your sets to build exercise history.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {Array.from(exerciseHistory.entries()).map(([name, history]) => (
                <article key={name} className="rounded-2xl border p-5">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <div className="mt-4 space-y-3">
                    {history.map((set, index) => (
                      <div
                        key={`${name}-${set.date.toISOString()}-${set.setNumber}-${index}`}
                        className="flex items-center justify-between gap-4 border-t pt-3 first:border-0 first:pt-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Set {set.setNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {set.date.toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {set.durationSeconds
                            ? `${set.durationSeconds}s`
                            : `${set.repetitions ?? "?"} reps${set.weightKg ? ` @ ${set.weightKg} kg` : ""}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Session history
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Completed workouts</h2>
          <div className="mt-5 space-y-3">
            {completedSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No completed workouts yet.
              </p>
            ) : (
              completedSessions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.startedAt.toLocaleDateString()} ·{" "}
                      {item.startedAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    Completed
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-background p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
