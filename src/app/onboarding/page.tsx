import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { auth } from "@/server/auth";
import { completeOnboarding } from "@/server/onboarding";
import {
  dietaryOptions,
  equipmentOptions,
  fitnessGoals,
} from "@/validation/onboarding";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const [profile] = await db
    .select({ onboardingCompletedAt: profiles.onboardingCompletedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (profile?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            FitForge setup
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Build your starting profile.
          </h1>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            A few useful inputs now means fewer decisions later. You can change
            these settings as your routine evolves.
          </p>
        </header>

        <form action={completeOnboarding} className="space-y-6">
          <section className="grid gap-6 rounded-3xl border bg-background p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Step 1 of 3
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Starting point</h2>
            </div>

            <label className="space-y-2 text-sm font-medium">
              Date of birth
              <input
                required
                name="dateOfBirth"
                type="date"
                className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Height (cm)
              <input
                required
                min="100"
                max="250"
                step="0.1"
                name="heightCm"
                type="number"
                placeholder="168"
                className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Current weight (kg)
              <input
                required
                min="25"
                max="350"
                step="0.1"
                name="currentWeightKg"
                type="number"
                placeholder="80"
                className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Target weight (optional)
              <input
                min="25"
                max="350"
                step="0.1"
                name="targetWeightKg"
                type="number"
                placeholder="Optional"
                className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </section>

          <section className="space-y-6 rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Step 2 of 3
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Training direction
              </h2>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Primary goal</legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fitnessGoals.map((goal) => (
                  <label
                    key={goal.value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50"
                  >
                    <input
                      required
                      type="radio"
                      name="goalType"
                      value={goal.value}
                    />
                    <span className="text-sm font-medium">{goal.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block max-w-xs space-y-2 text-sm font-medium">
              Training days per week
              <select
                required
                name="workoutDaysPerWeek"
                defaultValue="3"
                className="w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                  <option key={days} value={days}>
                    {days} {days === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="space-y-7 rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Step 3 of 3
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Make it practical</h2>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Diet preferences</legend>
              <div className="flex flex-wrap gap-3">
                {dietaryOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      name="dietaryPreferences"
                      value={option.value}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">
                Equipment available
              </legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {equipmentOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      name="equipment"
                      value={option.value}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <div className="flex items-center justify-between gap-4 rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Signed in as {session.user.email}
            </p>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Finish setup
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
