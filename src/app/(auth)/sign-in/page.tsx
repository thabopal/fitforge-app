import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Sign in to FitForge
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Pick up where you left off with your training, nutrition and progress.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
