import { ChangeEvent, useMemo, useState } from "react";
import { Archive, ExternalLink, FileSpreadsheet, FileText, FolderSync, Loader2, RefreshCw, ShieldCheck, Upload } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SiteHeader from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type DocumentType = "brochure" | "spa" | "owner_document" | "floorplan" | "source_file" | "marketing" | "other";
type Visibility = "card_link" | "master_admin";

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "brochure", label: "Brochure" },
  { value: "spa", label: "SPA" },
  { value: "owner_document", label: "Owner document" },
  { value: "floorplan", label: "Floorplan" },
  { value: "source_file", label: "Source file" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const PUBLIC_CARD_TYPES = new Set<DocumentType>(["brochure", "floorplan", "marketing"]);

function formatDate(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatBytes(value: number | null | undefined) {
  if (value == null) return "—";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function AdminOneDriveDocuments() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [villaKey, setVillaKey] = useState("");
  const [community, setCommunity] = useState("");
  const [phaseKey, setPhaseKey] = useState("");
  const [ownerId, setOwnerId] = useState("none");
  const [documentType, setDocumentType] = useState<DocumentType>("brochure");
  const [visibility, setVisibility] = useState<Visibility>("card_link");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");

  const isMaster = user?.role === "master";
  const status = trpc.oneDrive.status.useQuery(undefined, { enabled: isAuthenticated && Boolean(user) });
  const documents = trpc.oneDrive.list.useQuery({ q: query.trim() || undefined, limit: 200 }, { enabled: isAuthenticated && Boolean(user) });
  const owners = trpc.propertyOwners.list.useQuery({ limit: 500 }, { enabled: isAuthenticated && Boolean(user) && user?.role === "master" });
  const initialise = trpc.oneDrive.initialise.useMutation({
    onSuccess: async () => {
      toast.success("OneDrive root folder verified.");
      await utils.oneDrive.status.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const exportWorkbook = trpc.oneDrive.exportWorkbook.useMutation({
    onSuccess: async result => {
      toast.success(`Unit Register exported with ${result.profileCount} profiles.`);
      await utils.oneDrive.status.invalidate();
      await utils.oneDrive.events.invalidate();
      if (result.webUrl) window.open(result.webUrl, "_blank", "noopener,noreferrer");
    },
    onError: error => toast.error(error.message),
  });
  const archive = trpc.oneDrive.archive.useMutation({
    onSuccess: async () => {
      toast.success("Document removed from the website register. The OneDrive file remains unchanged.");
      await utils.oneDrive.list.invalidate();
      await utils.oneDrive.status.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const upload = trpc.oneDrive.upload.useMutation({
    onSuccess: async () => {
      toast.success("Document saved in OneDrive and registered to the unit.");
      setDescription("");
      setSelectedFile(null);
      await utils.oneDrive.list.invalidate();
      await utils.oneDrive.status.invalidate();
      await utils.oneDrive.events.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const connectionLabel = useMemo(() => {
    if (status.isLoading) return "Checking connection…";
    if (status.data?.connection?.status === "active") return "Connected to OneDrive Business";
    return "OneDrive connection pending";
  }, [status.data?.connection?.status, status.isLoading]);

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/20"><SiteHeader /><main className="container py-16"><Card><CardContent className="p-8 text-center"><h1 className="text-xl font-semibold">Admin sign-in required</h1><Button className="mt-4" onClick={() => (window.location.href = getLoginUrl())}>Sign in</Button></CardContent></Card></main></div>
    );
  }
  if (!isMaster) {
    return (
      <div className="min-h-screen bg-muted/20"><SiteHeader /><main className="container py-16"><Card><CardContent className="p-8 text-center"><h1 className="text-xl font-semibold">Master Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">OneDrive documents can contain sensitive contracts and are managed only by Master Admin.</p></CardContent></Card></main></div>
    );
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > 25 * 1024 * 1024) {
      toast.error("Files larger than 25 MB are not accepted in this first upload flow.");
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  async function onUpload() {
    if (!villaKey.trim() || !community.trim() || !selectedFile) {
      toast.error("Unit key, community, and a file are required.");
      return;
    }
    if (!PUBLIC_CARD_TYPES.has(documentType) && visibility === "card_link") {
      toast.error("SPA, owner documents, and source files stay out of property cards.");
      return;
    }
    if (documentType === "owner_document" && ownerId === "none") {
      toast.error("Select the reviewed owner linked to this unit before uploading an owner document.");
      return;
    }
    const fileBase64 = await fileToBase64(selectedFile);
    upload.mutate({
      villaKey: villaKey.trim(),
      community: community.trim(),
      phaseKey: phaseKey.trim() || null,
      ownerId: ownerId === "none" ? null : Number(ownerId),
      documentType,
      websiteVisibility: visibility,
      filename: selectedFile.name,
      mimeType: selectedFile.type || "application/octet-stream",
      description: description.trim() || null,
      fileBase64,
    });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="container space-y-6 py-8">
        <section className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><ShieldCheck className="h-4 w-4" /> Master Admin · OneDrive</div>
            <h1 className="text-2xl font-semibold tracking-tight">Unit documents</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Files are stored only in OneDrive. The website keeps the exact unit record, document type, sharing setting, version metadata, and audit trail—not a duplicate of the file.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/listings" className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted">Listings</Link>
            <Button variant="outline" onClick={() => initialise.mutate()} disabled={initialise.isPending}><RefreshCw className={`mr-2 h-4 w-4 ${initialise.isPending ? "animate-spin" : ""}`} />Verify OneDrive</Button>
            <Button onClick={() => exportWorkbook.mutate()} disabled={exportWorkbook.isPending}><FileSpreadsheet className="mr-2 h-4 w-4" />{exportWorkbook.isPending ? "Exporting…" : "Export Unit Register"}</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-4"><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connection</div><div className="mt-1 text-sm font-semibold">{connectionLabel}</div><div className="mt-1 text-xs text-muted-foreground">{status.data?.connection?.rootPath ?? "Saadiyat Resale Hub"}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registered files</div><div className="mt-1 text-2xl font-semibold tabular-nums">{(documents.data ?? []).length}</div><div className="mt-1 text-xs text-muted-foreground">Metadata only in website database</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workbook</div><div className="mt-1 text-sm font-semibold">Website writes; Excel does not import</div><div className="mt-1 text-xs text-muted-foreground">Last export: {formatDate(status.data?.connection?.lastWorkbookExportAt)}</div></CardContent></Card>
        </section>

        <Card>
          <CardHeader><CardTitle className="text-base">Add a document to the exact unit</CardTitle></CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="one-drive-unit">Unit / plot key</Label><Input id="one-drive-unit" placeholder="e.g. Lagoons/SL2/139-01" value={villaKey} onChange={e => setVillaKey(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="one-drive-community">Community key</Label><Input id="one-drive-community" placeholder="e.g. lagoons" value={community} onChange={e => setCommunity(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="one-drive-phase">Phase (optional)</Label><Input id="one-drive-phase" placeholder="e.g. SL2" value={phaseKey} onChange={e => setPhaseKey(e.target.value)} /></div>
              <div className="space-y-2"><Label>Linked owner <span className="text-muted-foreground">(required for owner document)</span></Label><Select value={ownerId} onValueChange={setOwnerId}><SelectTrigger><SelectValue placeholder="No owner link" /></SelectTrigger><SelectContent><SelectItem value="none">No owner link</SelectItem>{(owners.data ?? []).map(owner => <SelectItem key={owner.id} value={String(owner.id)}>{owner.displayName}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Document type</Label><Select value={documentType} onValueChange={value => { const type = value as DocumentType; setDocumentType(type); if (!PUBLIC_CARD_TYPES.has(type)) setVisibility("master_admin"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Website visibility</Label><Select value={visibility} onValueChange={value => setVisibility(value as Visibility)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="master_admin">Master Admin only</SelectItem>{PUBLIC_CARD_TYPES.has(documentType) ? <SelectItem value="card_link">Show an individual link on the card</SelectItem> : null}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="one-drive-file">OneDrive file</Label><Input id="one-drive-file" type="file" onChange={onFileChange} /></div>
            </div>
            <div className="flex flex-col gap-3"><div className="space-y-2"><Label htmlFor="one-drive-description">Description (optional)</Label><Textarea id="one-drive-description" className="min-h-28" placeholder="What is this file and which unit record does it verify?" value={description} onChange={e => setDescription(e.target.value)} /></div><p className="text-xs leading-5 text-muted-foreground">Brochures, floorplans, and marketing files can have an individual card link. SPA, owner documents, and source files stay in Master Admin even when OneDrive creates a link for an intended recipient.</p><Button className="self-start" onClick={onUpload} disabled={upload.isPending || !selectedFile}><Upload className="mr-2 h-4 w-4" />{upload.isPending ? "Uploading to OneDrive…" : "Upload to OneDrive"}</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3 border-b"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><CardTitle className="text-base">Registered OneDrive documents</CardTitle><Input className="h-9 sm:w-72" placeholder="Search unit, community, file…" value={query} onChange={e => setQuery(e.target.value)} /></div></CardHeader>
          <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>File</TableHead><TableHead>Unit / project</TableHead><TableHead>Type</TableHead><TableHead>Visibility</TableHead><TableHead>Size</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{documents.isLoading ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading documents…</TableCell></TableRow> : (documents.data ?? []).length === 0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No OneDrive document has been registered yet.</TableCell></TableRow> : (documents.data ?? []).map(doc => <TableRow key={doc.id}><TableCell><div className="font-medium">{doc.filename}</div><div className="mt-0.5 max-w-56 truncate font-mono text-[0.65rem] text-muted-foreground">{doc.itemId}</div></TableCell><TableCell><div>{doc.villaKey}</div><div className="text-xs text-muted-foreground">{doc.community}{doc.phaseKey ? ` · ${doc.phaseKey}` : ""}</div></TableCell><TableCell><Badge variant="outline">{doc.documentType.replace(/_/g, " ")}</Badge></TableCell><TableCell><span className="text-xs">{doc.websiteVisibility === "card_link" ? "Card link" : "Master Admin"}</span></TableCell><TableCell className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(doc.updatedAt)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1">{doc.shareUrl ? <Button variant="ghost" size="sm" asChild><a href={doc.shareUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Open</a></Button> : null}<Button variant="ghost" size="sm" className="text-destructive" disabled={archive.isPending} onClick={() => archive.mutate({ id: doc.id })}><Archive className="mr-1 h-3.5 w-3.5" />Remove</Button></div></TableCell></TableRow>)}</TableBody></Table></div></CardContent>
        </Card>
      </main>
    </div>
  );
}
