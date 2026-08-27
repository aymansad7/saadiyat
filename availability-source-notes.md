# Availability Source Notes

The **Other brokers** availability view is populated only from the repository's documented PropertyFinder snapshot dated **18 Aug 2026**. It currently contains 26 records across Jawaher, St. Regis, and Saadiyat Beach Villas. Every record retains its direct PropertyFinder URL. Only the five Jawaher rows with an explicit, documented `matchedVillaKey` expose an internal property-card link; all other broker records expose their original source link only.

The **Aldar Resale** source remains distinct from Aldar developer inventory. Developer inventory is shown in the Sales & Inventory Sync desk directly from the complete deployed Aldar snapshot, while Aldar resale represents curated resale records only. The direct snapshot avoids collapsing same-named units that occur in different projects under the legacy state table's unit-name-only key.

The **Available with NAS Luxury** source is now computed from every `villa_listings` row with the stored status `available`, with existing admin-verified NAS records preserved and deduplicated by a canonical identity. Changing a property status away from `available` removes the computed NAS result immediately without creating a duplicate write path.
