/**
 * EmailGate — magic-link first, with passcode fallback.
 *
 *  Flow A (default — email link):
 *    1. user enters email -> trpc.magic.request -> 6-digit code emailed
 *    2. user enters code  -> trpc.magic.verify  -> session cookie set
 *
 *  Flow B (fallback tab — passcode):
 *    Same as the legacy PasswordGate (server-verified `gate.verify`).
 *
 *  Once authenticated (either flow), unlock state is held in sessionStorage so
 *  internal navigation does not re-prompt. The session cookie set by the magic
 *  flow is HttpOnly and lasts ~30 days; passcode unlock is per-tab.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, Mail, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const STORAGE_KEY = "saadiyat:gate:unlocked";

interface Props {
  children: ReactNode;
}

type Mode = "email" | "passcode";
type EmailStep = "request" | "verify";

export default function EmailGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "yes";
    } catch {
      return false;
    }
  });
  const [mode, setMode] = useState<Mode>("email");

  // email flow state
  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState<EmailStep>("request");
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // passcode flow state
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [location] = useLocation();

  const requestMagic = trpc.magic.request.useMutation();
  const verifyMagic = trpc.magic.verify.useMutation();
  const verifyPasscode = trpc.gate.verify.useMutation();
  const heartbeat = trpc.gate.heartbeat.useMutation();

  // detect existing magic session via auth.me
  const meQuery = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });
  useEffect(() => {
    if (meQuery.data?.id || meQuery.data?.email) {
      setUnlocked(true);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "yes");
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQuery.data]);

  // cross-tab unlocks
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue === "yes") setUnlocked(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendCooldown]);

  // heartbeat after unlock
  useEffect(() => {
    if (!unlocked) return;
    heartbeat.mutate({ path: location });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, location]);
  useEffect(() => {
    if (!unlocked) return;
    const id = window.setInterval(() => heartbeat.mutate({}), 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const submitEmailRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setEmailError(null);
    setSubmitting(true);
    try {
      await requestMagic.mutateAsync({ email: email.trim() });
      setEmailStep("verify");
      setResendCooldown(60);
    } catch (err: any) {
      setEmailError(err?.message || "Could not send code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmailVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setVerifyError(null);
    setSubmitting(true);
    try {
      await verifyMagic.mutateAsync({ email: email.trim(), code: code.trim() });
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "yes");
      } catch {}
      setUnlocked(true);
    } catch (err: any) {
      setVerifyError(err?.message || "Incorrect code.");
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPasscode = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await verifyPasscode.mutateAsync({ passcode: passcode.trim() });
      if (res.success) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "yes");
        } catch {}
        setUnlocked(true);
        return;
      }
      setPasscodeError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      setPasscode("");
    } catch {
      setPasscodeError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
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
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-secondary/40 rounded-sm">
              <button
                type="button"
                onClick={() => setMode("email")}
                className={`flex-1 text-xs font-medium px-3 py-2 rounded-sm transition-colors ${
                  mode === "email"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="inline h-3.5 w-3.5 mr-1.5" />
                Email link
              </button>
              <button
                type="button"
                onClick={() => setMode("passcode")}
                className={`flex-1 text-xs font-medium px-3 py-2 rounded-sm transition-colors ${
                  mode === "passcode"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="inline h-3.5 w-3.5 mr-1.5" />
                Passcode
              </button>
            </div>

            {mode === "email" && emailStep === "request" && (
              <form onSubmit={submitEmailRequest} className="space-y-4">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
                    ─── Sign in
                  </div>
                  <h1 className="font-display text-3xl text-foreground mb-2">
                    Enter your email
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We&apos;ll send you a 6-digit code to sign in. Only invited
                    addresses can request a code.
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
                {emailError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting || !email.includes("@")}
                  className="w-full h-11"
                >
                  {submitting ? "Sending…" : "Send sign-in code"}
                </Button>
              </form>
            )}

            {mode === "email" && emailStep === "verify" && (
              <form onSubmit={submitEmailVerify} className="space-y-4">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
                    ─── Verify
                  </div>
                  <h1 className="font-display text-3xl text-foreground mb-2">
                    Check your inbox
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A 6-digit code has been sent to <strong>{email}</strong>. The
                    code expires in 10 minutes.
                  </p>
                </div>
                <label
                  htmlFor="code"
                  className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground block"
                >
                  Sign-in code
                </label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={e => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      if (verifyError) setVerifyError(null);
                    }}
                    placeholder="••••••"
                    disabled={submitting}
                    className={`pl-10 h-12 text-center text-2xl tracking-[0.5em] font-mono ${
                      verifyError ? "border-destructive focus-visible:ring-destructive/40" : ""
                    }`}
                  />
                </div>
                {verifyError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="w-full h-11"
                >
                  {submitting ? "Verifying…" : "Sign in"}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailStep("request");
                      setCode("");
                      setVerifyError(null);
                    }}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || submitting}
                    onClick={async () => {
                      try {
                        await requestMagic.mutateAsync({ email: email.trim() });
                        setResendCooldown(60);
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="text-primary hover:text-primary/80 disabled:text-muted-foreground/60 disabled:cursor-not-allowed underline"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {mode === "passcode" && (
              <form onSubmit={submitPasscode} className="space-y-3">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
                    ─── Restricted
                  </div>
                  <h1 className="font-display text-3xl text-foreground mb-2">
                    Enter passcode
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Fallback access. Use the email-link tab if you have a
                    registered address.
                  </p>
                </div>
                <label
                  htmlFor="passcode"
                  className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground block"
                >
                  Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="passcode"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={passcode}
                    onChange={e => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError(false);
                    }}
                    placeholder="••••••"
                    disabled={submitting}
                    className={`pl-10 h-12 text-base tracking-[0.5em] font-mono ${
                      passcodeError ? "border-destructive focus-visible:ring-destructive/40" : ""
                    }`}
                  />
                </div>
                {passcodeError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Incorrect passcode. Please contact Ayman Sadieh for access.</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11"
                >
                  {submitting ? "Checking…" : "Unlock"}
                </Button>
              </form>
            )}
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
