/**
 * EmailGate — allowlisted email/password or Google OAuth.
 *
 *  Flow A — enter allowlisted email + password -> session cookie set.
 *  Flow B — Google/Manus OAuth -> the same allowlist controls authorization.
 *
 *  The server-issued, HttpOnly session cookie is the only unlock authority.
 *  Browser storage is never used as an authentication signal, so an old tab
 *  cannot keep protected routes visible after its server session ends.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, Mail, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

interface Props {
  children: ReactNode;
}

export default function EmailGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const passwordSignIn = trpc.magic.password.useMutation();

  // detect existing magic session via auth.me
  const meQuery = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });
  useEffect(() => {
    if (meQuery.data?.id || meQuery.data?.email) {
      setUnlocked(true);
    } else if (!meQuery.isLoading) {
      setUnlocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQuery.data, meQuery.isLoading]);

  if (unlocked) return <>{children}</>;

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Verifying secure session…</p>
        </div>
      </div>
    );
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSignInError(null);
    setSubmitting(true);
    try {
      await passwordSignIn.mutateAsync({ email: email.trim(), password });
      setUnlocked(true);
    } catch (err: any) {
      setSignInError(err?.message || "Invalid email or password.");
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgb(186 100 60 / 0.7), transparent 40%), radial-gradient(circle at 80% 90%, rgb(72 92 110 / 0.6), transparent 45%)",
        }}
      />
      <main className="container flex-1 flex items-center justify-center py-12 relative">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 justify-center mb-10">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Saadiyat Resale Hub
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                Restricted access
              </div>
            </div>
          </div>

          <div
            className={`bg-card border border-border rounded-md p-8 shadow-sm transition-transform ${
              shaking ? "animate-shake" : ""
            }`}
          >
            <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
                    ─── Sign in
                  </div>
                  <h1 className="font-display text-3xl text-foreground mb-2">
                    Sign in with email
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use your invited email address and password.
                  </p>
                </div>
                <label
                  htmlFor="email"
                  className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground block"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
                <label
                  htmlFor="password"
                  className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground block"
                >
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
                {signInError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting || !email.includes("@") || password.length < 10}
                  className="w-full h-11"
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
            </form>
            <div className="relative flex items-center py-5" aria-hidden="true">
              <div className="grow border-t border-border" />
              <span className="mx-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">or</span>
              <div className="grow border-t border-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => window.location.assign(getLoginUrl())}
            >
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-mono uppercase tracking-[0.18em]">
            Saadiyat Island · Abu Dhabi
          </p>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}
