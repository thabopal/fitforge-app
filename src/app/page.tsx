import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <section className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Build. Fuel. Improve.
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              FitForge
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              A calm fitness system for training, nutrition and progress. Start
              with your goals, then let FitForge make the next step obvious.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              href="/sign-up"
            >
              Create account
            </Link>
            <Link
              className="rounded-xl border bg-background px-5 py-3 font-semibold transition hover:bg-muted"
              href="/sign-in"
            >
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
