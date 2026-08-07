import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Start your FitForge account
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We’ll use onboarding next to shape your nutrition and training plan.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
