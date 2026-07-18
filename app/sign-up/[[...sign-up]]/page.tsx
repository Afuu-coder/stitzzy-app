import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-semibold text-ink">
            Stitzzy
          </span>
          <p className="eyebrow mt-1">Create your account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox:    "w-full",
              card:       "stitch-card shadow-card w-full rounded-xl p-0",
              headerTitle: "font-display text-xl font-semibold text-ink",
              headerSubtitle: "font-sans text-ink-muted text-sm",
              formButtonPrimary:
                "btn-primary w-full py-2.5 text-sm font-medium",
              footerActionLink: "text-brand-600 hover:text-brand-700 font-medium",
              formFieldLabel: "font-mono text-xs uppercase tracking-wide text-ink-muted",
              formFieldInput:
                "border border-ink/20 rounded-lg font-sans text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              socialButtonsBlockButton:
                "border border-ink/20 rounded-lg hover:bg-canvas-2 transition-colors font-sans text-sm text-ink",
            },
          }}
        />
      </div>
    </main>
  );
}
