/**
 * useDcrPdfIndex — bulk-fetch every DCR PDF for a given villaKey prefix
 * (e.g. all 156 plots in SBV Gate 2) in a single tRPC round-trip and return
 * a `Map<villaKey, url>` lookup the calling page can pass into each card.
 *
 * Why: rendering 50–156 plot cards, each with its own `useDcrPdfUrl` query,
 * would issue dozens of separate fetches. The bulk endpoint keeps it to one.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export function useDcrPdfIndex(prefix: string | null | undefined) {
  const enabled = Boolean(prefix);
  const query = trpc.files.listByPrefix.useQuery(
    { prefix: prefix ?? "" },
    { enabled, staleTime: 5 * 60 * 1000 },
  );

  const index = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    const data = query.data;
    if (!data || data.length === 0) return map;
    type Row = (typeof data)[number];
    // For each villaKey, prefer the DCR-tagged PDF, otherwise first PDF
    const byKey = new Map<string, Row[]>();
    for (const row of data) {
      if (!row.villaKey) continue;
      const arr = byKey.get(row.villaKey) ?? [];
      arr.push(row);
      byKey.set(row.villaKey, arr);
    }
    byKey.forEach((rows, key) => {
      const dcr = rows.find(
        (r: Row) => r.category === "dcr" && r.mimeType === "application/pdf",
      );
      const fallback = rows.find((r: Row) => r.mimeType === "application/pdf");
      const winner = dcr ?? fallback ?? rows[0];
      if (winner?.storageKey) {
        map.set(key, `/manus-storage/${winner.storageKey}`);
      }
    });
    return map;
  }, [query.data]);

  return {
    index,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  } as const;
}
