import { and, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { db } from "@/db";
import { bodyMeasurements, profiles, userGoals } from "@/db/schema";
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
            label="Height"
            value={profile.heightCm ? `${profile.heightCm} cm` : "Not set"}
          />
        </section>

        <section className="rounded-3xl border bg-background p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Profile ready
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Your dashboard shell is protected.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Next we’ll replace this placeholder with onboarding-driven protein,
            meals, workouts, water and progress data.
          </p>
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
