export type LagoonsGooglePlanRow = {
  source_file: string;
  source_sheet: string;
  source_row: number;
  source_unit: string;
  owner_phone: string | null;
  source_project: string;
  status: "linked" | "unlinked" | "conflict";
  reason: string;
  villa_key?: string;
  snapshot?: {
    stage?: string | null;
    offeringType?: string | null;
    responsiblePerson?: string | null;
    community?: string | null;
    subCommunity?: string | null;
    buildingName?: string | null;
    listingAvailability?: string | null;
    bedrooms?: string | number | null;
    offeringPrice?: string | number | null;
    propertyType?: string | null;
    product?: string | null;
    price?: string | number | null;
    quantity?: string | number | null;
  };
};

export type ExistingPrimaryOwner = {
  id: number;
  displayName: string;
  phone: string | null;
  email: string | null;
};

export type PreparedGoogleOwnerRecord = LagoonsGooglePlanRow & {
  ownerId: number | null;
  community: "lagoons" | null;
  matchStatus: "linked" | "unlinked" | "conflict";
  matchReason: string;
};

function phoneKey(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (/^00971\d{9}$/.test(digits)) return digits.slice(2);
  if (/^0?5\d{8}$/.test(digits)) return `971${digits.replace(/^0/, "")}`;
  return digits;
}

/**
 * The Google sheet does not provide an owner name. A row can therefore enrich
 * an existing owner only after a previously reviewed owner-to-unit relation and
 * a single canonical unit key both exist. A phone number is never used to find
 * a unit or to create an owner record.
 */
export function prepareLagoonsGoogleOwnerRecords(
  rows: LagoonsGooglePlanRow[],
  ownerByVilla: Map<string, ExistingPrimaryOwner[]>,
) {
  const prepared: PreparedGoogleOwnerRecord[] = rows.map(row => {
    if (row.status !== "linked" || !row.villa_key) {
      return {
        ...row,
        ownerId: null,
        community: null,
        matchStatus: row.status,
        matchReason: row.reason || "no_unique_documented_unit_key",
      };
    }
    const owners = ownerByVilla.get(row.villa_key) ?? [];
    if (owners.length !== 1) {
      return {
        ...row,
        ownerId: null,
        community: "lagoons",
        matchStatus: owners.length ? "conflict" : "unlinked",
        matchReason: owners.length
          ? "multiple_existing_primary_owner_relations_for_exact_unit"
          : "exact_unit_key_but_no_previously_reviewed_owner_relation",
      };
    }
    const owner = owners[0];
    const incomingPhone = phoneKey(row.owner_phone);
    const currentPhone = phoneKey(owner.phone);
    if (incomingPhone && currentPhone && incomingPhone !== currentPhone) {
      return {
        ...row,
        ownerId: owner.id,
        community: "lagoons",
        matchStatus: "conflict",
        matchReason: "google_crm_phone_conflicts_with_reviewed_owner_record",
      };
    }
    return {
      ...row,
      ownerId: owner.id,
      community: "lagoons",
      matchStatus: "linked",
      matchReason: incomingPhone
        ? "exact_unit_key_and_reviewed_owner_relation"
        : "exact_unit_key_and_reviewed_owner_relation_phone_blank_in_source",
    };
  });

  const phonesByOwner = new Map<number, Set<string>>();
  for (const row of prepared) {
    if (row.matchStatus !== "linked" || !row.ownerId || !row.owner_phone) continue;
    const digits = phoneKey(row.owner_phone);
    if (!digits) continue;
    const values = phonesByOwner.get(row.ownerId) ?? new Set<string>();
    values.add(digits);
    phonesByOwner.set(row.ownerId, values);
  }
  for (const row of prepared) {
    if (row.matchStatus !== "linked" || !row.ownerId) continue;
    if ((phonesByOwner.get(row.ownerId)?.size ?? 0) > 1) {
      row.matchStatus = "conflict";
      row.matchReason = "multiple_google_crm_phone_values_for_same_reviewed_owner";
    }
  }
  return prepared;
}

/**
 * The supplied Google workbook is the current CRM snapshot. A record may
 * update a card only after its exact unit and previously reviewed owner link
 * have both been established. Where a unit appears more than once, the final
 * source row is its current CRM row while earlier rows are retained in history.
 */
export function latestGoogleCardRows(rows: PreparedGoogleOwnerRecord[]) {
  const byVilla = new Map<string, PreparedGoogleOwnerRecord[]>();
  for (const row of rows) {
    if (!row.villa_key || !row.ownerId) continue;
    if (row.matchStatus !== "linked" && row.matchStatus !== "conflict") continue;
    byVilla.set(row.villa_key, [...(byVilla.get(row.villa_key) ?? []), row]);
  }
  return Array.from(byVilla.entries()).map(([villaKey, values]: [string, PreparedGoogleOwnerRecord[]]) => ({
    villaKey,
    current: values.slice().sort((a: PreparedGoogleOwnerRecord, b: PreparedGoogleOwnerRecord) => b.source_row - a.source_row)[0],
    previous: values.slice().sort((a: PreparedGoogleOwnerRecord, b: PreparedGoogleOwnerRecord) => a.source_row - b.source_row).slice(0, -1),
  }));
}
