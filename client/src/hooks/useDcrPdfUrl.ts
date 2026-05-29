/**
 * useDcrPdfUrl — resolves the DCR PDF URL for a given villaKey from our own
 * S3-backed file storage (via tRPC `files.listByVilla`).
 *
 * Returns the first matching file's `url` (e.g. `/manus-storage/dcr/...pdf`).
 * Falls back to `null` if nothing is found.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export function useDcrPdfUrl(villaKey: string | null | undefined) {
  const enabled = Boolean(villaKey);
  const query = trpc.files.listByVilla.useQuery(
    { villaKey: villaKey ?? "" },
    { enabled, staleTime: 5 * 60 * 1000 },
  );

  const url = useMemo<string | null>(() => {
    if (!query.data || query.data.length === 0) return null;
    // Prefer DCR category, otherwise first PDF
    const dcr = query.data.find(
      (f) => f.category === "dcr" && f.mimeType === "application/pdf",
    );
    const fallback = query.data.find((f) => f.mimeType === "application/pdf");
    const file = dcr ?? fallback ?? query.data[0];
    if (!file?.storageKey) return null;
    return `/manus-storage/${file.storageKey}`;
  }, [query.data]);

  return {
    url,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  } as const;
}
