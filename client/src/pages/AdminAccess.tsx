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
  Eye,
  FilePenLine,
  History,
  Layers,
  MapPin,
  Phone,
  Building2,
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
import { PROPERTY_AREA_OPTIONS, PROPERTY_PHASE_OPTIONS, PROPERTY_PROJECT_OPTIONS } from "@shared/propertyAccess";

type Role = "user" | "admin" | "master";
type GrantScopeType = "area" | "project" | "phase";

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
  const setPassword = trpc.magic.access.setPassword.useMutation({
    onSuccess: () => utils.magic.access.list.invalidate(),
  });
  const grants = trpc.propertyAccess.grants.list.useQuery(undefined, { enabled: isMaster });
  const activity = trpc.propertyAccess.activity.useQuery({ limit: 150 }, { enabled: isMaster });
  const createGrants = trpc.propertyAccess.grants.createMany.useMutation({
    onSuccess: () => {
      utils.propertyAccess.grants.list.invalidate();
      utils.propertyAccess.activity.invalidate();
    },
  });
  const removeGrant = trpc.propertyAccess.grants.remove.useMutation({
    onSuccess: () => {
      utils.propertyAccess.grants.list.invalidate();
      utils.propertyAccess.activity.invalidate();
    },
  });

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [newNote, setNewNote] = useState("");
  const [passwordDrafts, setPasswordDrafts] = useState<Record<number, string>>({});
  const [grantEmail, setGrantEmail] = useState("");
  const [scopeType, setScopeType] = useState<GrantScopeType>("area");
  const [selectedScopeKeys, setSelectedScopeKeys] = useState<string[]>(["saadiyat"]);
  const [canViewOriginalPrice, setCanViewOriginalPrice] = useState(false);
  const [canViewOwnerName, setCanViewOwnerName] = useState(false);
  const [canViewOwnerPhone, setCanViewOwnerPhone] = useState(false);
  const [canViewOwnerDocuments, setCanViewOwnerDocuments] = useState(false);
  const [canEditProperties, setCanEditProperties] = useState(false);
  const [grantBuildingKey, setGrantBuildingKey] = useState("");
  const [grantUnitTypeKey, setGrantUnitTypeKey] = useState("");
  const [grantBedrooms, setGrantBedrooms] = useState("");

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

  const onSetPassword = async (id: number, email: string) => {
    const password = passwordDrafts[id] ?? "";
    if (password.length < 10) {
      toast.error("Password must contain at least 10 characters.");
      return;
    }
    try {
      await setPassword.mutateAsync({ id, password });
      setPasswordDrafts(current => ({ ...current, [id]: "" }));
      toast.success(`Password updated for ${email}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not update password");
    }
  };

  const onCreateGrant = async (event: FormEvent) => {
    event.preventDefault();
    if (!grantEmail.includes("@") || selectedScopeKeys.length === 0) return;
    const narrowing = scopeType === "area" ? {} : {
      buildingKey: grantBuildingKey.trim() || null,
      unitTypeKey: grantUnitTypeKey.trim() || null,
      bedrooms: grantBedrooms.trim() ? Number(grantBedrooms) : null,
    };
    if (narrowing.bedrooms != null && (!Number.isInteger(narrowing.bedrooms) || narrowing.bedrooms < 0 || narrowing.bedrooms > 30)) {
      toast.error("Bedrooms must be a whole number from 0 to 30.");
      return;
    }
    const scopes = selectedScopeKeys.map(value => {
      if (scopeType === "area") return { areaKey: value, projectKey: null, phaseKey: null };
      if (scopeType === "project") return { areaKey: null, projectKey: value, phaseKey: null, ...narrowing };
      const phase = PROPERTY_PHASE_OPTIONS.find(option => option.value === value);
      return { areaKey: null, projectKey: phase?.projectKey ?? null, phaseKey: phase?.phaseKey ?? null, ...narrowing };
    });
    if (scopes.some(scope => !scope.areaKey && !scope.projectKey)) return;
    try {
      const result = await createGrants.mutateAsync({
        email: grantEmail.trim(),
        scopes,
        canViewOriginalPrice,
        canViewOwnerName,
        canViewOwnerPhone,
        canViewOwnerDocuments,
        canEditProperties,
      });
      toast.success(`${result.created.length} property grant${result.created.length === 1 ? "" : "s"} added${result.skipped.length ? ` · ${result.skipped.length} already existed` : ""}`);
      setGrantEmail("");
      setCanViewOriginalPrice(false);
      setCanViewOwnerName(false);
      setCanViewOwnerPhone(false);
      setCanViewOwnerDocuments(false);
      setCanEditProperties(false);
      setGrantBuildingKey("");
      setGrantUnitTypeKey("");
      setGrantBedrooms("");
    } catch (err: any) {
      toast.error(err?.message || "Could not create property access grant");
    }
  };

  const onRemoveGrant = async (id: number) => {
    if (!confirm("Remove this property access grant?")) return;
    try {
      await removeGrant.mutateAsync({ id });
      toast.success("Property access grant removed");
    } catch (err: any) {
      toast.error(err?.message || "Could not remove property access grant");
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
            Invited emails can sign in with their assigned password or Google.
            Removing an email revokes future authenticated access; Master Admin
            can update an account password without ever viewing it.
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

        {isMaster && (
          <>
            <section className="bg-card border border-primary/30 rounded-md p-5 sm:p-6 mb-8">
              <div className="flex items-start gap-3 mb-5">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-1">
                    ─── Master Admin property permissions
                  </div>
                  <p className="text-sm text-muted-foreground max-w-3xl">
                    Grant a person access to one or more areas, projects, or classified phases. Field permissions are separate: original price, owner name, owner mobile, and the right to edit property information.
                  </p>
                </div>
              </div>
              <form onSubmit={onCreateGrant} className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="email"
                    value={grantEmail}
                    onChange={event => setGrantEmail(event.target.value)}
                    placeholder="person@example.com"
                    required
                  />
                  <Select value={scopeType} onValueChange={value => {
                    const nextType = value as GrantScopeType;
                    setScopeType(nextType);
                    setSelectedScopeKeys(nextType === "area" ? ["saadiyat"] : nextType === "project" ? ["st-regis"] : ["lagoons::SL2"]);
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="area">Entire area</SelectItem>
                      <SelectItem value="project">One or more projects</SelectItem>
                      <SelectItem value="phase">One or more classified phases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border border-border bg-secondary/15 p-3">
                  <div className="mb-2 text-[0.65rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                    Select one or more {scopeType === "area" ? "areas" : scopeType === "project" ? "projects" : "phases"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {(scopeType === "area" ? PROPERTY_AREA_OPTIONS : scopeType === "project" ? PROPERTY_PROJECT_OPTIONS : PROPERTY_PHASE_OPTIONS).map(option => {
                      const selected = selectedScopeKeys.includes(option.value);
                      return (
                        <label key={option.value} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${selected ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card hover:bg-secondary/40"}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setSelectedScopeKeys(current => selected ? current.filter(key => key !== option.value) : [...current, option.value])}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {scopeType !== "area" && (
                  <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-secondary/10 p-3 sm:grid-cols-3">
                    <div><label className="mb-1 block text-xs font-medium">Building key <span className="font-normal text-muted-foreground">optional</span></label><Input value={grantBuildingKey} onChange={event => setGrantBuildingKey(event.target.value)} placeholder="e.g. R17" /></div>
                    <div><label className="mb-1 block text-xs font-medium">Unit type <span className="font-normal text-muted-foreground">optional</span></label><Input value={grantUnitTypeKey} onChange={event => setGrantUnitTypeKey(event.target.value)} placeholder="e.g. 2BHK" /></div>
                    <div><label className="mb-1 block text-xs font-medium">Bedrooms <span className="font-normal text-muted-foreground">optional</span></label><Input inputMode="numeric" value={grantBedrooms} onChange={event => setGrantBedrooms(event.target.value)} placeholder="e.g. 2" /></div>
                    <p className="sm:col-span-3 text-xs leading-5 text-muted-foreground">Any field you set narrows every selected project/phase grant. A unit without matching source metadata will remain hidden.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  {[
                    [canViewOriginalPrice, setCanViewOriginalPrice, "View original price", Eye],
                    [canViewOwnerName, setCanViewOwnerName, "View owner name", UserIcon],
                    [canViewOwnerPhone, setCanViewOwnerPhone, "View owner mobile", Phone],
                    [canViewOwnerDocuments, setCanViewOwnerDocuments, "View owner files", FilePenLine],
                    [canEditProperties, setCanEditProperties, "Edit property data", FilePenLine],
                  ].map(([checked, setChecked, label, Icon]) => {
                    const PermissionIcon = Icon as typeof Eye;
                    return (
                      <label key={label as string} className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 cursor-pointer hover:bg-secondary/25">
                        <input
                          type="checkbox"
                          checked={checked as boolean}
                          onChange={event => (setChecked as (next: boolean) => void)(event.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                        <PermissionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{label as string}</span>
                      </label>
                    );
                  })}
                </div>
                <div>
                  <Button type="submit" disabled={createGrants.isPending || selectedScopeKeys.length === 0} className="gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    {createGrants.isPending ? "Saving…" : `Grant access to ${selectedScopeKeys.length} scope${selectedScopeKeys.length === 1 ? "" : "s"}`}
                  </Button>
                </div>
              </form>

              <div className="mt-6 border rounded-md overflow-hidden">
                <div className="px-4 py-2.5 bg-secondary/20 text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                  {grants.data?.length ?? 0} active property grant{(grants.data?.length ?? 0) === 1 ? "" : "s"}
                </div>
                {grants.isLoading ? (
                  <div className="p-5 text-sm text-muted-foreground">Loading grants…</div>
                ) : (grants.data?.length ?? 0) === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground">No delegated property access grants yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {grants.data?.map(grant => (
                      <div key={grant.id} className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 text-sm">
                        <div>
                          <div className="font-medium break-all">{grant.email}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {grant.areaKey ?? "Project-only"}</span>
                            {grant.projectKey && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {grant.projectKey}</span>}
                            {grant.phaseKey && <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {grant.phaseKey}</span>}
                            {grant.buildingKey && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> Building {grant.buildingKey}</span>}
                            {grant.unitTypeKey && <span>Type {grant.unitTypeKey}</span>}
                            {grant.bedrooms != null && <span>{grant.bedrooms} bedrooms</span>}
                            {grant.canViewOriginalPrice && <span>Original price</span>}
                            {grant.canViewOwnerName && <span>Owner name</span>}
                            {grant.canViewOwnerPhone && <span>Owner mobile</span>}
                            {grant.canViewOwnerDocuments && <span>Owner files</span>}
                            {grant.canEditProperties && <span>Edit</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive self-start" onClick={() => onRemoveGrant(grant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-card border border-border rounded-md overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">─── Activity audit</div>
                  <p className="text-xs text-muted-foreground mt-1">Successful sign-ins and privileged property/access changes, newest first.</p>
                </div>
              </div>
              {activity.isLoading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading activity…</div>
              ) : (activity.data?.length ?? 0) === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No activity has been recorded yet.</div>
              ) : (
                <div className="divide-y divide-border max-h-[520px] overflow-auto">
                  {activity.data?.map(event => (
                    <div key={event.id} className="px-5 py-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{event.summary}</span>
                        <time className="text-xs tabular-nums text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</time>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {event.actorEmail}{event.targetEmail && event.targetEmail !== event.actorEmail ? ` → ${event.targetEmail}` : ""} · {event.eventType.replaceAll("_", " ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

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
                  {isMaster && <th className="text-left px-5 py-2.5 hidden lg:table-cell">Password</th>}
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
                    {isMaster && (
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2 min-w-[230px]">
                          <Input
                            aria-label={`New password for ${row.email}`}
                            type="password"
                            autoComplete="new-password"
                            value={passwordDrafts[row.id] ?? ""}
                            onChange={event => setPasswordDrafts(current => ({ ...current, [row.id]: event.target.value }))}
                            className="h-8 text-xs"
                            placeholder="New password"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSetPassword(row.id, row.email)}
                            disabled={setPassword.isPending || (passwordDrafts[row.id] ?? "").length < 10}
                          >
                            Set
                          </Button>
                        </div>
                      </td>
                    )}
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
