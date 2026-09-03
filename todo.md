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

### Four Seasons 5BR/6BR Municipal Transaction Matching (Aug 23, 2026)
- [x] Assign the AED 350M municipal sale dated 2026-08-20 to Four Seasons Villa 9 as a user-confirmed match
- [x] Extract official plot and sellable areas from the developer Floorplan PDFs for Villas 14, 15, 16, 20, 21, 37, 38, 39, 40, 43, and 44
- [x] Extract official plot and sellable areas from the developer Floorplan PDFs for Villas 12, 13, 25, 27, 29, 31, 33, 48, and 50
- [x] Register each new 5BR/6BR developer Floorplan PDF under its Four Seasons villa key and expose it from the villa card without labeling it as a municipal DCR
- [x] Re-audit every historical 5BR/6BR villa land area against the 15 pending municipal transaction rows
- [x] Match a transaction only when the official land area identifies one unique villa within a documented tolerance
- [x] Keep repeated land areas and unmatched rows unassigned; label non-exact compatible candidates as Possible only
- [x] Add confirmed and Possible Four Seasons transaction timelines to villa cards, table rows, master plan, and map detail cards
- [x] Add regression tests proving historical prices/statuses remain excluded and no transaction is duplicated
- [x] Verify TypeScript, 188 tests, and desktop/mobile UI before publishing

### Saadiyat Reserve Phase 1, Phase 2 & Dunes Interactive Community (Aug 25, 2026)
- [x] Register all user-supplied SDE3 control coordinates and preserve their official per-plot source labels
- [x] Extract all 306 numbered records, plot areas, GFA values, and master-plan hotspot positions from Plots 2–307
- [x] Classify every record from the official vector boundaries as Phase 1, Phase 2, or Phase 3 with no ambiguity
- [x] Preserve Phase 3 as part of Saadiyat Reserve and identify it as the renamed Dunes built-villa phase
- [x] Cross-check the 83 Phase 3 plots against the 83 official World of Aldar Dunes villa IDs
- [x] Extract every Dunes villa's official bedroom count and unit areas without extrapolating between units
- [x] Reuse the existing Aldar Dunes unit records and detail routes rather than duplicating launch inventory
- [x] Upload the official Saadiyat Reserve master plan to permanent storage and build a clickable plan
- [x] Create a unified registry prepared for availability, asking price, owner, and transaction history fields
- [x] Build a Saadiyat Reserve page with phase filters, m² default, sqft toggle, search, area filters, and Cards/Table views
- [x] Link each Phase 1/2 plot and Phase 3 Dunes villa bidirectionally between plan, card/table, details, and map
- [x] Add calibrated map markers for all 306 records while clearly separating official SDE3 controls from derived coordinates
- [x] Add Saadiyat Reserve to the homepage, project navigation, and global search without duplicating Dunes
- [x] Add regression tests for counts, phase separation, Dunes unit mapping, hotspot uniqueness, routes, and map keys
- [x] Verify TypeScript, 194 tests, and desktop/mobile UI before publishing

### Saadiyat Coordinate Source Audit · Four Seasons First, Lagoons Next (Aug 25, 2026)
- [x] Preserve all nine user-supplied official Four Seasons controls and their Villa↔SDN3 mapping: V1→P82, V9→P90, V19→P100, V20→P101, V35→P115, V36→P118, V47→P128, V53→P132, and V56→P129
- [x] Normalize every user coordinate from longitude/latitude input to latitude/longitude storage without rounding away source precision
- [x] Create a source-of-truth matrix for Private Villas, Four Seasons, Jawaher, Golf Views, Saadiyat Beach Villas, St. Regis, Reserve, Huge Plot, and Lagoons
- [x] Preserve every plot with an individual official DCR coordinate and prevent calibrated layers from overwriting it
- [x] Audit currently registered Private Villas / Four Seasons DCR coverage; individual source points remain preserved and direct coordinates have priority
- [x] Keep Jawaher, Golf Views, Saadiyat Beach Villas, St. Regis, Reserve, and Huge Plot on their currently verified coordinate sources unless an authoritative correction is supplied
- [x] Receive Four Seasons villa-number control coordinates from the user and validate them against the official master plan
- [x] Correct Four Seasons numbering and rebuild its calibration from official control points without claiming derived positions as DCR coordinates
- [x] Verify Four Seasons map deep links, cards, and master-plan hotspots after recalibration
- [x] Parse CopyofValanciaInventory2026updating(1).xlsx as Saadiyat Reserve inventory and preserve every source row and sheet name
- [x] Classify Excel rows as built Dunes villas or Phase 1/2 land plots without duplicating the existing 306-record Reserve registry
- [x] Mark green only the rows explicitly listed as Available for Sale in the Excel; keep all other Reserve and Dunes records in neutral phase colours
- [x] Match every available Dunes villa and Reserve plot to its exact card and map marker before attaching a selling price
- [x] Show Available/Selling Price on available Reserve cards and map popups, and show existing Aldar Original Price for Dunes villas
- [x] Add availability, price, and inventory-type filters to the unified Saadiyat Reserve Cards/Table page
- [x] Inventory available Saadiyat Lagoons DCR coordinates: none are currently registered, so no calibration is performed from guesswork
- [x] Preserve five user-supplied Al Ghaf DCR controls: 139-01→P2944, 138-01→P2945, 122-01→P2961, 097-01→P2962, and 063-01→P2972; retain P2973 as unlinked until its unit name is confirmed
- [x] Resolve cluster names and register the six new Al Ghaf controls: 241-03→P3077, 230-03→P3066, 169-03→P3252, 377-03→P3272, 288-03→P3116, and 277-03→P3115
- [x] Register the confirmed Al Ghaf controls: 230-02→P2106, 197-02→P2095, 201-02→P2125, 213-02→P2113, and 212-02→P2114
- [x] Register Al Ghaf controls: 071-02→P3631, 086-02→P3631, 124-02→P3578, and 191-02→P3521; deduplicate the shared P3631 coordinate for calibration weighting
- [x] Register Al Sidr controls: 099-01→P2583, 033-01→P2749, and 334-01→P2836; retain 005-05→P2777 as an unassigned source row until the Aldar unit alias is confirmed
- [x] Register additional Al Sidr controls: 317-01→P2836, 311-01→P2813, 244-01→P2791, 113-02→P3958, 086-02→P4048, 040-02→P4074, 004-02→P3971, 232-02→P3915, and 135-02→P3936; deduplicate shared P2836 for calibration weighting
- [x] Register Ethir controls: 138-01→P2582, 139-01→P2514, 154-01→P2498, 171-01→P2481, 017-01→P2463, 032-01→P2410, and 049-01→P2427
- [x] Collect at least three distributed official controls for Al Sidr and Ethir before fitting any Lagoons transformation
- [x] Refit the Lagoons master-plan shape to official controls with separate affine models: Al Ghaf 5.6m, Al Sidr 5.0m, and Ethir 5.5m LOO RMSE
- [x] Preserve topology, retain direct SDE3 controls verbatim, label derived points as master-plan calibrated, and avoid fabricated positions for source rows without map geometry
- [x] Run TypeScript, 196 full tests, desktop Four Seasons/Reserve/Lagoons deep-link verification, and mobile map-shell verification before publishing

### Lagoons Hidden Phase SL9 DCR Import (Aug 25, 2026)
- [x] Inspect SDE3_2000.pdf as the canonical first DCR in the provided range and preserve its plot number, areas, boundary coordinates, centroid, and document URL
- [x] Probe every DCR identifier from SDE3_2000 through SDE3_2407 and record available, missing, or inaccessible documents without assuming continuity
- [x] Download and register each available SL9 DCR in permanent storage and the distinct `lagoons-hidden-sl9/plot-*` data registry
- [x] Extract every available DCR plot’s plot number, official land area, coordinates, Google Maps link, DMT link, and project/phase evidence
- [x] Add Lagoons Hidden Phase SL9 as a distinct community with Cards/Table views and DCR links; do not fabricate availability or prices
- [x] Add SL9 plots as direct official map markers and link map, cards, table, DCR, DMT, and Google Maps bidirectionally
- [x] Inspect SDE3_1966.pdf independently and identify its Aldar community and SL phase only from source evidence: Saadiyat Lagoons, SL13-VI-016
- [x] Add focused tests for imported count, unique plot keys, DCR sources, coordinate accuracy, and map links
- [x] Verify TypeScript, 206 full tests, and desktop/mobile UI before publishing

### Unified Map Property Cards (Aug 25, 2026)
- [x] Audit every marker family and compare its map card fields with its corresponding property card/detail data
- [x] Standardize map cards to display property number, land area, BUA/internal area where sourced, bedrooms, original price, selling/available price, and documented status
- [x] Preserve unknown values as omitted/not available instead of fabricating values on map cards
- [x] Ensure later edits to a property’s underlying data flow to the same corresponding map card
- [x] Add map-card regression tests covering Lagoons, Reserve, Four Seasons, St. Regis, Jawaher, SBV, Golf Views, Hidd, Private Villas, and SL9
- [x] Verify desktop/mobile map cards and publish with SL9

### Map Colour Semantics (Aug 25, 2026)
- [x] Reserve green exclusively for units or plots with a documented Available/Listed status in every map layer
- [x] Replace green project-layer colours, including Saadiyat Beach Villas, with distinct non-green project colours
- [x] Keep map legend, marker colours, and information-card availability language consistent with the green-only availability rule
- [x] Add regression tests for the colour semantics and verify representative desktop/mobile markers

### Hidd Al Saadiyat Official Street Controls (Aug 25, 2026)
- [x] Register direct coordinates for Street 2 Villas 1, 2, 14, 20, 22, and 25 from the user-supplied sources
- [x] Register direct coordinates for Street 1 Villas 1, 2, 12, 22, and 23 from the user-supplied sources
- [x] Register direct coordinates for Street 3 Villas 1, 2, 19, 22, and 26 from the user-supplied sources; retain 22/1 as an unmatched source address because it is not a distinct current Hidd record
- [x] Register direct coordinates for Street 4 Villas 1, 2, 23, 24, and 26 from the user-supplied sources
- [x] Treat Al Dhiba Street as Boulevard while preserving the supplied house numbers 40, 52, 80, 106, 116, 118, and 122
- [x] Use all matched Hidd points as fixed controls to recalibrate the full master-plan shape and derive remaining villa locations in master-plan order
- [x] Inspect the user-supplied Yandex map location and use it only for visual location verification, not as a substitute for the control coordinates
- [x] Verify Hidd direct map links, master-plan alignment, and card/map consistency after the full-shape recalibration

### Hidd Control-Point Reconciliation (Aug 25, 2026)
- [x] Compare the resent Street 1–4 and Al Dhiba control list against `hidd-controls.json`: all resent coordinates match exactly
- [x] Preserve 22/1 Street 3 as an unmatched source address until a distinct current villa record is identified
- [x] Re-run the Hidd calibration only if a supplied coordinate differs from the saved official control value; no difference was found
- [x] Keep the previously verified direct Hidd map cards; no implementation correction was required

### Saadiyat Lagoons SL13 and Adjacent DCR Range (Aug 25, 2026)
- [x] Import SDE3_1966–1981 as Saadiyat Lagoons SL13 only after each DCR confirms its Aldar phase label; 12 accessible DCRs are published and the unavailable identifiers are not fabricated
- [x] Probe SDE3_1982–1999 individually and classify each available DCR by its document-stated Aldar phase: all 18 are SL10
- [x] Save available DCRs and extract plot number, land area, GFA, DMT link, Google Maps link, and direct centroid
- [x] Build distinct phase communities/cards/tables and add direct DCR markers to the Interactive Map
- [x] Add routes, search, navigation, homepage entries, and regression tests for every confirmed phase
- [x] Verify TypeScript, 208 full tests, and desktop/mobile UI before publishing

### SL10, Lagoons Card Visibility, and Hidd Yandex Alignment Fix (Aug 25, 2026)
- [x] Confirm why SL10 is absent from the published project registry and import the DCR-confirmed SDE3_1982–1999 range as SL10
- [x] Ensure all Lagoons card variants display documented Original Price, land area, BUA/total area, bedrooms, and direct DCR links where available
- [x] Ensure external project cards and map cards navigate to the exact unit card/detail rather than an unrelated or generic destination
- [x] Reconcile Hidd numbered villa locations against Yandex evidence and use the supplied address controls to correct the full-shape sequence; direct controls remain exact and all remaining points are visibly labeled as derived from the calibrated shape
- [x] Verify representative SL10 and Lagoons cards and map deep links on desktop and mobile; retain Hidd verification as a separate open item

### Full Interactive Map Property Cards (Aug 25, 2026)
- [x] Audit every Saadiyat marker family for unit/plot number, developer/project, original price, resale/available price, land area, BUA/internal area, bedrooms, status, transactions, and DCR source coverage
- [x] Replace summary-only map popups with a reusable full property-card layout that omits only truly unavailable fields
- [x] Ensure all visible property data on the source card flows into the corresponding map popup without requiring Full Details
- [x] Add direct DCR links in every popup where a DCR source is registered; retain DMT and Google Maps links where available
- [x] Preserve Full Details and Project Table only as secondary navigation, not the sole way to see key details
- [x] Add regression tests for the full-card fields and DCR links across all Saadiyat marker families
- [x] Verify representative desktop popups, mobile map-shell behavior, TypeScript, and 210 tests before publishing

### Ethir Record Correction (Aug 25, 2026)
- [x] Remove the unsupported Ethir 230-01 and 231-01 pending-location references from the project record; do not create or map either unit. Audit confirmed both are already absent from the Lagoons registry and Interactive Map.

### Unified Property Editing, Access Control & Audit Trail (Aug 25, 2026)
- [x] Audit the existing editable listing model, property-card components, map popup architecture, and master/admin authorization paths
- [x] Store per-property overrides in the database for sale availability, sale price, land area, built-up area, owner name, owner mobile, rental availability, and rent price
- [x] Add validated master/admin update procedures, preserving owner data for expressly authorized viewers only
- [x] Create granular Master Admin access grants by area/project and visibility controls for original prices, owner names, and owner mobile numbers
- [x] Record append-only audit events for successful email sign-ins and property/access edits with actor, timestamp, entity, changed fields, and before/after values where applicable
- [x] Build one reusable property editor accessible from property cards, detail views, tables, and Interactive Map cards
- [x] Apply database overrides to the Interactive Map and shared card components immediately after successful edits; source records remain unchanged
- [x] Build Master Admin screens for managing user grants and reviewing the activity/audit log
- [x] Add unit and integration coverage for persistence, authorization, visibility, validation, audit logging, and map/card propagation
- [x] Verify build contracts, TypeScript, and 212 automated tests before publishing; screenshot validation reached the email gate because no test session is authenticated

### Mobile Master Admin Header Access Fix (Aug 25, 2026)
- [x] Diagnose the clipped/non-clickable Master Admin account menu in the mobile header
- [x] Keep the mobile account trigger and dropdown inside the viewport with an accessible hit target and dashboard access
- [x] Verify the repaired header at a narrow 390×844 mobile viewport, run TypeScript, then publish

### Hidd Al Saadiyat Yandex Location Reconciliation (Aug 25, 2026)
- [x] Audit every current Hidd villa record, official user control, and existing coordinate source before changing any position
- [x] Extract only Yandex locations that expose an unambiguous matching villa number and street address
- [x] Apply 366 exact Yandex house-address matches with a distinct source label; retain 28 user-supplied controls as higher-priority sources
- [x] Keep 50 unmatched/ambiguous and 17 out-of-envelope candidate addresses out of the map pending user confirmation instead of guessing
- [x] Verify changed Hidd markers/cards, run regression tests, and publish a coverage report

### Hidd Full Interactive Map Card (Aug 25, 2026)
- [x] Show the complete documented Hidd villa card in the map popup: villa/street, location source, areas, sale/rental state and price where recorded
- [x] Show documented owner and tenant identity/contact fields only for Master Admin or users with the matching explicit field grants
- [x] Verify the popup has no hidden critical property details for authorized users and does not leak owner/tenant data to other roles

### Nudra by IMKAN Community Import (Aug 26, 2026)
- [x] Inspect the supplied factsheet, site plan, availability list, municipal export, and secondary source files to establish a source-backed 38-record registry
- [x] Add Nudra by IMKAN as a distinct community with original price, payment-plan wording, and documented secondary/resale state kept separate
- [x] Match prices and municipal transactions only to uniquely identified villas/plots by documented unit number and land area; retain six ambiguous rows as unmatched
- [x] Use the supplied Villa 1 Yandex point and 17 exact Yandex house-address matches; preserve the 20 unresolved addresses and unassigned mansion points without guessing unit codes
- [x] Add sourced Nudra cards, Cards/Table view, project route, source actions, and Interactive Map address cards that explicitly state when a B/D/S unit crosswalk is unavailable
- [x] Add tests for registry count, source integrity, price/transaction matching, map markers, and non-fabrication safeguards
- [x] Verify desktop/mobile views, TypeScript, and 216 full tests, then publish

### Hidd Street 11 and Full Map Card Follow-up (Aug 26, 2026)
- [x] Extract the supplied Yandex street-address results for Street 11 examples, Street 1 examples, and houses 71, 73, 105, 107, 117, and 123
- [x] Match each confirmed address to an existing Hidd villa record before updating any coordinate; preserve unmatched links as source notes
- [x] Rebuild Hidd coordinates with the new exact controls while retaining all prior user controls as higher priority
- [x] Audit and fix the Hidd map popup so authorized users see every documented property, price, owner, tenant, and tenancy field directly in the card
- [x] Add regression coverage, mobile/desktop verification, full tests, and publish

### Hidd Complete Yandex Index Coverage & Map-Card Parity (Aug 26, 2026)
- [x] Inventory all 468 Hidd villa/street keys and classify each coordinate as user control, direct Yandex address, or calibrated fallback
- [x] Query the Yandex index for every Hidd villa/street key lacking a direct location and accept only exact address matches within Hidd
- [x] Replace 8 calibrated fallback positions with new direct Yandex matches; retain 60 positions as explicitly labelled calibrated fallback because the index did not provide an exact Hidd house address
- [x] Audit all map marker families so each popup receives every documented property card field, including land/BUA, original/current/resale/rental price, transactions, and protected owner/tenant fields
- [x] Add map-card parity and Hidd direct-location coverage tests, verify representative mobile/desktop map shell, full tests, and publish

### Hidd Reverse Yandex Index Completion (Aug 26, 2026)
- [x] Generate reverse-lookup inputs from every remaining calibrated Hidd coordinate with its villa/street key
- [x] Query Yandex at each location and accept an address only when its house number and street match the existing Hidd key exactly
- [x] Upgrade 9 confirmed points to a direct Yandex source, retaining 51 other coordinates as explicitly labelled calibrated fallback
- [x] Re-check the full Hidd map card for Master Admin; data is shown directly whenever it exists in the source or a stored property override, and unknown fields remain omitted
- [x] Run full regression tests, verify the map shell, and publish

### Card-to-Map Links, Refresh Reliability & Street 11 Verification (Aug 26, 2026)
- [x] Audit every reusable property-card family for a stable marker key and add a direct `View on Interactive Map` action where coordinates exist
- [x] Make every `Full Details` action deep-link to the exact originating unit/plot, preserving the selected card context for Lagoons, Hidd, and all other property families
- [x] Diagnose and fix marker initialization so `/map` waits for AdvancedMarkerElement and recalculates its mobile viewport after a browser refresh
- [x] Re-open the Street 11 Hidd index records and mark the user-confirmed Street 11 villa row as Sea View without assigning an unverified extra address
- [x] Add tests for card-to-map deep links, direct Hidd details, matched shared-sheet availability, and verified Street 11 Sea View labels
- [x] Verify desktop/mobile map shell, TypeScript, 218 full tests, then publish

### Saadiyat Lagoons Availability Import (Aug 26, 2026)
- [x] Inspect the supplied availability workbook and preserve each row's unit identifier, price, status, and source date
- [x] Match rows only to exact Lagoons villa keys; retain 9 ambiguous villa rows and 4 unmatched/non-villa rows outside availability publishing
- [x] Show the 10 exact matched villas as Available for Sale in Lagoons cards, table, filters, and Interactive Map with the documented price
- [x] Add source/matching regression coverage and verify green availability semantics before publishing

### Private Owners VIP and Building Plots SDW4 DCR Import (Aug 26, 2026)
- [x] Probe and extract the supplied SDN3_1, 2, 3, 4_5, 6, 7, 8, and 9 DCRs as Private Owners VIP, preserving SDN3_4_5 as one merged-document record; SDN3_7 is unavailable
- [x] Probe SDW4_C1 through SDW4_C32 independently, publishing 26 accessible documents and preserving 6 unavailable identifiers without fabrication
- [x] Extract each confirmed DCR's plot number, land area, max GFA, official UTM boundary-centroid location, and direct DCR/Google source links
- [x] Build separate Cards/Table community pages, direct detail links, and Interactive Map markers for the two new source-backed communities
- [x] Add project navigation/search entries and regression tests for counts, DCR links, coordinates, and no-invented-availability rules
- [x] Verify desktop/mobile views, TypeScript, and 227 full tests, then publish

### Lagoons Owner, Availability and Price Data Import (Aug 26, 2026)
- [x] Inspect the supplied Lagoons workbook: it contains 23 Lagoons rows only, with unit, availability, price, bedrooms, area and responsible listing agent; Noya rows and owner/mobile fields are not present
- [x] Match availability and price only to exact units: 10 exact villas are published, while 9 ambiguous villa rows and 4 unmatched/non-villa rows remain excluded
- [x] Make confirmed availability/price visible in matching cards and map popups; no owner/mobile override was written because the workbook supplies neither field
- [x] Verify no owner/mobile leakage: no owner/mobile source value exists in this workbook, and the protected owner-field policy remains in effect for future values

### DCR Phase Grouping by SL Type (Aug 26, 2026)
- [x] Inventory every currently stored DCR record: explicit source evidence exists only for SL9, SL10, and SL13; Private Owners VIP and Building Plots SDW4 contain no SL designation
- [x] Create source-confirmed Lagoons groups from Aldar card codes: SL2, SL3, SL4, SL5, SL7, and SL8; retain Private Owners VIP and Building Plots SDW4 as their own ungrouped DCR communities
- [x] Give each phase group Cards/Table views and direct map/detail/DCR links where an individual DCR source is registered, displaying its documented type rather than an assumed type
- [x] Add navigation/search and regression tests for phase membership, source labels, map markers, and no-invented phase rules
- [x] Verify full flows on the mobile Lagoons page, TypeScript, and 231 tests before publishing

### Lagoons SL Groups from Unit Card Codes (Aug 26, 2026)
- [x] Audit Lagoons card codes and fields to identify the source-backed SL phase and villa type for every unit
- [x] Generate SL2, SL3, SL4, SL5, SL7, and SL8 from those card codes, keeping unparseable codes ungrouped
- [x] Add group-specific Cards/Table views, type labels, direct unit details, and Interactive Map navigation
- [x] Add regression tests for phase parsing, counts, group routes, map labels, and no-invented type/phase assignments
- [x] Verify the grouped UI shell on desktop/mobile, TypeScript, and 231 tests before publishing

### Lagoons Owners and Nudra Location Completion (Aug 26, 2026)
- [x] Inventory every available source for Lagoons owner name/mobile: no Lagoons owner override exists in the database, and the supplied workbook contains listing-agent labels but no owner name/mobile
- [x] Show confirmed Lagoons owner data consistently in the external villa card and Interactive Map popup for authorized roles only; the fields remain empty until a source is supplied
- [x] Inventory every Nudra unit/plot and classify each position as a supplied Yandex control, exact address match, or unassigned source point
- [x] Link only evidence-backed Nudra locations to their S/B/D villa or Private Mansion records; the official site plan does not publish a house-number-to-S/B/D crosswalk, so unresolved Yandex addresses remain explicit unassigned source points instead of receiving invented unit links
- [x] Add regression coverage for protected Lagoons owner-card parity and preserve existing Nudra location/unit-integrity safeguards
- [x] Verify TypeScript and 231 full tests; a precise Nudra address-to-unit crosswalk remains the only source-data blocker

### New Lagoons and Noya Owner Workbook Import (Aug 26, 2026)
- [x] Inspect `Newlagoonsandnoya.xlsx` for unit keys, owner names, owner mobile numbers, prices, and availability across Lagoons and Noya projects
- [x] Match 1,533 sensitive owner rows to exactly one canonical unit key: 694 Lagoons and 839 Noya. Retain 254 ambiguous and 283 unmatched rows outside database writes
- [x] Persist confirmed owner records as protected listing overrides and surface them on authorized external cards and Interactive Map cards
- [x] Verify Master Admin visibility, delegated field permissions, privacy for other users, and 1,533 import audit events; owner fields remain protected for non-authorized roles
- [x] Run TypeScript and 233 tests, verify the protected card/map loading paths, and publish

### Map Card Owner Mobile Visibility Fix (Aug 26, 2026)
- [x] Trace imported Lagoons/Noya owner fields from database listing rows through the map listing index and marker merge
- [x] Show owner name and owner mobile automatically near the top of the exact map card for Master Admin and explicitly authorized users
- [x] Keep owner fields absent from map HTML and API results for users without owner-data permission
- [x] Add regression coverage for imported Lagoons owner records and authenticated Map Card refetch behavior before publishing

### Lagoons Counts, Loading State and Card Click Reliability (Aug 26, 2026)
- [x] Fix Ethir, Al Sidr, and Al Ghaf 4/5/6-bedroom and corner/single-row counters to use the loaded Aldar villa fields instead of transient zeros
- [x] Show a loading state while cluster data is pending and never flash `No villas match this filter` before the first response arrives
- [x] Make the full Lagoons villa card a reliable first-click navigation target without nested interactive elements swallowing the click
- [x] Add regression coverage for non-zero village statistics, loading/empty-state separation, and exact first-click unit navigation
- [x] Verify TypeScript and 251 full tests after the desktop/mobile interaction fixes

### All-Community External Card and Map Card Parity (Aug 26, 2026)
- [x] Audit every community marker family and external-card family against one canonical property-field checklist
- [x] Ensure documented areas, prices, status, rental data, transactions, DCR/source links, and authorized owner/tenant fields appear in both locations where the source supplies them
- [x] Ensure every external card links to its exact map marker and every map card links to the exact external unit card
- [x] Add regression coverage that fails when a community loses a documented core field or exact bidirectional link
- [x] Verify representative source contracts for Lagoons, Hidd, St. Regis, Jawaher, SBV, Golf Views, Four Seasons, Reserve, Nudra, and DCR-only communities

### Map Card Outside-Click and Ethir Published-State Fix (Aug 26, 2026)
- [x] Close the active Google Maps InfoWindow immediately when the user taps/clicks empty map space outside the card
- [x] Clear the selected `plot` deep-link state when a card is dismissed without interfering with marker clicks or card buttons
- [x] Recheck the published Ethir bedroom counters and loading flow using the same data path used by the live page
- [x] Add regression coverage for outside-click dismissal and the published Ethir counts/loading state
- [x] Verify the mobile map shell, TypeScript, and 254 full tests before publishing

### Hidd Street 11 Full Yandex Reconciliation (Aug 26, 2026)
- [x] Register the supplied Yandex links for Villa 1 and Villa 27 on Street 11 as direct source controls
- [x] Enumerate every Street 11 villa key in the Hidd registry and query its Yandex house address independently
- [x] Replace incorrect calibrated Street 11 positions for 26 completed exact matches while preserving unrelated Hidd controls
- [x] Verify the accepted sea-facing Street 11 sequence and exact Villa 27 deep link on the Interactive Map; keep unresolved positions labelled calibrated
- [x] Add regression coverage, run TypeScript and 254 full tests, and publish
- [x] Accept only completed high-confidence Yandex matches from the batch; skip 36 failed, incomplete, medium-confidence, or conflicting results without delaying publication

### Lagoons Live Map Card Owner Data Fix (Aug 26, 2026)
- [x] Select the real imported key `lagoons/AlSidr-111-02` and prove its database villaKey, map marker key, and API response key match
- [x] Fix auth timing and marker refresh so Map Card rebuilds after protected owner overrides arrive; cache permissions by community and avoid per-row grant queries for Master/Admin
- [x] Show owner name/mobile automatically for Master Admin and explicitly authorized users while omitting both from public/unauthorized API results
- [x] Add a live-database integration regression for `lagoons/AlSidr-111-02`, run TypeScript and 256 full tests, and verify the mobile map shell before publishing

### Saadiyat Resale Hub Redesign, Availability and Sales Sync (Aug 27, 2026)
- [x] Replace the header pin with the approved Saadiyat logo and identify the site as a Saadiyat-wide resale hub rather than a St. Regis site
- [x] Remove duplicated Saadiyat Resale Hub home-page wording and refine typography/spacing to a restrained editorial real-estate treatment
- [x] Build a sales-oriented Sync page showing every currently available Aldar Inventory unit with project, core property facts, latest price/status, source, and exact card/detail link
- [x] Make Available with NAS automatically reflect each property whose stored availability status is Available, across all supported communities, with a clickable results view
- [x] Reconcile Available with Aldar Resale and Other Brokers against source-backed listings; do not label scraped/unknown data as available without a documented source
- [x] Enhance daily and manual Aldar sync with change summary, timestamp, unit-level change log, user-requested Sync action, and Master Admin notification summary
- [x] Restrict the scheduled sync endpoint to a verified Heartbeat cron identity and record its authenticated task UID for traceability
- [x] Add tests for source counts, availability-source routing, deep links, sync change summaries, and mobile/desktop sales workflow
- [x] Verify the redesigned header/home, availability drill-downs, and Sync page on mobile and desktop, then publish

### Saadiyat Logo with Website URL (Aug 26, 2026)
- [x] Create a clean high-resolution rendition of the supplied Saadiyat logo on a white background
- [x] Add `saadiyatresale.com` beneath the logo in a refined, legible brand-aligned treatment
- [x] Review and deliver the final 2048×2048 image asset

### Saadiyat Resale Hub Redesign, Availability and Sales Sync (Aug 27, 2026) — duplicate staging record, superseded
- [x] Duplicate task block retained for audit history; implementation is tracked in the primary block above.

### Aldar Official Unit Link Integrity and 404 Fix (Aug 27, 2026)
- [x] Audit every Aldar unit record for its official `aldar_link`, duplicate/mismatched URL association, and link availability without fabricating URLs
- [x] Make each Aldar unit card and Sync sales-desk row open the exact official Aldar URL only when it is source-backed; retain internal detail access separately
- [x] Hide or label a missing/invalid official Aldar URL rather than exposing an unsafe 404 destination
- [x] Add regression coverage for official-link forwarding, missing links, and project/unit mismatch safeguards
- [x] Verify representative Aldar cards and Sync rows on mobile and desktop, run full checks, and publish

### Aldar Current Unit URL Format Correction (Aug 27, 2026)
- [x] Support documented current World of Aldar links that use the short unit code, path segment `/0`, and floorplan query parameters
- [x] Preserve strict project and unit matching while allowing the official current URL format instead of falsely labelling it unavailable
- [x] Add a regression test for `THESOURCETERRACES-R22-05-02` and validate the supplied official URL before publishing

### Aldar All-Project Current Unit URLs (Aug 27, 2026)
- [x] Inventory every Aldar project with active units and define a verified current unit URL format per project
- [x] Verify each project format against official Aldar responses and record source provenance without guessing a unit URL
- [x] Apply verified current URLs to cards, search results, and Sync while retaining the legacy URL only where it still resolves
- [x] Add project-level regression tests, run full validation, and publish the all-project link coverage

### Interactive Map Fixed Frame and Touch Controls (Aug 27, 2026)
- [x] Keep the site Header and selected-unit card in a fixed, readable interface frame while browsing the Interactive Map
- [x] Restrict pinch, wheel, and drag zoom interactions to the Google Map canvas without browser-page zoom or accidental header/card scaling
- [x] Center and highlight the selected unit, with a responsive adjacent card panel that preserves access to all documented fields
- [x] Add regression coverage and verify touch/desktop interaction, then publish

### Interactive Map Smart Unit Search and Multi-Project Access (Aug 27, 2026)
- [x] Match map searches intelligently against normalized project names and unit numbers even when the user omits hyphens, spaces, or prefixes
- [x] Present direct unit-result options that center, highlight, and open the selected map card
- [x] Allow Master Admin to grant a user several project-level and/or classified phase-level access permissions without replacing their existing grants
- [x] Preserve all field-level permissions and audit every added, changed, or revoked project/phase grant
- [x] Add regression coverage, verify the Master and limited-user flows on desktop/mobile, then publish

### Faya and One Saadiyat Official Floor Plans (Aug 27, 2026)
- [x] Inspect the currently configured sources and official Aldar data paths for floor plans belonging to Faya Al Saadiyat and One Saadiyat
- [x] Cancelled by user on 28 Aug 2026 — do not extract or preserve Faya/One floor plans, even where a future unit/type mapping becomes available
- [x] Cancelled by user on 28 Aug 2026 — do not add Faya/One floor-plan actions to cards or unit details
- [x] Cancelled by user on 28 Aug 2026 — do not continue related source/mapping verification or implementation

### Smart Global Unit Search for Aldar Codes (Aug 27, 2026)
- [x] Normalize Aldar project aliases, building codes, and unit numbers in the homepage search, including inputs such as `SC 362`
- [x] Show the matched unit's documented property type, project, unit code, and direct card action as selectable search options
- [x] Apply equivalent normalized matching across Aldar projects without inventing a unit association or a property type
- [x] Add regression coverage, verify homepage and mobile search, then publish

### Aldar Live-Link Priority Repair Across Cards (Aug 27, 2026)
- [x] Diagnose why the Sustainable City unit card still sends `SC-YN7-TH-362` to its legacy URL instead of the supplied current Aldar URL
- [x] Make every Aldar card, search result, unit detail, and Sync row prioritize the verified current project/unit URL over a stale legacy URL
- [x] Run a project-wide live-link audit and retain a clear unavailable state only where no current official unit page exists
- [x] Add regression coverage, verify the Sustainable City search-to-Aldar flow, and publish

### Aldar Production Gateway Current-Link Redirect (Aug 27, 2026)
- [x] Bypass server-side availability preflight only for a generated current URL that matches a project/unit rule already verified, preventing a false 410 from the production gateway
- [x] Keep the preflight and unavailable state for legacy source URLs and unknown/unverified project-unit combinations
- [x] Add regression coverage and verify the published Sustainable City button redirects to the exact supplied Aldar URL

### Aldar Browser-Verified Current Links (Aug 27, 2026)
- [x] Redirect every generated current URL with a verified project/unit rule directly to the browser, avoiding false negative server-side preflight responses
- [x] Retain server preflight for legacy-only links and unavailable states for explicit withdrawals or unknown project/unit formats
- [x] Add regression coverage and verify current-link routing across Sustainable City, Saadiyat, Fahid, and Other project cards

### Four Seasons Interactive Map Controls Correction (Aug 27, 2026)
- [x] Compare every new user-supplied Four Seasons villa, plot, and coordinate control against the published villa-to-plot registry and identify conflicts before location writes
- [x] Apply each non-conflicting exact SDN3 control in latitude/longitude storage order and preserve it as a user-supplied official coordinate source
- [x] Recalibrate only derived Four Seasons markers from the confirmed controls; do not reassign a villa or plot where the supplied data conflicts
- [x] Add coordinate and map-card regression coverage, verify the selected villas on desktop/mobile, and publish

### Four Seasons Confirmed Plot 101 and 96 Assignments (Aug 27, 2026)
- [x] Record the user confirmation that Plot 101 belongs to Villa 20 and Plot 96 belongs to Villa 15
- [x] Apply those two direct SDN3 controls and recalibrate only the remaining derived markers
- [x] Leave only Villa 10 and Villa 16 without an inferred plot reassignment; the Villa 34/35 Plot 115/116 contradiction was resolved by the user's later confirmation
- [x] Add regression coverage, validate cards/map deep links, and publish

### Four Seasons Confirmed Plot 115 and 116 Assignments (Aug 27, 2026)
- [x] Record the user confirmation that Villa 34 belongs to Plot 115 and Villa 35 belongs to Plot 116
- [x] Apply the confirmed Villa 34 and Villa 35 controls, retaining only Villa 10 and Villa 16 without a plot reassignment
- [x] Recalibrate, test direct map/card links, and publish the confirmed locations

### Interactive Map Compact Collapsible Header (Aug 27, 2026)
- [x] Reduce the vertical footprint of the fixed map header without removing navigation or account access
- [x] Add a keyboard-accessible arrow control that collapses the header and visibly restores it from the map canvas
- [x] Reflow the map and selected-unit panel on header collapse/restore so available viewport space is immediately used
- [x] Add regression coverage, verify phone and desktop states, and publish

### Interactive Map Project Filters in Collapsible Header (Aug 27, 2026)
- [x] Identify the existing colored project filter strip and remove its duplicate placement below the map header
- [x] Present project names and their existing colors in a compact header row with controls to hide and restore the row
- [x] Preserve multi-project filtering, selected-state visibility, map reflow, and selected-card behavior in both header states
- [x] Add regression coverage, verify phone and desktop controls, and publish

### Hidd Property Finder Rental Matching (Aug 27, 2026)
- [x] Collect documented Hidd rental listings from the supplied Property Finder results and retain their source URLs, plot areas, and property facts
- [x] Match listings to Hidd system units using documented plot area as the primary key and flag non-unique or incomplete matches
- [x] Report only confirmed unit numbers and clearly distinguish ambiguous, unmatched, or stale source listings

### Project Recovery ZIP (Aug 27, 2026)
- [x] Create a dated ZIP recovery archive of the Saadiyat project source, source data, migrations, and documentation
- [x] Exclude dependency folders, VCS metadata, logs, build artefacts, and environment secrets from the recovery ZIP
- [x] Verify archive integrity and attach it for download

### Inventory History Daily Unit Change Table (Aug 27, 2026)
- [x] Audit stored inventory events and existing history procedures for unit, project, date, old/new status, price-change, and internal detail-link data
- [x] Add a source-backed daily event query with project/status/date filters and an exact unit-detail link for every displayable event
- [x] Add a readable desktop table and mobile card presentation to Inventory History, with every unit row actionable
- [x] Add regression coverage, validate the event table and links, then publish

### Inventory Price Changed Filter (Aug 28, 2026)
- [x] Add a Price changed filter to the Inventory sales desk and link it to recorded `price_change` events
- [x] Preserve project/unit search, exact card links, and a clear empty state when no historical price movement exists
- [x] Add regression coverage, validate on desktop/mobile, and publish

### Email-Only Sign-In with Passwords and Session Preservation (Aug 28, 2026)
- [x] Audit the existing Google/Manus OAuth, email gate, passcode fallback, session-cookie, and allowlist paths before changing authentication
- [x] Add password-hash based sign-in for allowed email accounts and remove the shared passcode entry point for new logins
- [x] Retain Google/Manus OAuth for allowed email identities and preserve current valid device sessions without forced sign-out
- [x] Set Ayman as Master Admin and configure the supplied Hamzeh and Jamal email/password accounts with the intended role
- [x] Add auth, role, and session-preservation regression coverage; verify sign-in paths and publish

### Operational Property Listings and Bitrix24 Two-Way CRM Sync (Aug 28, 2026)
- [x] Deferred by user on 28 Aug 2026 — do not request Bitrix24 portal/entity/authentication decisions until the user explicitly resumes the CRM task
- [x] Audit `villa_listings`, `availability_listings`, property editing controls, Admin Listings, map marker merge, and audit records; define one stable project/phase/unit-or-plot identity with source provenance
- [x] Redesign Master Admin Property Listings as the operational workspace for documented available inventory, source labels, status, price, project/phase, and protected owner data for authorized viewers
- [x] Make status, availability, price, and permitted owner-data edits from Listings, property cards, and Interactive Map write to the same canonical database record and invalidate/rebuild affected cards and markers
- [x] Preserve Aldar and broker-source records without duplicate listing values or unsupported availability overwrites; keep owner/contact fields absent from unauthorized APIs and UI
- [x] Deferred by user on 28 Aug 2026 — no Bitrix24 connection metadata, mapping, sync ledger, reconciliation workflow, or CRM audit implementation is to be created in this task
- [x] Deferred by user on 28 Aug 2026 — no outbound/inbound Bitrix24 sync implementation is to be created in this task
- [x] Deferred by user on 28 Aug 2026 — no Bitrix24 reconciliation or retry screen is to be created in this task
- [x] Deferred by user on 28 Aug 2026 — no Bitrix24-specific test suite is to be created in this task
- [x] Close this Bitrix task record as deferred: email/password validation and the full non-Bitrix test suite were completed; Google OAuth browser validation remains explicitly unverified pending a future user-approved personal-browser session

### Current Priority — Complete Actionable Open Items (Aug 28, 2026)
- [x] Complete the Property Listings source-of-truth audit and synchronization improvements before beginning any Bitrix24 connector or CRM implementation
- [x] Move historical Hidd owner and tenant source fields behind a server-side permission-filtered query so unauthorised browsers never receive raw contact data
- [x] Close the combined sign-in verification record: email/password and cross-page session persistence were verified without revoking devices; Google OAuth requires a future connected personal-browser test and is not claimed as verified
- [x] Verify the clean-session email/password sign-in and cross-page session persistence without revoking any existing devices
- [x] Remove any stale browser-only unlock state that could reveal route content without a current authenticated server session
- [x] Show a neutral session-verification state rather than the sign-in form while a valid server session is still being checked
- [x] Defer Google OAuth browser verification after the personal-browser connection prompt was declined; no OAuth completion was claimed from this session
- [x] Cancel the Faya and One Saadiyat official-floor-plan tasks completely at the user’s request; do not seek, test, or use access codes or official feeds for them
- [x] Retain Bitrix24 as deferred until the user explicitly resumes it and supplies the required portal/entity/authentication decisions

### OneDrive Central Unit Documents and Storage (Aug 28, 2026)
- [x] Use the Microsoft 365 Business OneDrive for `ayman@nasluxury.com` as the verified target drive and create a single `Saadiyat Resale Hub` root folder
- [x] Use the selected root-folder approach: authorize the server-side Microsoft application for the owner’s OneDrive, enforce `Saadiyat Resale Hub` as the only permitted application path, and reject any attempted path outside it
- [x] Obtain explicit user approval for the Microsoft Graph **application** permission required for unattended server-to-OneDrive operation; keep it reserved for the registered Saadiyat application and never collect a Microsoft password or store refresh tokens
- [x] Configure the registered single-tenant Microsoft application to use a server-side client-credentials token and reject every drive path outside the approved `Saadiyat Resale Hub` root
- [x] Enforce the approved per-file policy: Brochures, SPA, and owner documents may use separate OneDrive “anyone with the exact link” view links, while neither folder listing nor unrelated unit files are exposed by the website
- [x] Make the website the only operational editor for listing data and write its approved changes to a structured Excel workbook in OneDrive; direct Excel edits must not update website data
- [x] Define a stable unit-folder and document taxonomy using the canonical project/phase/unit-or-plot key; preserve original file name, OneDrive driveItem ID, version/ETag, MIME type, uploader, classification, and audit trail
- [x] Add a permission-filtered unit-document registry in the database, without storing document bytes or OneDrive credentials in the database, browser, source tree, or logs
- [x] Create and upload a versioned source-code recovery archive to `Saadiyat Resale Hub/Operations/Code-Archives`, excluding secrets, node_modules, VCS data, logs, and build artifacts
- [x] Build the Master Admin document workspace to register, view, replace, classify, and link permitted documents to the exact unit, including SPA and brochure workflows
- [x] Restrict OneDrive administration, document-register listings, upload, archive, and workbook export endpoints to Master Admin so project-scoped users never receive sensitive document metadata or links
- [x] Integrate Microsoft Graph server-side for folder discovery, upload/download, item metadata, and restricted sharing; use only least-privilege approved Microsoft permissions and secure server-side secrets
- [x] Deliberately keep document data one-way: the website creates/updates the Excel register, while direct OneDrive or Excel edits are not imported into the website and therefore need no inbound event subscription or reconciliation timer
- [x] Keep public card/map APIs free of owner-sensitive document URLs and metadata; expose a document only after server-side permission verification
- [x] Add tests for project/unit identity, folder isolation, upload classification, access permissions, safe public document types, and the permitted Microsoft token role
- [x] Defer the representative real SPA and brochure upload/link workflow until a source-backed unit file is available; do not fabricate or attach a non-property file to a unit merely for testing
- [x] Upload and verify a clearly marked non-property technical verification file under `Operations/Verification`, including private file metadata, an individual view link, and audit record; do not classify it as an SPA, brochure, or unit document

### Aldar New-Project Publication Audit (Aug 29, 2026)
- [x] Inspect Aldar’s official Cultural District and Saadiyat/Marasi project listings, including Pulse District, to identify only newly published projects or inventory
- [x] Verify whether each discovered project exposes actual unit identifiers, unit data, availability, or prices; distinguish “Coming Soon” marketing from published inventory
- [x] Compare verified new project identities with the existing Saadiyat project record and report duplicates, additions, and unavailable data without writing any unverified project or price to the site

### Daily Aldar New-Project Detection and Owner Alert (Aug 29, 2026)
- [x] Confirm that the daily Aldar source remains an imported official snapshot; do not claim or implement a live Aldar feed without approved credentials
- [x] Define a stable source identity for a new project and unit, detect it independently of non-unique unit names, and classify its area with explicit review for unknown regions
- [x] Extend the existing 06:00 Gulf daily inventory job to record detected projects, add only source-complete verified projects, and send an owner notification listing project, region, units, availability, and prices when published
- [x] Add review visibility for auto-added projects and tests for duplicate prevention, source completeness, unknown-area handling, and notification-only-on-change behavior

### Yas Bay 360 Public-Data Audit (Aug 29, 2026)
- [x] Inspect the public Yas Bay 360 experience and its browser-accessible data resources for project, unit, location, price, and availability information
- [x] Report only data demonstrably published by Yas Bay, distinguishing presentation assets from structured unit or price data, without importing anything into the site

### Weekly Property Finder Saadiyat Listing Monitor (Aug 29, 2026)
- [x] Deferred by user on 30 Aug 2026 — do not configure a weekly Property Finder monitor until an authorized source is selected
- [x] Deferred by user on 30 Aug 2026 — no community tracking job was created
- [x] Deferred by user on 30 Aug 2026 — no Property Finder listing data, dates, or external identifiers were collected
- [x] Deferred by user on 30 Aug 2026 — no matching process or internal-unit association was run
- [x] Deferred by user on 30 Aug 2026 — no weekly run record, change summary, or notification was configured
- [x] Deferred by user on 30 Aug 2026 — no monitor-specific test suite was created

### ADREC/DARI and ADGM Data-Source Feasibility (Aug 30, 2026)
- [x] Verify whether ADREC/DARI offers an authorized business API, export, or data feed covering registered listings or permits that can identify Property Finder publications
- [x] Verify whether ADGM offers a relevant authorized data product or public registry for Saadiyat residential listing publication data, rather than only company/regulatory records
- [x] Compare the official source scopes with the required Property Finder fields: external listing ID/URL, publication date, advertised price/status, community, unit/plot, and area
- [x] Report the compliant route, access owner, and any remaining data gap before configuring a weekly monitor

### Madhmoun/DARI Authorized Daily Listing Feed (Aug 30, 2026)
- [x] Deferred by user on 30 Aug 2026 — do not open or inspect the company’s authenticated DARI/Madhmoun data source until explicitly resumed
- [x] Deferred by user on 30 Aug 2026 — no source URL, export, field mapping, cadence, or portal data was collected
- [x] Deferred by user on 30 Aug 2026 — do not configure the weekly monitor from public Property Finder or Bayut pages

### Grove Heart Two-Bedroom Plus Maid Correction (Aug 30, 2026)
- [x] Re-extract only Grove Heart records carrying the explicit 2BHK+M source classification, grouped by building, without including Grove Louvre units; neither current Aldar source contains such a Grove Heart record

### Unified Units, Owners, Files, Availability and Granular Access (Aug 30, 2026)
- [x] Audit all current unit records, cards, map markers, owner fields, availability sources, document registers, and project/phase grants before migration
- [x] Define a canonical unit identity and separate ownership, listing/publication, source availability, owner-file, and audit fields without inferring any owner-to-unit association
- [x] Build a Master Admin ownership workspace that links owner records and authorized owner files to the exact villa, apartment, plot, or developer unit and records publisher identity and published-at date
- [x] Make Master Admin owner information available consistently in permitted cards and map panels for every supported community, while keeping it absent for unauthorised API and UI responses
- [x] Extend access grants to support explicit community, building, unit type/bedroom category, and existing phase scopes, plus independent view/edit/owner/document rights
- [x] Restrict unrestricted owner and owner-document visibility to Master Admin; require explicit scoped grants for standard Admin and User accounts
- [x] Support a documented transition to Available for Resale from the unified unit record, preserving developer/broker provenance and audit history
- [x] Add tests for multi-community identity, owner-file privacy, precise building/type permissions, master visibility, publication actors/dates, source separation, and map/card/list consistency
- [x] Apply the safe transition policy to legacy source cards that lack canonical building/type/bedroom metadata: they never match a narrower building/type/bedroom grant; access remains Master-only or requires an explicit documented project/phase grant, with no inferred scope

### FAHAD Data Import, Map Search and Lagoons Owner Register (Sep 2, 2026)
- [x] Inspect and normalize the supplied `FAHAD.xlsx` workbook, preserving every source row and field provenance without inventing building or unit matches
- [x] Match FAHAD rows only to confirmed existing Fahid units; isolate any B1–B11 or unit ambiguity for user review rather than guessing
- [x] Persist confirmed FAHAD property/listing and owner facts through the unified operational model, preserving source provenance and audit events
- [x] Make confirmed Fahid units discoverable through the map search and map cards while keeping owner data permission-filtered
- [x] Reconcile existing confirmed Lagoons owner facts into the Master Owner directory, retain unlinked owners, and support one owner linked to multiple exact properties
- [x] Add tests for FAHAD normalization/matching, source isolation, map-search discoverability, and multi-property Lagoons owner links; validate and publish
- [x] Preserve and expose the exception queue for Master review: 16 FAHAD rows without an exact The Beach House unit, 30 FAHAD source conflicts, 537 unlinked Lagoons/Noya source rows, and 182 Lagoons/Noya source conflicts; no owner-to-unit link is inferred until the Master confirms an exact key

### Unified Master Owner Directory Visibility (Sep 2, 2026)
- [x] Consolidate every owner record, linked property, source import record, and unlinked owner-bearing source row into the protected Master Admin Owners directory, with search across owner, project, unit, and source fields

### Project, Phase and Inventory Access Grants (Sep 3, 2026)
- [x] Let Master Admin grant access by project, phase, and documented inventory class, including Reserve plots only, without granting other Saadiyat projects or units
- [x] Audit every project card with a documented map location to ensure its Map action targets the same canonical unit and map selection; Nudra uses the project map until an exact unit-to-address crosswalk is supplied
- [x] Diagnose and correct mobile map marker loading so valid dots remain visible after direct navigation and refresh without fabricating coordinates

### Urgent Mobile Authentication Recovery (Sep 3, 2026)
- [x] Diagnose the unexpected sign-out and restore Google OAuth initiation and return handling on the published mobile domain without revoking other active sessions; POST is now limited to the large map-permission query instead of every tRPC request
- [x] Verify email/password and Google sign-in entry points, add regression coverage, and publish the verified correction; active email/password sessions renew only in their final 30 days while expired or revoked sessions remain invalid

### Urgent Safari/iPhone Map Canvas Recovery (Sep 3, 2026)
- [x] Diagnose and correct the white Google Maps canvas on Safari/iPhone when marker data has loaded, without changing documented coordinates or map-card links; establish a measurable canvas, Safari viewport reflow, origin referrer policy, and native Google touch handling

### Persistent iPhone Google Maps Load Failure (Sep 3, 2026)
- [x] Replace the current opaque Google Maps loader with an iPhone-compatible, observable loader that reports a real failure state and can retry without changing property data or map links; WebKit confirmed the proxy requires anonymous CORS to send Origin, and the loader now waits for Maps API availability without an early async onload race

### Lagoons Access Repair and Grant Management (Sep 3, 2026)
- [x] Repair the current Lagoons project/phase grant so it reaches only the intended Lagoons scope and map; phase-gated routes now query their exact documented SL scope rather than incorrectly demanding a project-wide grant
- [x] Show every user’s exact project, phase, inventory, field, and document grants beside their name, with Master Admin controls to add, revise, or revoke each grant

### Google Sheet Owner Import (Sep 3, 2026)
- [ ] Review the shared Google Sheet, preserve a private source record in OneDrive, and import owner fields only against confirmed canonical unit keys
- [ ] Surface permitted imported owner facts consistently in the matching unit cards and map cards, while retaining unresolved rows for Master review
