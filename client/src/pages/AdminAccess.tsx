/**
 * Admin / Access — manage the magic-link allowlist.
 *
 * - List allowed emails with role + last login + when they were added
 * - Add a new email (assign role)
 * - Update role inline (user / admin / master)
 * - Remove an email (revoke access immediately)
 *
 * Restricted to admin/master via tRPC `magic.access.*` adminProcedures.
 */
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ShieldCheck,
  Trash2,
  UserPlus,
  Mail,
  Crown,
  User as UserIcon,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type Role = "user" | "admin" | "master";

function roleBadge(role: string) {
  if (role === "master")
    return (
      <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border border-primary/40 text-primary bg-primary/5">
        <Crown className="h-3 w-3" /> Master
      </span>
    );
  if (role === "admin")
    return (
      <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border border-amber-500/40 text-amber-700 bg-amber-50">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border border-foreground/20 text-muted-foreground bg-secondary/40">
      <UserIcon className="h-3 w-3" /> User
    </span>
  );
}

export default function AdminAccess() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const isMaster = user?.role === "master";
  const list = trpc.magic.access.list.useQuery(undefined, {
    enabled: !!user && (user.role === "admin" || user.role === "master"),
  });
  const add = trpc.magic.access.add.useMutation({
    onSuccess: () => utils.magic.access.list.invalidate(),
  });
  const remove = trpc.magic.access.remove.useMutation({
    onSuccess: () => utils.magic.access.list.invalidate(),
  });
  const updateRole = trpc.magic.access.updateRole.useMutation({
    onSuccess: () => utils.magic.access.list.invalidate(),
  });

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [newNote, setNewNote] = useState("");

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes("@")) return;
    try {
      await add.mutateAsync({
        email: newEmail.trim(),
        role: newRole,
        note: newNote.trim() || undefined,
      });
      toast.success(`Added ${newEmail.trim()}`);
      setNewEmail("");
      setNewNote("");
      setNewRole("user");
    } catch (err: any) {
      toast.error(err?.message || "Could not add email");
    }
  };

  const onRemove = async (id: number, email: string) => {
    if (!confirm(`Revoke access for ${email}?`)) return;
    try {
      await remove.mutateAsync({ id });
      toast.success(`Removed ${email}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not remove");
    }
  };

  const onRoleChange = async (id: number, role: Role) => {
    try {
      await updateRole.mutateAsync({ id, role });
      toast.success(`Role updated to ${role}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not update role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-12">
          <div className="text-muted-foreground">Loading…</div>
        </main>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "master")) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-12">
          <h1 className="font-display text-3xl text-foreground mb-2">Forbidden</h1>
          <p className="text-muted-foreground">
            You must be an administrator to manage access.
          </p>
        </main>
      </div>
    );
  }

  const rows = list.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Hub
          </Link>
        </div>

        <header className="mb-8">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">
            ─── Access control
          </div>
          <h1 className="font-display text-4xl text-foreground">Allowed emails</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Anyone whose email is on this list can sign in via the magic-link
            flow on the home screen. Removing an email here revokes access for
            future sign-ins.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span>Signed in as</span>
            <span className="text-foreground">{user.email}</span>
            {isMaster ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-primary/40 text-primary bg-primary/5">
                <Crown className="h-3 w-3" /> master
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-amber-500/40 text-amber-700 bg-amber-50">
                <ShieldCheck className="h-3 w-3" /> admin
              </span>
            )}
          </div>
          {!isMaster && (
            <p className="text-xs text-muted-foreground/80 mt-2">
              You can add and remove regular users. Promotions to admin or
              master, or any change to existing admin/master accounts, require
              a master user.
            </p>
          )}
        </header>

        {/* Add form */}
        <section className="bg-card border border-border rounded-md p-5 sm:p-6 mb-8">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-muted-foreground mb-4">
            ─── Add email
          </div>
          <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-[1fr,140px,1fr,auto] gap-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="person@example.com"
                className="pl-10"
                required
              />
            </div>
            <Select value={newRole} onValueChange={v => setNewRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin" disabled={!isMaster}>
                  Admin {isMaster ? "" : "(master only)"}
                </SelectItem>
                <SelectItem value="master" disabled={!isMaster}>
                  Master {isMaster ? "" : "(master only)"}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Note (optional, e.g. Broker — NAS)"
            />
            <Button type="submit" disabled={add.isPending} className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              {add.isPending ? "Adding…" : "Add"}
            </Button>
          </form>
        </section>

        {/* List */}
        <section className="bg-card border border-border rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/20 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
            {rows.length} email{rows.length === 1 ? "" : "s"} on the allowlist
          </div>
          {list.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No emails on the list yet. Add one above to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/20 text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2.5">Email</th>
                  <th className="text-left px-5 py-2.5">Role</th>
                  <th className="text-left px-5 py-2.5 hidden md:table-cell">Note</th>
                  <th className="text-left px-5 py-2.5 hidden md:table-cell">Last sign-in</th>
                  <th className="text-right px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-t border-border hover:bg-secondary/10">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground break-all">{row.email}</div>
                      {row.addedBy && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          added by {row.addedBy}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {roleBadge(row.role)}
                        {/*
                         * Admin (non-master) can only edit `user` rows. Any
                         * row that is admin/master is locked unless the
                         * caller is `master`.
                         */}
                        <Select
                          value={row.role}
                          onValueChange={v => onRoleChange(row.id, v as Role)}
                          disabled={
                            !isMaster &&
                            (row.role === "admin" || row.role === "master")
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin" disabled={!isMaster}>
                              Admin
                            </SelectItem>
                            <SelectItem value="master" disabled={!isMaster}>
                              Master
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">
                      {row.note ?? "—"}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-muted-foreground tabular-nums text-xs">
                      {row.lastSeenAt
                        ? new Date(row.lastSeenAt).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(row.id, row.email)}
                        disabled={
                          !isMaster &&
                          (row.role === "admin" || row.role === "master")
                        }
                        title={
                          !isMaster &&
                          (row.role === "admin" || row.role === "master")
                            ? "Only a master user can remove admin/master accounts"
                            : "Revoke access"
                        }
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
