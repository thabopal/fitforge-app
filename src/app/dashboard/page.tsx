import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/server/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">FitForge dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome, {session.user.name}</h1>
          </div>
          <SignOutButton />
        </header>

        <section className="rounded-3xl border bg-background p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Authentication complete
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Your dashboard shell is protected.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Next we’ll replace this placeholder with onboarding-driven protein, meals, workouts, water and progress data.
          </p>
        </section>
      </div>
    </main>
  );
}
