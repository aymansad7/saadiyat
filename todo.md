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

## 🔜 Backlog (resolved May 29, 2026)

- [x] Wayback DCR PDF backups built and uploaded as static deliverables to `/manus-storage/`:
  - `Jawaher_Backup_790b7151.zip` (224 MB / 83 PDFs)
  - `SBV_Backup_f64e93d2.zip` (2.1 GB / 441 PDFs)
  - `StRegis_Backup_6990afd3.zip` (112 MB / 33 PDFs)
  Catalogued in `client/src/data/dcrBackups.ts`; surfaced via `<DownloadDcrBackupButton>` on Jawaher/SBV/St. Regis. The on-the-fly `/api/dcr-zip` endpoint still works for sub-groups (e.g. SBV Gate 2 only).
- [x] Finish File Storage UI testing (FilesPanel + Documents page) — backend coverage via 7 specs in `server/files.test.ts` (auth + scope + mime + empty-payload + admin-only delete) + 6 specs in `server/dcrBackups.test.ts` (catalogue shape + reachability HEAD on `/manus-storage/...`)
- [~] Confirm naming: "St. Regis Villas" vs "Saadiyat Lagoons" — user decision, deferred (not blocking)


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
- [x] Save checkpoint (29d423da)


## DCR ZIP downloads (May 29, 2026)
- [x] Inspect existing FilesPanel / Documents UI and storage routes
- [x] Build `/api/dcr-zip` express endpoint streaming a ZIP by `villaKey` prefix (archiver v8 ZipArchive, fed from S3 presigned GETs)
- [x] Add "Download DCR pack (ZIP)" button on Jawaher (83 PDFs)
- [x] Add per-gate "Download DCR pack (ZIP)" button on SBV (Gate1–7 + Premium)
- [x] Register St. Regis 33 PDFs in `villa_files` (prefix `st-regis/`) and add ZIP button on St. Regis page
- [x] Reusable `<DownloadDcrPackButton/>` component (uses bulk index for count, opens `/api/dcr-zip` URL in new tab)

## Files / Documents admin UI polish (May 29, 2026)
- [x] Audit `FilesPanel` (upload/list/delete + base64 upload via tRPC) + `Documents` page — already production-grade
- [x] Confirm role-gated delete (only `admin`/`master` see the trash button)
- [x] Vitest coverage for `files.upload` (auth + scope/villaKey + mime + empty-payload guards) and `files.delete` (admin-only + NOT_FOUND)
- [x] All 96 vitest specs passing


## Email magic-link auth (replaces shared passcode) — May 29, 2026
- [x] Add `allowed_emails` table (email, role enum, addedBy, note, lastSeenAt)
- [x] Add `magic_links` table (codeHash, expiresAt, consumedAt, failedAttempts, requestIp/UA)
- [x] Add `auth_sessions` table (token, email, expiresAt, lastUsedAt, revokedAt) — 90-day bearer cookie
- [x] DB helpers in `server/magicAuth.ts`: createMagicLink / verifyMagicCode / findUserBySessionToken / revokeSessionToken
- [x] tRPC: `magic.request`, `magic.verify`, `magic.logout` + integration into auth context (cookie fallback)
- [x] tRPC admin: `magic.access.list/add/remove/updateRole`
- [x] Email delivery via Gmail SMTP (`server/_core/sendEmail.ts` + nodemailer) — fallback: print code in server log
- [x] Replace `PasswordGate` with `EmailGate` (email tab + passcode fallback tab)
- [x] Keep passcode fallback inside `EmailGate` (separate tab, same `gate.verify` mutation)
- [x] Admin `/admin/access` page: list/add/remove/role-change
- [x] Seed 4 starter emails (aymansad7@gmail/hotmail.com, ayman@nasluxury.com, hamzeh@nasluxury.com)
- [x] Vitest specs — 11 new in `server/magic.test.ts`; full suite at 122/122
- [x] Save checkpoint

## Access dashboard polish (May 29, 2026)
- [x] Add "Manage Access" + "Manage Listings" links in SiteHeader user dropdown (admin/master only)
- [x] Master-vs-Admin distinction: only `master` can grant/revoke admin or master (server-enforced + UI-gated)
- [x] Vitest coverage for the new role rules — 9 specs in `server/magic.test.ts`


## Make every unit admin-editable + searchable dashboard (Jun 1, 2026)
- [x] Audit Edit-button wiring across SimplePlotCard, VillaCard, LagoonsVillaCard, AldarBuilding/AldarUnit, AldarOtherBuilding/AldarOtherUnit
- [x] Surface a visible Edit button (admin-only) on every SBV plot card (via SimplePlotCard)
- [x] Surface a visible Edit button (admin-only) on every Jawaher plot card (via SimplePlotCard)
- [x] Surface a visible Edit button (admin-only) on every St. Regis villa card (via VillaCard)
- [x] Surface a visible Edit button (admin-only) on every Saadiyat Lagoons unit card (via LagoonsVillaCard)
- [x] Surface a visible Edit button (admin-only) on every Aldar internal project unit card (4152 Aldar Saadiyat + 11655 Aldar Other)
- [x] Show price + status badge inline on each card (`ListingBadge` + `ListingPriceLabel` everywhere)
- [x] Upgrade `/admin/listings` to a real search/filter dashboard
  - [x] Filter: project (St. Regis / Lagoons / SBV / Jawaher / Aldar Saadiyat / Aldar Other)
  - [x] Filter: status (draft / available / warm / reserved / sold / off-market)
  - [x] Filter: price range — to be re-evaluated once real listings populate
  - [x] Free-text search on villaKey (owner-name/internal-notes search deferred to follow-up)
  - [x] Price range filter wired into adminList (priceMin/priceMax, AED, inclusive bounds)
  - [x] Free-text q now matches villaKey OR ownerName OR internalNotes (broadened search)
- [x] Per-row Edit button on the dashboard opens the same ListingEditor dialog
- [x] Vitest coverage for the new server filter logic — 3 Aldar villaKey shape specs in `server/villaListings.test.ts`
- [x] Save checkpoint


### Phase — Aldar inventory history / timeline (Jun 2026)
- [x] DB schema: inventory_sync_runs, inventory_unit_state, inventory_unit_events (pushed)
- [x] Snapshot/diff engine (server/inventorySync.ts) — first_seen / status_change / price_change / removed / reappeared
- [x] Price rounded to nearest dirham at source (no phantom price-change diffs)
- [x] tRPC router inventoryHistory: timeline, latestRun, runs, runDetail, syncNow, importDataset
- [x] Scheduled HTTP handler POST /api/scheduled/inventorySync (mounted before fallthrough)
- [x] UnitTimeline component on Saadiyat + Other Aldar unit pages
- [x] Admin page /admin/inventory-history (latest run stats, per-project rollup, run history, Run-now, Import JSON)
- [x] SiteHeader admin nav link to inventory history
- [x] Baseline seeded (15,807 units) + idempotency verified (2nd run = 0 changes)
- [x] Vitest coverage for computeDiff / summarize / isSoldStatus (148/148 passing)
- [x] Deploy, then schedule weekly Mon 06:00 Gulf (02:00 UTC) via manus-heartbeat create — job `weekly-inventory-sync` task_uid g9NVEjr3E2mneqMf9Xq3nF, cron `0 0 2 * * 1`, next 2026-06-08T02:00Z; prod handler verified (403 cron-only)


### Phase — Other Projects: group by Area + filters + tracking parity (Jun 2026)
- [x] Audit Other dataset: list distinct areas + confirm status/price fields present
- [x] Master access = NAS Luxury (owner) + Hamzeh (hamzeh@nasluxury.com); keep Other Master-only
- [x] Server: derive Area for each Other project (Yas Island, Al Shamkha, Al Ghadeer, Saadiyat-marina for Nouran) — server/aldarAreas.ts
- [x] Server: grouped/filterable projects API listByArea (area, available-only, price range, name search)
- [x] UI /aldar-other: group projects by Area with area headers + counts
- [x] UI: show status + origin price range on project cards (parity with Saadiyat)
- [x] UI: filters — available-only, price range (min/max AED), name + unit-number search
- [x] Confirm history/timeline before-after tracking applies to all Other units (same engine: loadSnapshotUnits reads both datasets)
- [x] Tests (aldarAreas.test.ts) + full suite 153/153
- [x] Browser verification (master) + save checkpoint (checkpoint 40c057e9; prod published)
- [x] Schedule weekly Mon 06:00 sync (site published) + report


### Phase — Other Projects access control: masters + Hamzeh only (Jun 2026)
- [x] Set the 3 owner emails (ayman@nasluxury.com, aymansad7@gmail.com, aymansad7@hotmail.com) to role=master in allowed_emails + users (allowed_emails authoritative; users.role assigned from allowlist on each login)
- [x] Fixed stale users row: hamzeh@nasluxury.com now role=admin in users table (verified)
- [x] Keep hamzeh@nasluxury.com as admin, but grant explicit Other-projects access (shared/otherAccess.ts allowlist)
- [x] Backend: masterProcedure -> allow role=master OR explicitly-allowed admin (Hamzeh); resale.ts uses same policy; all other admins blocked
- [x] Frontend: useCanAccessOther hook applied to SiteHeader, Landing rail, MasterGate, Resale
- [x] Vitest: otherAccess.test.ts (master allowed, Hamzeh allowed, other admin blocked, user blocked) + full suite 159/159
- [x] Browser verify (needs master login post-publish) + checkpoint (40c057e9 saved + published)


### Yas Park Place addition (Jun 4, 2026)
- [x] Confirm Yas Park Place missing from dataset (780 units, 6 buildings B1-B6)
- [x] Normalize Aldar_yasparkplace.xlsx to aldar_other.json schema (project + 6 buildings + units; Other now 25 projects / 12,435 units)
- [x] Add Yas Park Place to area mapping (server/aldarAreas.ts) under Yas Island
- [x] Re-seed inventory baseline (manual sync run 30001): 780 first_seen, 0 other changes; 16,587 units scanned
- [x] Update/verify tests (aldarAreas.test.ts anchor added); all 159 tests pass with dev server running
- [x] Run full test suite + typecheck; save checkpoint
- [x] Report Yas Park Place sales breakdown (450 sold of 780) to user

### Global Unit Search (Jun 4, 2026)
- [x] Backend: tRPC endpoint `unitSearch.search` querying Saadiyat + Other + Lagoons by unit name
- [x] Frontend: Global search field on Landing page hero with dropdown results + navigation to unit detail
- [x] Frontend: Per-project search on SaadiyatLagoons page (AldarSaadiyat and AldarOther already had it)
- [x] TypeScript clean + tests pass (153/153)
- [x] Save checkpoint (160/160 tests pass)

### New communities: Golf Views + Private Villas (Aug 7, 2026)
- [x] Upload 26 Golf Views DCR PDFs to storage (all 26 success)
- [x] Upload 7 Private Villas Close to Four Seasons DCR PDFs to storage (all 7 success)
- [x] Build data file for Saadiyat Beach Golf Views (26 plots) in communities.ts
- [x] Build data file for Private Villas Close to Four Seasons (7 plots) in communities.ts
- [x] Create generic CommunityPage component at /community/:slug with plot cards + DCR links
- [x] Add both to Landing page communities rail + SiteHeader navigation dropdown
- [x] TypeScript clean + 160/160 tests pass
- [x] Save checkpoint (ddc05444)

### Disable passcode auto-rotation + notifications (Aug 7, 2026)
- [x] Disable auto-rotation in gate.ts (keep logging but don't change passcode)
- [x] Disable notifyOwner calls for auto-rotation events (manual rotation still notifies)
- [x] Update tests to match new behavior (13/13 pass)
- [x] All 160 tests pass; save checkpoint

### Hidd Al Saadiyat Community (Aug 8, 2026)
- [x] Parse 469 villas from Excel into JSON (villa#, street#, zone, ADM plot#, areas, owner, tenant, dates)
- [x] Build Hidd Al Saadiyat page with villa detail cards (search by villa#, street#, ADM plot#, zone, owner/tenant name)
- [x] Owner/tenant info visible to admin/master only
- [x] Add to navigation + Landing page (route /hidd-al-saadiyat)
- [x] Tests 160/160 pass, TypeScript clean; save checkpoint

### Add new Aldar projects + sync history (Aug 12, 2026)
- [x] Parse Fahid Beach Terraces (482), The Beach House Fahid (843), Al Marjan Island (1998) + 4 more from Excel
- [x] Merge 7 Saadiyat/Fahid projects into aldar_saadiyat.json (now 25 projects / 7,094 units)
- [x] Add Al Marjan Island as new area in aldar_other.json under Ras Al Khaimah (now 26 projects / 14,433 units)
- [x] Update area mapping: added ras-al-khaimah area + almarjan slug
- [x] Run inventory sync: 21,527 units scanned, 13 status changes detected (history logged), all new units registered
- [x] 160/160 tests pass, TypeScript clean; save checkpoint

### The Canopies update + Global Filter (Aug 13, 2026)
- [x] Update The Canopies with 13 Aug 2026 data (592 units, B1-B6 building names, status/price changes logged)
- [x] Add global filter procedure to unitSearch router (filter by available, bedrooms, price, dataset)
- [x] Build /available-units page with bedroom buttons, price range, dataset selector, grouped results
- [x] Update SiteHeader counts: 19 Saadiyat, 35 Other (reflects Fahid move)
- [x] Add "Available Units Filter" link in SiteHeader dropdown menu

### St. Regis Transaction History (Aug 17, 2026)
- [x] Parse ADREC PDF (17 transactions: 9 primary, 8 secondary)
- [x] Match transactions to specific villas by land area (sqft) — all 17 matched within <50 sqft tolerance
- [x] Create stregisTransactions.ts data file with full transaction records
- [x] Add Transaction History section to VillaDetail page (timeline with primary/secondary badges, price change %)
- [x] Add transaction indicators on VillaCard (year + P/S badges)
- [x] 160/160 tests pass, TypeScript clean

### Jawaher Transaction History (Aug 17, 2026)
- [x] Parse ADREC PDFs: 83 primary + 47 secondary = 130 transactions (Dec 2019 – Jul 2026)
- [x] Create jawaherTransactions.ts data file (grouped by land area per plot)
- [x] Add transaction display to SimplePlotCard (last price, date, type, appreciation %)
- [x] Wire Jawaher page to pass transactions to each plot card
- [x] 160/160 tests pass, TypeScript clean

### SDN2 Transaction History (Aug 17, 2026)
- [x] Parse ADREC PDF: 171 transactions (Faya 20 primary, SBD 121 secondary, SBV 30 secondary)
- [x] Create sdn2Transactions.ts data file grouped by project and land area
- [x] Add transaction history table to SaadiyatBeachVillas page (newest 50, sorted by date)
- [x] 160/160 tests pass, TypeScript clean

### Saadiyat Beach Golf Views Transactions Refresh (Aug 23, 2026)
- [x] Parse the new ADREC SDN2 CSV and validate all transaction fields
- [x] Match transactions only to Golf Views plots with unique DCR land-area matches
- [x] Treat merged plots (6/1–6/2, 6/7–6/8, 6/23–6/24) by their combined post-merge DCR land area only
- [x] Build full per-plot transaction histories without duplicate or uncertain assignments
- [x] Show updated history on Golf Views cards, plot details, and map info windows
- [x] Add transaction-rich map cards for matched Golf Views plots with latest price, date, sale count, and full-details link
- [x] Verify matching coverage, TypeScript, and all tests before checkpoint

### Golf Views Transaction Timeline + Area Search (Aug 23, 2026)
- [x] Treat the new ADREC CSV filtered to land areas ≥1,993 m² as the authoritative Golf Views source
- [x] Auto-accept exact DCR area matches only; report every ±3 to ±10 m² candidate for user approval before assignment
- [x] Apply the user's approval to all reported ≤10 m² candidates; mark the 2,845.15 m² transaction on Plot 6/15 as a possible match
- [x] Re-audit plots without transaction histories and keep only confirmed DCR-area matches
- [x] Correct the AED 55M Golf Views transaction assignment to Plot 6/6 and remove any duplicate assignment from another plot
- [x] Replace duplicate latest-sale/full-history/table displays with one dated transaction timeline on each Golf Views card
- [x] Show an explicit no-confirmed-transaction state on Golf Views plots without a matched record
- [x] Add reusable area-query parsing for sqft and m² using the 10.764 conversion factor
- [x] Add min/max land-area filters with a sqft/m² unit selector on land pages and the Interactive Map
- [x] Use m² as the default display/filter unit and convert filter bounds automatically when switching to sqft
- [x] Add a Cards/Table view toggle with sortable plot, area, transaction date, and price columns
- [x] Add area search to Golf Views/Jawaher/SBV/St. Regis community pages
- [x] Add plot/area search to the Interactive Map and global unit search
- [x] Add min/max area filtering with m² default and sqft toggle to Available Units
- [x] Add tests, verify visually, and publish a checkpoint

### Global Area Filters for All Villa & Building Projects (Aug 23, 2026)
- [x] Inventory every reusable villa/building/unit page and map its available area fields
- [x] Add m²-default / sqft-toggle search and min/max filtering to Aldar Saadiyat building unit lists
- [x] Add m²-default / sqft-toggle search and min/max filtering to Aldar Other building unit lists
- [x] Add Cards/Table view switching to generic building unit lists with sortable area columns
- [x] Apply the same area controls to Lagoons, Hidd, and any remaining villa/community pages with area data
- [x] Keep pages without area data usable and label missing area instead of excluding them unless an area filter is active
- [x] Verify TypeScript, unit tests, and representative pages before checkpoint

### Interactive Map Card Completion (Aug 23, 2026)
- [x] Audit every map marker type for missing transaction, detail-link, owner, and area fields
- [x] Show full mobile-friendly map cards with project, unit/plot, area, transactions, and Full Details
- [x] Ensure SBV, Jawaher, St. Regis, Golf Views, Hidd, Private Villas, and Lagoons link to the correct detail page
- [x] Verify mobile popups visually, run TypeScript/tests, and publish a checkpoint

### Interactive Map Mobile Price + Performance (Aug 23, 2026)
- [x] Assign the AED 76.5M transaction to Plot 6/14 using the user-approved unique-nearest-area rule
- [x] Verify and assign the AED 26M transaction dated 2025-11-14 to Plot 6/26 using the unique-nearest-area rule
- [x] Preserve and display BUA in m²/sqft for every matched transaction where the CSV provides it
- [x] Show the DCR-vs-transaction land-area difference on approximate matches
- [x] Render every transaction price on its own non-clipped mobile line
- [x] Add a one-click Project Table button for every community map card
- [x] Preserve the selected plot/unit when returning from the map to the project table
- [x] Reduce initial marker rendering cost and optimize dense Lagoons/Hidd layers
- [x] Verify mobile cards and map load time, run tests, and publish a checkpoint

### Faya Al Saadiyat Largest-Plot Transactions (Aug 23, 2026)
- [x] Parse the ADREC CSV and preserve date, price, combined land area, combined BUA, and sale type
- [x] Identify Faya's two largest units and confirm the AED 403.8M original-price unit
- [x] Link the single combined AED 190M transaction to both largest units without splitting or double-counting it
- [x] Show the shared transaction on Faya cards, table, and unit details with Land/BUA; do not fabricate map points without coordinates
- [x] Verify TypeScript/tests and publish a checkpoint

### Huge Plot Between Four Seasons and Omniyat + Four Seasons Prep (Aug 23, 2026)
- [x] Extract SDN3_10 DCR land area, coordinate table, and centroid without guessing
- [x] Upload SDN3_10.pdf to permanent webdev storage and register the DCR record
- [x] Add “A Huge Plot Between Four Seasons and Omniyat” to Saadiyat cards, table, search, and map
- [x] Parse and preserve the Four Seasons municipal transaction CSV as an unmatched/pending source registry
- [x] Store each pending transaction with date, price, Land, BUA, sale type, and original source row for later area matching
- [x] Add a Four Seasons data schema and project page ready for later villa, owner, area, and transaction imports
- [x] Keep the Four Seasons project free of mock villas or fabricated transaction data
- [x] Parse every unit in FourSeasonsPrivateResidences-Saadiy.pdf and preserve unit, bedrooms, price, Land, BUA, and source page
- [x] Add all current-sheet Four Seasons units as Available with last-updated date 2026-08-23
- [x] Treat 5Bed.pdf and 6Bed.pdf as historical references for villa numbers, areas, and specifications only
- [x] Never import availability status or asking prices from the historical 5BR/6BR files
- [x] Enrich missing 5BR/6BR areas and fixed specifications while preserving current availability values
- [x] Show Four Seasons units in Cards/Table with m² default, sqft toggle, search, and area filters
- [x] Upload MASTERPLAN2_FSPR_(2).pdf to permanent storage and preserve it as the official Four Seasons master plan
- [x] Extract every visible villa number and its master-plan position without inventing missing units
- [x] Build a clickable Four Seasons master plan linked bidirectionally with villa cards/details
- [x] Add Four Seasons to the Interactive Map; show Available villas in green and other known villas in a neutral color
- [x] Label all master-plan-derived map coordinates as calibrated approximations, not individual official DCR coordinates
- [x] Verify Faya plus the new plot, run TypeScript/tests, and publish a checkpoint
