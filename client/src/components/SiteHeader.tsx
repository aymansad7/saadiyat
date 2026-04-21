/**
 * Coastal Atelier — site header
 * Editorial wordmark "Saadiyat" with breadcrumb-style sub-label.
 */
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  subTitle?: string;
  back?: { href: string; label: string };
}

export default function SiteHeader({ subTitle, back }: Props) {
  const [location] = useLocation();
  const showHomeLink = location !== "/";
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3 sm:py-4 flex items-center gap-4">
        {back && (
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href={back.href}>
              <ArrowLeft className="h-4 w-4" />
              <span>{back.label}</span>
            </Link>
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Saadiyat
            </div>
            {subTitle && (
              <div className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                {subTitle}
              </div>
            )}
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {showHomeLink && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
              <Link href="/">Home</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="bg-card border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/st-regis">St. Regis Villas</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
