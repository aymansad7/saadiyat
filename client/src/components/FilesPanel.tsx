import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpToLine, Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_EXT = ".pdf,.png,.jpg,.jpeg,.webp,.zip,.doc,.docx,.xls,.xlsx,.txt,.csv";
const MAX_BYTES = 25 * 1024 * 1024;

type Props = {
  /** "villa" → attached to a specific villa, requires villaKey | "global" → island-wide library */
  scope: "villa" | "global";
  villaKey?: string;
  title?: string;
  subtitle?: string;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function FilesPanel({ scope, villaKey, title, subtitle }: Props) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const listQuery =
    scope === "villa"
      ? trpc.files.listByVilla.useQuery({ villaKey: villaKey! }, { enabled: Boolean(villaKey) })
      : trpc.files.listGlobal.useQuery();

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success("File uploaded");
      setPendingFile(null);
      setDescription("");
      setCategory("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (scope === "villa") utils.files.listByVilla.invalidate({ villaKey: villaKey! });
      else utils.files.listGlobal.invalidate();
    },
    onError: (err) => toast.error(err.message || "Upload failed"),
  });

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted");
      if (scope === "villa") utils.files.listByVilla.invalidate({ villaKey: villaKey! });
      else utils.files.listGlobal.invalidate();
    },
    onError: (err) => toast.error(err.message || "Delete failed"),
  });

  const files = listQuery.data ?? [];
  const isAdmin = user?.role === "admin" || user?.role === "master";

  async function handleUpload() {
    if (!pendingFile) return;
    if (pendingFile.size > MAX_BYTES) {
      toast.error(`File too large (max ${MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }
    try {
      const dataB64 = await readFileAsBase64(pendingFile);
      await uploadMutation.mutateAsync({
        scope,
        villaKey: scope === "villa" ? villaKey : undefined,
        category: category.trim() || undefined,
        filename: pendingFile.name,
        mimeType: pendingFile.type || "application/octet-stream",
        description: description.trim() || undefined,
        dataB64,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload error");
    }
  }

  return (
    <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h3 className="font-display text-xl">{title ?? (scope === "villa" ? "Attached Files" : "Documents Library")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {subtitle ?? (scope === "villa"
              ? "Brochures, floorplans, contracts, photos — public to all visitors."
              : "Island-wide reference documents — master plans, regulations, brochures.")}
          </p>
        </div>
        <span className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"}
        </span>
      </header>

      {/* Upload box */}
      <div className="border-b px-5 py-4 bg-muted/30">
        {!user ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Sign in to upload files. Viewing is open to everyone.
            </span>
            <Button asChild size="sm" variant="default">
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                disabled={uploadMutation.isPending}
              >
                <Upload className="h-4 w-4" />
                {pendingFile ? "Change file" : "Choose file"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXT}
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {pendingFile && (
                <span className="text-sm text-foreground/80">
                  {pendingFile.name}{" "}
                  <span className="text-muted-foreground">({formatBytes(pendingFile.size)})</span>
                </span>
              )}
            </div>

            {pendingFile && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Category (optional, e.g. brochure, floorplan)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={64}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={2000}
                />
              </div>
            )}

            {pendingFile && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPendingFile(null);
                    setDescription("");
                    setCategory("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="gap-2"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpToLine className="h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>
            )}

            <p className="text-[0.7rem] text-muted-foreground">
              Allowed: PDF · images (PNG, JPG, WebP) · Office docs · ZIP · TXT/CSV. Max 25 MB.
            </p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-5 py-4">
        {listQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : files.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <FileText className="mx-auto mb-2 h-6 w-6 opacity-40" />
            No files attached yet.
            {!user && " Sign in to upload the first one."}
          </div>
        ) : (
          <ul className="divide-y">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`/manus-storage/${f.storageKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground hover:text-primary truncate"
                    >
                      {f.filename}
                    </a>
                    {f.category && (
                      <span className="text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                        {f.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{formatBytes(f.sizeBytes)}</span>
                    <span>·</span>
                    <span>{formatDate(f.createdAt)}</span>
                    {f.uploaderName && (
                      <>
                        <span>·</span>
                        <span>by {f.uploaderName}</span>
                      </>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{f.description}</p>
                  )}
                </div>
                <Button asChild size="sm" variant="outline" className="gap-1.5">
                  <a href={`/manus-storage/${f.storageKey}`} target="_blank" rel="noreferrer" download={f.filename}>
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${f.filename}"?`)) {
                        deleteMutation.mutate({ id: f.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
