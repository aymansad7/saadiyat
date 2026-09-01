import { useMemo, useState } from "react";
import { Link } from "wouter";
import { FileText, Link2, Plus, Search, ShieldCheck, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const clean = (value: string) => value.trim() || undefined;

export default function AdminOwners() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ displayName: "", phone: "", email: "", sourceLabel: "", internalNotes: "" });
  const [link, setLink] = useState({ ownerId: "", villaKey: "", community: "", relationship: "owner", sourceLabel: "" });
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const owners = trpc.propertyOwners.list.useQuery({ q: clean(q), limit: 300 }, { enabled: user?.role === "master" });
  const ownerDetail = trpc.propertyOwners.detail.useQuery(
    { id: selectedOwnerId ?? 0 },
    { enabled: user?.role === "master" && selectedOwnerId !== null },
  );
  const create = trpc.propertyOwners.create.useMutation({
    onSuccess: async owner => {
      await utils.propertyOwners.list.invalidate();
      setLink(current => ({ ...current, ownerId: String(owner.id) }));
      setSelectedOwnerId(owner.id);
      setForm({ displayName: "", phone: "", email: "", sourceLabel: "", internalNotes: "" });
      toast.success("Owner record created. Link it to an exact unit below.");
    },
    onError: error => toast.error(error.message),
  });
  const linkUnit = trpc.propertyOwners.linkUnit.useMutation({
    onSuccess: async () => {
      if (selectedOwnerId) await utils.propertyOwners.detail.invalidate({ id: selectedOwnerId });
      setLink(current => ({ ...current, villaKey: "", community: "", sourceLabel: "" }));
      toast.success("Owner linked to the exact unit and recorded in the audit trail.");
    },
    onError: error => toast.error(error.message),
  });
  const rows = useMemo(() => owners.data ?? [], [owners.data]);

  if (loading) return null;
  if (user?.role !== "master") {
    return <div className="min-h-screen bg-muted/20"><SiteHeader /><main className="container py-16"><Card><CardContent className="p-8 text-center"><h1 className="text-xl font-semibold">Master Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">Owner records and owner-linked files remain restricted to Master Admin.</p></CardContent></Card></main></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20"><SiteHeader />
      <main className="container space-y-6 py-8">
        <section className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm md:flex-row md:items-end">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-primary"><ShieldCheck className="h-4 w-4" />Master Admin only</div><h1 className="text-2xl font-semibold">Owners & exact unit links</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Create a protected owner record, then attach it to the exact unit or plot. The system never matches an owner by area, price, or name automatically.</p></div>
          <Link href="/admin/documents" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><FileText className="h-4 w-4" />Owner documents</Link>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" />Create owner record</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><Label>Name</Label><Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="Owner full name" /></div><div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Optional" /></div><div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Optional" /></div><div className="sm:col-span-2"><Label>Source / evidence</Label><Input value={form.sourceLabel} onChange={e => setForm({ ...form, sourceLabel: e.target.value })} placeholder="e.g. Owner-provided project file" /></div></div>
            <div><Label>Internal notes</Label><Textarea value={form.internalNotes} onChange={e => setForm({ ...form, internalNotes: e.target.value })} placeholder="Protected internal notes" /></div>
            <Button disabled={!clean(form.displayName) || create.isPending} onClick={() => create.mutate({ displayName: form.displayName.trim(), phone: clean(form.phone) ?? null, email: clean(form.email) ?? null, sourceLabel: clean(form.sourceLabel) ?? null, internalNotes: clean(form.internalNotes) ?? null })}>{create.isPending ? "Creating…" : "Create protected owner"}</Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4" />Link owner to exact unit</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><Label>Owner</Label><select className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm" value={link.ownerId} onChange={e => setLink({ ...link, ownerId: e.target.value })}><option value="">Choose owner</option>{rows.map(owner => <option key={owner.id} value={owner.id}>{owner.displayName}{owner.phone ? ` · ${owner.phone}` : ""}</option>)}</select></div>
            <div className="grid gap-3 sm:grid-cols-2"><div><Label>Canonical unit / plot key</Label><Input value={link.villaKey} onChange={e => setLink({ ...link, villaKey: e.target.value })} placeholder="hidd/20/2" /></div><div><Label>Community key</Label><Input value={link.community} onChange={e => setLink({ ...link, community: e.target.value })} placeholder="hidd" /></div></div>
            <div className="grid gap-3 sm:grid-cols-2"><div><Label>Relationship</Label><select className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm" value={link.relationship} onChange={e => setLink({ ...link, relationship: e.target.value })}><option value="owner">Owner</option><option value="co_owner">Co-owner</option><option value="representative">Representative</option></select></div><div><Label>Source / evidence</Label><Input value={link.sourceLabel} onChange={e => setLink({ ...link, sourceLabel: e.target.value })} placeholder="Verified record" /></div></div>
            <Button disabled={!link.ownerId || !clean(link.villaKey) || !clean(link.community) || linkUnit.isPending} onClick={() => { setSelectedOwnerId(Number(link.ownerId)); linkUnit.mutate({ ownerId: Number(link.ownerId), villaKey: link.villaKey.trim(), community: link.community.trim(), relationship: link.relationship as "owner" | "co_owner" | "representative", sourceLabel: clean(link.sourceLabel) ?? null }); }}>{linkUnit.isPending ? "Linking…" : "Link exact unit"}</Button>
          </CardContent></Card>
        </div>

        {selectedOwnerId !== null && (
          <Card className="border-primary/20">
            <CardHeader className="border-b pb-4"><CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base"><span>Owner file · {ownerDetail.data?.owner.displayName ?? "Loading…"}</span><div className="flex gap-2"><Link href="/admin/documents" className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-muted"><FileText className="mr-1.5 h-3.5 w-3.5" />Manage files</Link><Button variant="outline" size="sm" onClick={() => setSelectedOwnerId(null)}>Close</Button></div></CardTitle></CardHeader>
            <CardContent className="grid gap-5 pt-5 lg:grid-cols-2">
              <div><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exact linked units</div><div className="mt-3 space-y-2">{ownerDetail.isLoading ? <p className="text-sm text-muted-foreground">Loading owner record…</p> : ownerDetail.data?.links.length ? ownerDetail.data.links.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"><div><div className="font-mono text-sm">{item.villaKey}</div><div className="mt-0.5 text-xs text-muted-foreground">{item.community} · {item.relationship}{item.sourceLabel ? ` · ${item.sourceLabel}` : ""}</div></div><Link href={`/map?plot=${encodeURIComponent(item.villaKey)}`} className="text-xs font-medium text-primary hover:underline">Open card</Link></div>) : <p className="text-sm text-muted-foreground">No exact unit links yet.</p>}</div></div>
              <div><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner-linked files</div><div className="mt-3 space-y-2">{ownerDetail.isLoading ? <p className="text-sm text-muted-foreground">Loading files…</p> : ownerDetail.data?.documents.length ? ownerDetail.data.documents.map(document => <div key={document.id} className="rounded-md border bg-muted/20 px-3 py-2"><div className="text-sm font-medium">{document.filename}</div><div className="mt-0.5 text-xs text-muted-foreground">{document.documentType.replace(/_/g, " ")} · {document.villaKey}</div></div>) : <p className="text-sm text-muted-foreground">No owner files linked yet. Use OneDrive documents to upload and attach them.</p>}</div></div>
            </CardContent>
          </Card>
        )}

        <Card><CardHeader className="gap-3 border-b pb-4"><CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-4 w-4" />Owner directory · {rows.length}</CardTitle><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search owner name, phone, or email" /></div></CardHeader><CardContent className="p-0"><div className="divide-y">{owners.isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading protected owner records…</p> : rows.length ? rows.map(owner => <div key={owner.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-medium">{owner.displayName}</div><div className="mt-1 text-xs text-muted-foreground">{[owner.phone, owner.email, owner.sourceLabel].filter(Boolean).join(" · ") || "No contact source recorded"}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setSelectedOwnerId(owner.id)}>View file</Button><Button variant="outline" size="sm" onClick={() => { setSelectedOwnerId(owner.id); setLink(current => ({ ...current, ownerId: String(owner.id) })); }}>Select to link</Button></div></div>) : <p className="p-6 text-sm text-muted-foreground">No owner records yet. Create the first one above.</p>}</div></CardContent></Card>
      </main>
    </div>
  );
}
