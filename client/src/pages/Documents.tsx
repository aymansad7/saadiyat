import { FilesPanel } from "@/components/FilesPanel";
import SiteHeader from "@/components/SiteHeader";

export default function Documents() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container py-10 max-w-4xl">
        <header className="mb-8">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-primary mb-2">
            ─── ISLAND-WIDE LIBRARY
          </p>
          <h1 className="font-display text-4xl md:text-5xl">Documents</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            A shared reference library for all of Saadiyat — master plans, regulations, brochures, photography, and any other file
            that doesn't belong to a single villa. Anyone can view and download. Sign in to upload.
          </p>
        </header>

        <FilesPanel scope="global" />
      </main>
    </div>
  );
}
