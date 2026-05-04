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
