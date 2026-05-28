# Saadiyat Multi-Community Build — Todo

## Phase 1 — Website restructure (URLs only, no downloads needed)
- [ ] Generate plot manifest (529 villas) with direct DMT URLs
- [ ] Build new `/jawaher` page (83 plots, simple list/grid)
- [ ] Build new `/saadiyat-beach-villas` page with gate tabs
- [ ] Update Landing page (3 live communities)
- [ ] Update SiteHeader nav

## Phase 2 — Test & checkpoint
- [ ] Verify all routes load
- [ ] Verify PDF and MyLand links work for each gate
- [ ] Save checkpoint and deliver

## Phase 3 — Background PDF download (529 files via Wayback)
- [ ] Jawaher 83 (SDN1_49 → 131)
- [ ] Gate 1 — 25 (SDN2_6-1_2 + SDN2_6_3 → 26, also try SDN2_6_1, SDN2_6_2)
- [ ] Gate 2 — 156 (SDN2_1 → 156)
- [ ] Gate 3 — 65 (SDN2_2_1 → 65)
- [ ] Gate 4 — 59 (SDN2_3_1 → 59)
- [ ] Premium Villas — 15 (SDN2_4_1 → 15)
- [ ] Gate 7 — 126 (SDN4_1_1 → 126)

## Phase 4 — Deliver
- [ ] Bundle all PDFs into one ZIP
- [ ] Send final ZIP attachment + final checkpoint


## Password Gate (added 2026-04-21)
- [ ] Create PasswordGate component that shows lock screen when not authenticated
- [ ] Persist successful auth in sessionStorage so it sticks per browser session
- [ ] Wrap App routes with the gate so every page is protected
- [ ] Use password value `062026`
- [ ] Style the gate to match Coastal Atelier design
- [ ] Test and save checkpoint

## Pending (deferred)
- [ ] Confirm if "St. Regis Villas" should be renamed to "Saadiyat Lagoons" OR add Lagoons as a new community
- [ ] Finish File Storage UI testing (FilesPanel + Documents page already wired)

## Backup ZIPs (added 2026-05-08)
- [ ] Inventory all DCR PDF URLs across 3 communities (33 + 83 + 446 = 562 files)
- [ ] Background-download all 562 PDFs via Wayback Machine
- [ ] Parse each PDF to extract bedroom count + plot ID for naming
- [ ] Build `StRegis_Backup.zip` with `StRegis_Plot##_NBR.pdf`
- [ ] Build `Jawaher_Backup.zip` with `Jawaher_Plot##_NBR.pdf`
- [ ] Build `SBV_Backup.zip` with `SBV_Gate#_Plot##_NBR.pdf`
- [ ] Deliver all backup ZIPs to user

## Aldar Lagoons enrichment (added 2026-05-20)
- [x] Inspect Aldar_lagoons.xlsx columns
- [x] Define matching key between Aldar rows and Lagoons villas
- [x] Update Lagoons data file with new fields
- [x] Show new fields on Lagoons cards/detail
- [x] Save checkpoint

## Lagoons villa detail — Key Facts hero (added 2026-05-20)
- [x] Add "Key facts" hero block at top of LagoonsVillaDetail showing Villa number, Original price (without add-ons), Plot area, Total built-up area, Premium finishing (Yes/No), Finishing tone (Warm/Cool/Light)
- [x] Rename "Selling price" label to "Original price (without add-ons)" everywhere it appears
- [x] Remove duplicates from the secondary Aldar inventory grid (since they now appear in the hero)
- [x] Save checkpoint

## Aldar All Saadiyat projects browser (added 2026-05-21)
- [ ] Profile all 19 Aldar_*.xlsx workbooks for columns + building groupings
- [ ] Build TS dataset: ProjectGroup → Project → Building → Unit
- [ ] Map sub-buildings (Mamsha Gardens=7, Art House=3, Louvre=3, Barakat=2, Grove=Hard One/Two, Source I/II/Terraces, Faya I/II, Manarat I/II)
- [ ] Index page /aldar-saadiyat: project grid + filter "Available only" + cross-project unit search
- [ ] Project page: lists its buildings (with available/total counts)
- [ ] Building page: list of units, each card highlights Original price (without add-ons) + Status badge + last update date
- [ ] Unit detail page: hero (price, status+date, beds, plot, BUA) → details table → payment plans
- [ ] Vitest coverage for status badge logic + cross-project "available only" filter
- [ ] Save checkpoint


## Public Resale Filter (May 27, 2026)
- [x] Add public `/resale-search` page accessible without passcode
- [x] Add `publicResale` tRPC router (summary + filtered list)
- [x] Aggregate Aldar Resale workbook + live primary inventory across all areas
- [x] Source / area / bedrooms / price / search / sort filters
- [x] Entry point card on the passcode screen ("No passcode? Browse anyway")
- [x] Vitest coverage for public router + App.tsx bypass invariant
- [x] Save checkpoint


## Restrict Resale Filter to admins only (May 27, 2026)
- [x] Move /resale-search route inside the PasswordGate (no public bypass)
- [x] Convert publicResale router → adminResale (adminProcedure on summary + list)
- [x] Add client-side admin guard on PublicResaleSearch page (redirect / show "admin only")
- [x] Remove "No passcode? Browse anyway" CTA from PasswordGate
- [x] Update vitest: passwordGate test + resale router test for admin-only invariants
- [x] Save checkpoint


## Nas Leggieri Lagoons listings (May 27, 2026)
- [ ] Extract villa numbers + asking price + extras from Seyit Amiri PDF
- [ ] Persist as `nas_leggieri_lagoons.json` server dataset
- [ ] Add `nas-leggieri` source to public resale router with extras (sqft, plot, notes)
- [ ] Show "Available with Nas Leggieri" as a filter option in /resale-search
- [ ] Strip prior generic green "Available" markers on Lagoons villas not in this list
- [ ] Vitest coverage for nas-leggieri data + filter
- [ ] Save checkpoint
