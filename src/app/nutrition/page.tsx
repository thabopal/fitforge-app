import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { bodyMeasurements, foods, profiles, userGoals } from "@/db/schema";
import { auth } from "@/server/auth";
import { logFood } from "@/server/services/nutrition";
import {
  calculateNutritionTargets,
  getDailyNutritionSummary,
} from "@/server/services/nutrition-service";

export default async function NutritionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const [profile] = await db
    .select({
      onboardingCompletedAt: profiles.onboardingCompletedAt,
    })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const [latestMeasurement] = await db
    .select({
      weightKg: bodyMeasurements.weightKg,
    })
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, session.user.id))
    .orderBy(desc(bodyMeasurements.measuredAt))
    .limit(1);

  if (!latestMeasurement?.weightKg) {
    throw new Error("A current body weight is required for nutrition targets.");
  }

  const [primaryGoal] = await db
    .select({
      goalType: userGoals.goalType,
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

  const targets = calculateNutritionTargets({
    weightKg: Number(latestMeasurement.weightKg),
    goalType: primaryGoal?.goalType ?? null,
  });

  const { logs, totals } = await getDailyNutritionSummary(session.user.id);

  const foodOptions = await db
    .select({
      id: foods.id,
      name: foods.name,
      servingQuantity: foods.defaultServingQuantity,
      servingUnit: foods.defaultServingUnit,
      caloriesKcal: foods.caloriesKcal,
      proteinG: foods.proteinG,
    })
    .from(foods)
    .where(eq(foods.isActive, true))
    .orderBy(asc(foods.name));

  const remainingCalories = Math.max(
    0,
    targets.caloriesKcal - totals.caloriesKcal,
  );

  const remainingProtein = Math.max(0, targets.proteinG - totals.proteinG);

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              FitForge nutrition
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Fuel today.
            </h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Track meals against your current calorie and macro targets.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Back to dashboard
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NutritionMetric
            label="Calories"
            consumed={totals.caloriesKcal}
            target={targets.caloriesKcal}
            unit="kcal"
          />

          <NutritionMetric
            label="Protein"
            consumed={totals.proteinG}
            target={targets.proteinG}
            unit="g"
          />

          <NutritionMetric
            label="Carbohydrates"
            consumed={totals.carbohydrateG}
            target={targets.carbohydrateG}
            unit="g"
          />

          <NutritionMetric
            label="Fat"
            consumed={totals.fatG}
            target={targets.fatG}
            unit="g"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Today
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Daily nutrition</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {remainingCalories} kcal and {remainingProtein} g protein
                  remaining.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {logs.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No food logged yet today.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
                  >
                    <div>
                      <p className="font-medium">{log.name}</p>
                      <p className="mt-1 text-sm capitalize text-muted-foreground">
                        {log.mealType.replaceAll("_", " ")} ·{" "}
                        {Number(log.servings).toFixed(1)} serving
                        {Number(log.servings) === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {Math.round(Number(log.caloriesKcal ?? 0))} kcal
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(Number(log.proteinG ?? 0))} g protein
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Log food
            </p>

            <h2 className="mt-3 text-2xl font-semibold">Add a meal</h2>

            <form action={logFood} className="mt-6 space-y-5">
              <label className="block space-y-2 text-sm font-medium">
                Meal
                <select
                  required
                  name="mealType"
                  defaultValue="breakfast"
                  className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="snack">Snack</option>
                  <option value="lunch">Lunch</option>
                  <option value="pre_workout">Pre-workout</option>
                  <option value="post_workout">Post-workout</option>
                  <option value="dinner">Dinner</option>
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium">
                Food
                <select
                  required
                  name="foodId"
                  defaultValue=""
                  className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>
                    Select food
                  </option>

                  {foodOptions.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name} · {food.servingQuantity} {food.servingUnit} ·{" "}
                      {food.caloriesKcal} kcal
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium">
                Servings
                <input
                  required
                  name="servings"
                  type="number"
                  min="0.25"
                  step="0.25"
                  defaultValue="1"
                  className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Log food
              </button>
            </form>
          </aside>
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Daily target
          </p>

          <h2 className="mt-3 text-2xl font-semibold">
            Your current starting targets
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            These targets are starter estimates based on your current body
            weight and primary fitness goal. We can refine them later as
            FitForge collects more training and progress data.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TargetCard label="Energy" value={`${targets.caloriesKcal} kcal`} />
            <TargetCard label="Protein" value={`${targets.proteinG} g`} />
            <TargetCard label="Carbs" value={`${targets.carbohydrateG} g`} />
            <TargetCard label="Fat" value={`${targets.fatG} g`} />
          </div>
        </section>
      </div>
    </main>
  );
}

function NutritionMetric({
  label,
  consumed,
  target,
  unit,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
}) {
  const percentage =
    target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  return (
    <div className="rounded-3xl border bg-background p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-semibold">
        {consumed}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          / {target} {unit}
        </span>
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {percentage}% of target
      </p>
    </div>
  );
}

function TargetCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
