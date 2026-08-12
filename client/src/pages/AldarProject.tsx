/**
 * /aldar-saadiyat/:project — Project page with buildings list via tRPC.
 */
import { useMemo, useState } from "react";
import { Redirect, useParams, Link } from "wouter";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Switch } from "@/components/ui/switch";
import { actionableCount } from "@/data/aldar";
import type { StatusBreakdown } from "@/data/aldar";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { trpc } from "@/lib/trpc";

export default function AldarProject() {
  const { project: slug } = useParams<{ project: string }>();
  const { data: project, isLoading } = trpc.aldarSaadiyat.getProject.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug },
  );
  const [availableOnly, setAvailableOnly] = useState(false);

  const buildings = useMemo(() => {
    if (!project) return [];
    if (availableOnly) return project.buildings.filter((b: any) => actionableCount(b.breakdown) > 0);
    return project.buildings;
  }, [project, availableOnly]);

  if (isLoading) {
    return (<div className="min-h-screen bg-background flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center"><div className="text-muted-foreground font-mono text-sm">Loading...</div></div></div>);
  }
  if (!project) return <Redirect to="/aldar-saadiyat" />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`Aldar · ${project.name}`} />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <Link href="/aldar-saadiyat" className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary hover:underline mb-2 inline-block">← All projects</Link>
          <h1 className="font-display text-3xl sm:text-[2.4rem] leading-tight text-foreground">{project.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{project.building_count} buildings · {project.unit_count} units</p>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">Available only</span>
            </label>
          </div>
        </div>
      </section>
      <section className="container py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b: any) => {
            const bd = b.breakdown as StatusBreakdown;
            const live = actionableCount(bd);
            const bld = buildingDisplayName(b.name);
            return (
              <Link key={b.slug} href={`/aldar-saadiyat/${slug}/${b.slug}`} className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-primary"><Building2 className="h-3 w-3" />{bld.primary}</div>
                    {live > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-sm">{live} live</span>) : (<span className="text-[0.65rem] font-mono uppercase border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">Sold out</span>)}
                  </div>
                  {bld.secondary && <p className="text-xs text-muted-foreground mb-2">{bld.secondary}</p>}
                  <div className="text-[0.72rem] font-mono text-muted-foreground">{b.unit_count} units</div>
                  <div className="mt-3 pt-3 border-t border-border/60"><AldarStatusPills breakdown={bd} size="xs" /></div>
                  <div className="mt-3 flex items-center justify-end text-[0.72rem] font-mono uppercase text-primary">View units <ArrowRight className="ml-1 h-3 w-3" /></div>
                </div>
              </Link>
            );
          })}
        </div>
        {buildings.length === 0 && (<div className="text-center text-muted-foreground py-10">No buildings match your filter.</div>)}
      </section>
    </div>
  );
}
