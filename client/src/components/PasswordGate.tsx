/**
 * PasswordGate — server-verified passcode gate.
 *
 * The passcode is now stored in the database (table `app_settings`, key
 * `gate_passcode`) and verified through the `gate.verify` tRPC procedure.
 * Every attempt is logged server-side (success or failure). On suspicious
 * activity (failed-attempt bursts or page-hit firehoses), the server
 * automatically rotates the passcode and notifies the owner.
 *
 * After unlock, the gate posts a heartbeat (`gate.heartbeat`) on every
 * route change so the admin dashboard can show "who is currently in".
 */
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Lock, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const STORAGE_KEY = "saadiyat:gate:unlocked";

interface Props {
  children: ReactNode;
}

export default function PasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "yes";
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [location] = useLocation();

  const verify = trpc.gate.verify.useMutation();
  const heartbeat = trpc.gate.heartbeat.useMutation();

  // Keep listening for cross-tab unlocks
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue === "yes") setUnlocked(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Heartbeat on every route change after unlock
  useEffect(() => {
    if (!unlocked) return;
    heartbeat.mutate({ path: location });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, location]);

  // Periodic heartbeat (every 60s) so "active sessions" updates
  useEffect(() => {
    if (!unlocked) return;
    const id = window.setInterval(() => {
      heartbeat.mutate({});
    }, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await verify.mutateAsync({ passcode: value.trim() });
      if (res.success) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "yes");
        } catch {
          /* ignore */
        }
        setUnlocked(true);
        return;
      }
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      setValue("");
    } catch {
      setError(true);
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
                Saadiyat
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                Private access
              </div>
            </div>
          </div>

          <div
            className={`bg-card border border-border rounded-md p-8 shadow-sm transition-transform ${
              shaking ? "animate-shake" : ""
            }`}
          >
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
              ─── Restricted
            </div>
            <h1 className="font-display text-3xl text-foreground mb-2">Enter passcode</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This site is reserved for invited brokers, owners, and partners. Enter the access
              code shared with you to continue.
            </p>

            <form onSubmit={submit} className="space-y-3">
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
                  autoFocus
                  value={value}
                  onChange={e => {
                    setValue(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••••"
                  disabled={submitting}
                  className={`pl-10 h-12 text-base tracking-[0.5em] font-mono ${
                    error ? "border-destructive focus-visible:ring-destructive/40" : ""
                  }`}
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Incorrect passcode. Please contact Ayman Sadieh for access.</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {submitting ? "Checking…" : "Unlock"}
              </Button>
            </form>
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
