/**
 * /aldar-saadiyat/:project
 *
 * Project page — lists the project's sub-buildings (e.g. Mamsha Gardens →
 * B1..B7, The Art House → R10..R12, The Grove → Heart 1..5 with marketing
 * names overridden via buildingLabels).
 */
import { useMemo, useState } from "react";
import { Redirect, useParams, Link } from "wouter";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Switch } from "@/components/ui/switch";
import { getAldarProject } from "@/data/aldar";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";

export default function AldarProject() {
  const { project: slug } = useParams<{ project: string }>();
  const project = slug ? getAldarProject(slug) : undefined;
  const [availableOnly, setAvailableOnly] = useState(false);
  const buildings = useMemo(() => {
    if (!project) return [];
    if (availableOnly) return project.buildings.filter(b => b.available_count > 0);
    return project.buildings;
  }, [project, availableOnly]);

  if (!project) return <Redirect to="/aldar-saadiyat" />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`Aldar · ${project.name}`}
        back={{ href: "/aldar-saadiyat", label: "All Aldar projects" }}
      />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Aldar Saadiyat
          </div>
          <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
            {project.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {project.building_count} buildings
            </span>
            <span>·</span>
            <span className="num-display">{project.unit_count} units</span>
            <span>·</span>
            <span className="num-display text-primary">
              {project.available_count} available now
            </span>
          </div>
          <div className="mt-5">
            <label className="inline-flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">
                Available only ({project.available_count})
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map(b => {
            const dn = buildingDisplayName(b.name);
            const isLive = b.available_count > 0;
            return (
              <Link
                key={b.slug}
                href={`/aldar-saadiyat/${project.slug}/${b.slug}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-primary">
                      <Building2 className="h-3 w-3" /> Building
                    </div>
                    {isLive ? (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">
                        {b.available_count} available
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                        Sold out
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                    {dn.primary}
                  </h2>
                  {dn.secondary && (
                    <div className="text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      {dn.secondary}
                    </div>
                  )}
                  <div className="mt-2 text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground num-display">
                    {b.unit_count} units
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[0.72rem] font-mono uppercase tracking-[0.18em] text-primary">
                    View units <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {buildings.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No buildings match your filter.
          </div>
        )}
      </section>
    </div>
  );
}
