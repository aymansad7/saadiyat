/**
 * Admin console — owner-only dashboard for the passcode gate.
 * Shows live sessions, every passcode attempt, recent page hits, and the
 * security event feed. Lets the owner rotate the passcode or set a custom one.
 */
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function fmt(t: Date | null | undefined) {
  if (!t) return "—";
  const d = t instanceof Date ? t : new Date(t);
  return d.toLocaleString();
}

function relTime(t: Date | null | undefined) {
  if (!t) return "—";
  const d = t instanceof Date ? t : new Date(t);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return `${Math.max(0, Math.floor(diff / 1000))}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

function shorten(s: string | null | undefined, n = 60) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function AdminPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const isOwner = user?.role === "admin";
  const [reveal, setReveal] = useState(false);
  const [customPasscode, setCustomPasscode] = useState("");

  const overview = trpc.gate.adminOverview.useQuery(undefined, {
    enabled: !!isOwner,
    refetchInterval: 15_000,
  });
  const utils = trpc.useUtils();
  const rotate = trpc.gate.rotatePasscode.useMutation({
    onSuccess: data => {
      toast.success(`Passcode rotated to ${data.passcode}`);
      utils.gate.adminOverview.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const setPass = trpc.gate.setPasscode.useMutation({
    onSuccess: data => {
      toast.success(`Passcode set to ${data.passcode}`);
      setCustomPasscode("");
      utils.gate.adminOverview.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  // Periodic refresh visual indicator
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const data = overview.data;
  const sessions = data?.sessions ?? [];
  const attempts = data?.attempts ?? [];
  const events = data?.events ?? [];
  const hits = data?.recentHits ?? [];

  const liveSessions = useMemo(() => {
    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    return sessions.filter(
      s => !s.leftAt && new Date(s.lastSeenAt).getTime() >= cutoff,
    );
  }, [sessions, tick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16 text-muted-foreground">Checking access…</main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16">
          <div className="max-w-md mx-auto bg-card border rounded-md p-8 text-center">
            <ShieldAlert className="h-8 w-8 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Sign in required</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The admin console is reserved for the project owner. Please sign in with your Manus
              account first.
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16">
          <div className="max-w-md mx-auto bg-card border rounded-md p-8 text-center">
            <ShieldAlert className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Forbidden</h1>
            <p className="text-sm text-muted-foreground">
              You are signed in as <span className="font-mono">{user?.name ?? user?.email}</span>,
              but only the project owner can view this page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const stats = data?.stats ?? { successCount: 0, failCount: 0, activeNow: 0, total24h: 0 };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-1">
              ─── Admin console
            </div>
            <h1 className="font-display text-3xl">Gate &amp; visitor activity</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live monitoring · auto-refreshes every 15 seconds
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </header>

        {/* Passcode card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <KeyRound className="h-4 w-4 text-primary" /> Current passcode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg tracking-[0.4em] bg-muted px-3 py-1.5 rounded">
                  {reveal ? data?.passcode ?? "—" : "••••••"}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReveal(r => !r)}
                  title={reveal ? "Hide" : "Reveal"}
                >
                  {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (!data?.passcode) return;
                    navigator.clipboard.writeText(data.passcode);
                    toast.success("Copied");
                  }}
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  variant="default"
                  onClick={() => rotate.mutate()}
                  disabled={rotate.isPending}
                  className="gap-1.5"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${rotate.isPending ? "animate-spin" : ""}`}
                  />
                  Rotate to a random new passcode
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              <Input
                placeholder="Or set a specific passcode (4–32 chars)"
                value={customPasscode}
                onChange={e => setCustomPasscode(e.target.value)}
                maxLength={32}
                className="sm:max-w-xs"
              />
              <Button
                variant="secondary"
                disabled={
                  setPass.isPending || customPasscode.trim().length < 4
                }
                onClick={() => setPass.mutate({ passcode: customPasscode.trim() })}
              >
                Set passcode
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The system auto-rotates the passcode to <span className="font-mono">062020</span>{" "}
              if it detects a likely scrape (≥ 5 failed attempts from one IP in 15 min, or ≥ 60
              page hits from one visitor in 5 min). You receive a Manus notification with the new
              code.
            </p>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active now" value={liveSessions.length} icon={<Eye className="h-4 w-4" />} />
          <StatCard label="Successful unlocks (last 100)" value={stats.successCount} icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} />
          <StatCard label="Failed attempts (last 100)" value={stats.failCount} icon={<X className="h-4 w-4 text-destructive" />} />
          <StatCard label="Attempts in last 24 h" value={stats.total24h} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
        </div>

        {/* Live sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Who is in right now</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {liveSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active visitors at the moment.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3">Visitor</th>
                    <th className="text-left py-2 pr-3">IP</th>
                    <th className="text-left py-2 pr-3">User agent</th>
                    <th className="text-left py-2 pr-3">Page hits</th>
                    <th className="text-left py-2 pr-3">First seen</th>
                    <th className="text-left py-2">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSessions.map(s => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs">{shorten(s.visitorId, 14)}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{s.ip || "—"}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{shorten(s.userAgent, 80)}</td>
                      <td className="py-2 pr-3 font-mono">{s.pageHits}</td>
                      <td className="py-2 pr-3 text-xs">{relTime(s.firstSeenAt)}</td>
                      <td className="py-2 text-xs">{relTime(s.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Security events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Security events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts so far.</p>
            ) : (
              events.map(e => (
                <div
                  key={e.id}
                  className={`border rounded-md p-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 ${
                    e.severity === "critical"
                      ? "border-destructive/40 bg-destructive/5"
                      : e.severity === "warning"
                        ? "border-amber-300/60 bg-amber-50 dark:bg-amber-950/20"
                        : "bg-muted/40"
                  }`}
                >
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background border">
                    {e.eventType}
                  </span>
                  <span className="flex-1">{e.summary}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {fmt(e.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attempts log */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Passcode attempts (last 100)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts logged yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3">Result</th>
                    <th className="text-left py-2 pr-3">When</th>
                    <th className="text-left py-2 pr-3">Visitor</th>
                    <th className="text-left py-2 pr-3">IP</th>
                    <th className="text-left py-2 pr-3">User agent</th>
                    <th className="text-left py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        {a.success ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            <Check className="h-3 w-3" /> ok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            <X className="h-3 w-3" /> fail
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-xs font-mono">{relTime(a.createdAt)}</td>
                      <td className="py-2 pr-3 text-xs font-mono">{shorten(a.visitorId, 12)}</td>
                      <td className="py-2 pr-3 text-xs font-mono">{a.ip || "—"}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{shorten(a.userAgent, 70)}</td>
                      <td className="py-2 text-xs font-mono">{a.success ? "—" : a.submittedValue ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Recent page hits */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent page views (last 100)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {hits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3">When</th>
                    <th className="text-left py-2 pr-3">Visitor</th>
                    <th className="text-left py-2 pr-3">IP</th>
                    <th className="text-left py-2">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {hits.map(h => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 text-xs font-mono">{relTime(h.createdAt)}</td>
                      <td className="py-2 pr-3 text-xs font-mono">{shorten(h.visitorId, 12)}</td>
                      <td className="py-2 pr-3 text-xs font-mono">{h.ip || "—"}</td>
                      <td className="py-2 text-xs">{h.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.65rem] uppercase font-mono tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}
