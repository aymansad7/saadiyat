/**
 * PasswordGate — protects the entire application behind a single shared
 * password. On success, stores a sessionStorage flag so the user is not
 * prompted again until they close the browser tab / clear session storage.
 *
 * NOTE: this is a soft client-side gate. It deters casual visitors but is
 * not a security boundary — the underlying static assets remain reachable
 * by anyone who inspects the bundle. For real access control, route the
 * site through the existing Manus OAuth flow instead.
 */
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Lock, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "saadiyat:gate:unlocked";
const SECRET = "062026";

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

  // Re-check on mount (in case storage was set by another tab via storage event)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue === "yes") setUnlocked(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (unlocked) return <>{children}</>;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() === SECRET) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "yes");
      } catch {
        /* ignore quota / privacy mode errors */
      }
      setUnlocked(true);
      return;
    }
    setError(true);
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
    setValue("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgb(186 100 60 / 0.7), transparent 40%), radial-gradient(circle at 80% 90%, rgb(72 92 110 / 0.6), transparent 45%)",
        }}
      />
      <main className="container flex-1 flex items-center justify-center py-12 relative">
        <div className="w-full max-w-md">
          {/* Wordmark */}
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

          {/* Card */}
          <div
            className={`bg-card border border-border rounded-md p-8 shadow-sm transition-transform ${
              shaking ? "animate-shake" : ""
            }`}
          >
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
              ─── Restricted
            </div>
            <h1 className="font-display text-3xl text-foreground mb-2">
              Enter passcode
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This site is reserved for invited brokers, owners, and partners. Enter the access code
              shared with you to continue.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <label htmlFor="passcode" className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground block">
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
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••••"
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
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Unlock
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
