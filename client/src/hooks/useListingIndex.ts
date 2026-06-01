/**
 * useListingIndex — bulk-fetch villa listings for an entire community (or
 * gate-prefix on SBV) in a single tRPC round-trip, then expose a
 * `Map<villaKey, listing>` lookup the calling page can pass into each card.
 *
 * Mirrors the shape of `useDcrPdfIndex` so the two can be combined.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export type ListingIndexEntry = {
  villaKey: string;
  community: string;
  askingPriceAed: number | null;
  status:
    | "draft"
    | "available"
    | "warm"
    | "reserved"
    | "sold"
    | "off-market"
    | null;
  listingPartners: string | null;
  publicNotes: string | null;
  ownerName?: string | null; // present only for admin viewers
};

type Args = {
  community?: string;
  prefix?: string;
};

export function useListingIndex(args: Args) {
  const enabled = Boolean(args.community || args.prefix);
  const query = trpc.villaListings.listByCommunity.useQuery(
    {
      community: args.community,
      prefix: args.prefix,
    },
    { enabled, staleTime: 60 * 1000 },
  );

  const index = useMemo<Map<string, ListingIndexEntry>>(() => {
    const map = new Map<string, ListingIndexEntry>();
    const rows = (query.data ?? []) as ListingIndexEntry[];
    for (const row of rows) {
      if (row.villaKey) map.set(row.villaKey, row);
    }
    return map;
  }, [query.data]);

  return {
    index,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
  } as const;
}
