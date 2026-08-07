import Link from "next/link";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border bg-background shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
            <Link className="text-xl font-semibold tracking-tight" href="/">
              FitForge
            </Link>
            <div className="max-w-md space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-background/60">
                Build. Fuel. Improve.
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Less guesswork. A clearer next step every day.
              </h1>
              <p className="leading-7 text-background/70">
                FitForge brings training, nutrition and progress into one calm system built around your goals.
              </p>
            </div>
            <p className="text-sm text-background/50">Personal fitness, engineered for consistency.</p>
          </section>
          <section className="p-6 sm:p-10 lg:p-12">{children}</section>
        </div>
      </div>
    </main>
  );
}
