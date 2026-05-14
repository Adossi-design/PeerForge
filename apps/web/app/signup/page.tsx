import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-4 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 px-2 pt-2">
          <h1 className="heading-2 mb-2">Create your account</h1>
          <p className="body-small text-muted-foreground">
            Join PeerForge and start building with other students.
          </p>
        </div>
        <SignUp routing="path" path="/signup" signInUrl="/login" />
      </div>
    </div>
  );
}
