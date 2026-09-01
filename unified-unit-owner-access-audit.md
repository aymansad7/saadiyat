# Unified Units, Owners, Files, Availability and Access Audit

**Status:** Design baseline, 30 Aug 2026.  
**Scope:** All property cards, Interactive Map panels, Listings, owner records, owner documents, availability, publication history, and delegated viewing/editing permissions.

## Current state

`villa_listings` is the operational record currently used by the Listings workspace, property cards, and map merge. It already holds editable availability, asking price, rental fields, owner name/phone/email, and a per-edit audit entry. `availability_listings` is intentionally a separate source-aware read model for NAS, Aldar, other brokers, and manual availability; it must remain separate so a manual resale edit cannot overwrite an Aldar or broker record.

OneDrive `unit_documents` is metadata-only. A document links to `villaKey`, records its Microsoft drive item and classification, and limits public card links to brochure, floorplan, or marketing items. SPA and owner documents remain Master Admin documents. The underlying file stays in OneDrive.

## Gaps preventing a fully unified model

| Area | Current behaviour | Required unification |
|---|---|---|
| Owner record | Owner fields are repeated directly on `villa_listings`. Hidd owner data is additionally served from a protected static source. | Create an owner record with a stable internal ID, then link it to one or more exact unit identities. Never create a link from name, phone, price, or area alone. |
| Owner files | Documents point to a unit but not to an owner relationship. | Add an optional owner link to each protected document and return it only to authorised callers. |
| Publication | `createdAt` and `updatedBy` exist, but publication is inferred from status. | Store the first time the operational resale status becomes Available, its actor, and optional last-published actor/date. Preserve all audit events. |
| Delegation | Grants are limited to area, project, and phase plus original-price/name/phone/edit flags. | Add optional building and unit-type/bedroom filters, plus separate document and owner-file visibility flags. A grant is a narrowing scope, never a broader fallback. |
| Map | Map merges static/base records, `villa_listings`, and an Hidd-only protected side channel. | Use the common owner read model for all projects. Retain Hidd’s source data as an import source until a source-backed one-time owner-to-unit import is explicitly reviewed. |

## Canonical identity and source rules

The stable key is the existing canonical `villaKey` plus its `community`; where a developer source includes its own project/unit key, that external key is preserved as provenance rather than replacing the canonical key. Building, bedroom count, unit type, and phase are source facts used for filtering grants. They do not establish an owner match.

The only valid owner attachment paths are an explicit Master Admin selection of the exact unit, or a supplied owner file/data source that identifies the exact `villaKey`, developer unit identifier, or DMT plot number. An ambiguous area match remains unmatched and visible for review, not attached to a property.

## Visibility policy

Master Admin receives the full owner record and protected owner documents when actively using the authorised view. Standard users must satisfy every populated grant constraint: area/project, phase, building, and unit category. A granted user receives only the fields whose dedicated flags are true. Public endpoints never return owner identity, phone, email, owner-document links, internal notes, or unpublished audit data.

## Implementation sequence

1. Add owner and exact owner-unit relation tables, protected document owner reference, and publication metadata on the operational profile.
2. Extend access grants and resolution to building/type filters and field-specific owner-document privileges.
3. Add Master Admin owner workspace and exact-unit attachment workflow, including an import-review queue for supplied project owner files.
4. Merge the authorised common owner read model into Listings and map cards, leaving non-matched records blank and source-labelled.
5. Test identity, privacy, grant intersections, publication history, document visibility, and map/card/list consistency before publishing.
