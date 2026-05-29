# Saadiyat Multi-Community Build — Todo

## ✅ Completed (historical)

### Phase 1 — Website restructure (Apr 2026)
- [x] Generate plot manifest (529 villas) with direct DMT URLs
- [x] Build `/jawaher` page (83 plots)
- [x] Build `/saadiyat-beach-villas` page with gate tabs
- [x] Update Landing page (live communities)
- [x] Update SiteHeader nav
- [x] Verify routes load + PDF/MyLand links

### Phase 3 — DMT PDF coverage (Apr 2026)
- [x] Jawaher 83 (SDN1_49 → 131)
- [x] Gate 1 — 25
- [x] Gate 2 — 156
- [x] Gate 3 — 65
- [x] Gate 4 — 59
- [x] Premium Villas — 15
- [x] Gate 7 — 126

### Password Gate (Apr 21, 2026)
- [x] Create PasswordGate component
- [x] Persist auth in sessionStorage
- [x] Wrap App routes with the gate
- [x] Use password value `062026`
- [x] Style the gate to match design

### Aldar Lagoons enrichment (May 20, 2026)
- [x] Inspect Aldar_lagoons.xlsx columns
- [x] Define matching key between Aldar rows and Lagoons villas
- [x] Update Lagoons data file with new fields
- [x] Show new fields on Lagoons cards/detail

### Lagoons villa detail — Key Facts hero (May 20, 2026)
- [x] Add Key facts hero block
- [x] Rename "Selling price" → "Original price (without add-ons)"
- [x] Remove duplicates from secondary Aldar inventory grid

### Aldar All Saadiyat projects browser (May 21, 2026)
- [x] Profile Aldar_*.xlsx workbooks
- [x] Build dataset: ProjectGroup → Project → Building → Unit
- [x] Map sub-buildings (Mamsha Gardens, Art House, Louvre, Barakat, Grove, Source, Faya, Manarat)
- [x] Index page /aldar-saadiyat with filters
- [x] Project / Building / Unit pages
- [x] Vitest coverage

### Public Resale Filter → Admin-only (May 27, 2026)
- [x] Add `/resale-search` page
- [x] `publicResale` → `adminProcedure` (admin-only)
- [x] Source / area / bedrooms / price / search / sort filters
- [x] Admin guard on PublicResaleSearch page
- [x] Vitest coverage

### NAS Luxury Lagoons listings (May 27–28, 2026)
- [x] Extract 9 villa numbers + asking price + extras from PDF
- [x] Persist as `nas_luxury_lagoons.json`
- [x] Add `nas-luxury` source to public resale router
- [x] Show "Available with NAS Luxury" filter pill
- [x] Vitest coverage

### Status filter + Google Maps fix (May 28, 2026)
- [x] Revert Lagoons coordinates to original values
- [x] Status filter on Lagoons cluster pages
- [x] Status filter on Lagoons community landing
- [x] Status filter on Landing (all communities)

### Community-agnostic availability system (May 28, 2026)
- [x] DB schema: `availability_listings` table
- [x] Push schema with `pnpm db:push`
- [x] Seed Lagoons NAS Luxury (9 villas)
- [x] tRPC admin procedures (list/create/update/delete)
- [x] tRPC summary procedure (per community per status)
- [x] Admin page `/admin/availability`
- [x] Status filter on Landing reads from DB
- [x] Display "Last updated: {date}" on listings
- [x] Vitest coverage (admin guard + summary)

---

## 🔜 Backlog (deferred — not requested for current session)

- [ ] Wayback DCR PDF backups: bundle 562 PDFs into `StRegis_Backup.zip` + `Jawaher_Backup.zip` + `SBV_Backup.zip` (Phase 4 from May 8, 2026)
- [ ] Finish File Storage UI testing (FilesPanel + Documents page)
- [ ] Confirm naming: "St. Regis Villas" vs "Saadiyat Lagoons" (cosmetic decision)


## DCR PDFs migration to DB-hosted (May 28–29, 2026)
- [x] Inventory all DCR PDF URLs for Jawaher + SBV (St. Regis already on S3 via `client/src/data/villas.ts.pdfLocalUrl`)
- [x] Download 524/529 PDFs directly from DMT (5 plots return 404 on DMT — acceptable)
- [x] Reuse existing `villa_files` DB table instead of building a new `documents` table
- [x] `scripts/upload_pdfs_to_storage.mjs` uploads via Forge presigned PUTs and inserts into `villa_files` (524 rows, category=`dcr`)
- [x] Add `files.listByVilla` and `files.listByPrefix` tRPC procedures (publicProcedure)
- [x] Add `useDcrPdfUrl` and `useDcrPdfIndex` client hooks (single + bulk)
- [x] Wire SBV Gate tabs and Jawaher landing to bulk-fetch DCR PDFs from DB
- [x] `SimplePlotCard` opens PDF from DB (`/manus-storage/...`); shows “DCR not available” when missing
- [x] Relax villaKey regex on `files.*` procedures to accept mixed case keys (e.g. `Plot-100`, `Gate2-Plot-1`)
- [x] Vitest coverage — 6 new tests in `server/files.test.ts`, total 88/88 passing
- [ ] Save checkpoint
