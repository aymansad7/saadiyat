# Faya Al Saadiyat — official floor-plan source check

Checked 27 Aug 2026 against the public Faya project page: https://fayaalsaadiyat.com/

## Observed official-page content

- The page identifies **Aldar Properties** as developer and describes Faya as 6-, 7-, and 8-bedroom villas/mansions.
- Its **Floor Plan** section visibly lists one public plan type: **8 Bedroom Mansion**, with 8 bedrooms, 10 bathrooms, and 8 parking spaces.
- The public plan preview image is: https://fayaalsaadiyat.com/storage/floor-plans/July2025/DupjrpZxlUy0lLmt7oRU.jpg
- The page has a “Download Floor Plan” action, but text extraction did not expose the file URL or an individual Faya unit mapping.
- The World of Aldar individual-unit page remains access-code protected; no configured Aldar API/connector has been found.

## Data-integrity decision

The public page can support a **project/type-level 8 Bedroom Mansion floor-plan source** only. It cannot safely be assigned to a particular Faya unit until the official unit page or an authorized feed confirms the mapping and downloadable file URL.

# One Saadiyat (Baccarat) — official floor-plan source check

Checked 27 Aug 2026 at the official World of Aldar project route: https://world.aldar.com/uae/abudhabi/onesaadiyat

## Observed official-page content

- The public interactive project surface identifies the development as **Baccarat Residences Saadiyat**.
- It exposes two project buildings, **Massena** and **Zénith**, plus amenity routes.
- It does not expose a unit-level floor-plan download link, a floor-plan file URL, or a verified mapping between our Building 1 / Building 2 keys and a plan type.

## Data-integrity decision

No One Saadiyat floor plan is linked in the app yet. An individual World of Aldar unit route after authenticated access, or a permitted API/feed that carries the building/unit mapping and asset URL, is required before assigning a floor plan to any card.

Opening the official **Massena** building on 27 Aug 2026 immediately presented Aldar’s **Enter Access Code** gate before any unit or floor-plan details were available. The public map surface therefore cannot be used to infer a plan asset or mapping.

## Cancelled status

The user cancelled all Faya and One Saadiyat floor-plan work on 28 Aug 2026. No further access-code request, source check, floor-plan extraction, file upload, mapping, card action, or implementation will be performed unless the user explicitly creates a new task for it. This record is retained solely as an evidence and decision history.
