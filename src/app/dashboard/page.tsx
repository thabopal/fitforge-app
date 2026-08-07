import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { db } from "@/db";
import {
  bodyMeasurements,
  exercises,
  profiles,
  userGoals,
  workoutDayExercises,
  workoutDays,
  workoutPlans,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { fitnessGoals } from "@/validation/onboarding";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const [profile] = await db
    .select({
      heightCm: profiles.heightCm,
      onboardingCompletedAt: profiles.onboardingCompletedAt,
    })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const [primaryGoal] = await db
    .select({
      goalType: userGoals.goalType,
      targetWeightKg: userGoals.targetWeightKg,
    })
    .from(userGoals)
    .where(
      and(
        eq(userGoals.userId, session.user.id),
        eq(userGoals.isPrimary, true),
        isNull(userGoals.endsOn),
      ),
    )
    .limit(1);

  const [latestMeasurement] = await db
    .select({ weightKg: bodyMeasurements.weightKg })
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, session.user.id))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .limit(1);

  const [activePlan] = await db
    .select({
      id: workoutPlans.id,
      name: workoutPlans.name,
      description: workoutPlans.description,
      daysPerWeek: workoutPlans.daysPerWeek,
    })
    .from(workoutPlans)
    .where(
      and(
        eq(workoutPlans.userId, session.user.id),
        eq(workoutPlans.status, "active"),
      ),
    )
    .limit(1);

  const planRows = activePlan
    ? await db
        .select({
          dayId: workoutDays.id,
          dayNumber: workoutDays.dayNumber,
          dayName: workoutDays.name,
          estimatedMinutes: workoutDays.estimatedMinutes,
          exerciseName: exercises.name,
          targetSets: workoutDayExercises.targetSets,
          targetRepsMin: workoutDayExercises.targetRepsMin,
          targetRepsMax: workoutDayExercises.targetRepsMax,
          targetDurationSeconds: workoutDayExercises.targetDurationSeconds,
          sortOrder: workoutDayExercises.sortOrder,
        })
        .from(workoutDays)
        .leftJoin(
          workoutDayExercises,
          eq(workoutDayExercises.workoutDayId, workoutDays.id),
        )
        .leftJoin(exercises, eq(exercises.id, workoutDayExercises.exerciseId))
        .where(eq(workoutDays.workoutPlanId, activePlan.id))
        .orderBy(asc(workoutDays.dayNumber), asc(workoutDayExercises.sortOrder))
    : [];

  const planDays = Array.from(
    planRows.reduce(
      (map, row) => {
        const current = map.get(row.dayId) ?? {
          id: row.dayId,
          number: row.dayNumber,
          name: row.dayName,
          estimatedMinutes: row.estimatedMinutes,
          exercises: [] as Array<{
            name: string;
            prescription: string;
          }>,
        };

        if (row.exerciseName) {
          const prescription = row.targetDurationSeconds
            ? `${row.targetSets} × ${row.targetDurationSeconds}s`
            : `${row.targetSets} × ${row.targetRepsMin ?? "?"}-${row.targetRepsMax ?? "?"}`;

          current.exercises.push({
            name: row.exerciseName,
            prescription,
          });
        }

        map.set(row.dayId, current);
        return map;
      },
      new Map<
        string,
        {
          id: string;
          number: number;
          name: string;
          estimatedMinutes: number | null;
          exercises: Array<{ name: string; prescription: string }>;
        }
      >(),
    ).values(),
  );

  const goalLabel =
    fitnessGoals.find((goal) => goal.value === primaryGoal?.goalType)?.label ??
    "Not set";

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              FitForge dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome, {session.user.name}
            </h1>
          </div>
          <SignOutButton />
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Primary goal" value={goalLabel} />
          <MetricCard
            label="Current weight"
            value={
              latestMeasurement?.weightKg
                ? `${latestMeasurement.weightKg} kg`
                : "Not set"
            }
          />
          <MetricCard
            label="Target weight"
            value={
              primaryGoal?.targetWeightKg
                ? `${primaryGoal.targetWeightKg} kg`
                : "Flexible"
            }
          />
          <MetricCard
            label="Training frequency"
            value={activePlan ? `${activePlan.daysPerWeek} days / week` : "Not generated"}
          />
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your training plan
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {activePlan?.name ?? "No active workout plan yet"}
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            {activePlan?.description ??
              "Complete onboarding to generate a starter plan matched to your goal and equipment."}
          </p>

          {planDays.length > 0 && (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {planDays.map((day) => (
                <article key={day.id} className="rounded-2xl border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Day {day.number}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">{day.name}</h3>
                    </div>
                    {day.estimatedMinutes && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        ~{day.estimatedMinutes} min
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    {day.exercises.map((exercise, index) => (
                      <div
                        key={`${day.id}-${exercise.name}`}
                        className="flex items-center justify-between gap-4 border-t pt-3 first:border-0 first:pt-0"
                      >
                        <span className="text-sm font-medium">
                          {index + 1}. {exercise.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {exercise.prescription}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-background p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
