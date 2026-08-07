import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Welcome to FitForge
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Let’s build your starting plan.</h1>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            Your account is ready. In the next sprint this page becomes the guided onboarding flow for goals, measurements, diet preferences and available training equipment.
          </p>
        </div>

        <div className="rounded-3xl border bg-background p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium">{session.user.email}</p>
        </div>
      </div>
    </main>
  );
}
