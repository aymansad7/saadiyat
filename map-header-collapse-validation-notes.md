# Interactive Map compact-header validation

Validated in the development browser on 27 Aug 2026.

- The compact fixed site header exposes an accessible control labelled **Hide map header**.
- Activating it removes the header from the layout; the Google Map canvas expands to the top edge rather than leaving the previous header gap.
- A visible **Header** button with a downward chevron remains in the map controls, allowing the header to be restored without leaving the map.
- Map controls, satellite switching, owner/tenant control, and Google Maps controls remain available after collapse.

The restore button was also activated in the browser. It returned the compact header with the hide arrow, while preserving the loaded Google Maps canvas and its current camera position.
