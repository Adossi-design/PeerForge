import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-4 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 px-2 pt-2">
          <h1 className="heading-2 mb-2">Welcome back</h1>
          <p className="body-small text-muted-foreground">
            Sign in to continue building with your team.
          </p>
        </div>
        <SignIn routing="path" path="/login" signUpUrl="/signup" />
      </div>
    </div>
  );
}
